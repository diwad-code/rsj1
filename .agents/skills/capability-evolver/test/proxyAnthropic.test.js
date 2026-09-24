'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const { EvoMapProxy } = require('../src/proxy');

function startStub(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

describe('EvoMapProxy._proxyAnthropic', () => {
  let stub, baseUrl, captured;
  let proxy;

  before(async () => {
    captured = [];
    const handlerImpl = (req, res) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        captured.push({ path: req.url, headers: req.headers, body });
        if (req.url === '/v1/messages-stream') {
          res.writeHead(200, {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
          });
          res.write('data: {"type":"message_start"}\n\n');
          res.write('data: {"type":"message_stop"}\n\n');
          res.end();
        } else if (req.url === '/v1/messages-error') {
          res.writeHead(503, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ error: 'overloaded' }));
        } else {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ id: 'msg_1', content: [{ type: 'text', text: 'hi' }] }));
        }
      });
    };
    stub = await startStub(handlerImpl);
    baseUrl = stub.baseUrl;
    proxy = new EvoMapProxy({
      anthropicBaseUrl: baseUrl,
      logger: { log: () => {}, error: () => {}, warn: () => {} },
    });
  });

  after(async () => {
    await new Promise((resolve) => stub.server.close(resolve));
  });

  it('forwards only x-api-key, anthropic-version, and anthropic-* headers', async () => {
    captured.length = 0;
    const res = await proxy._proxyAnthropic('/v1/messages', { model: 'm', messages: [] }, {
      inboundHeaders: {
        'x-api-key': 'sk-test',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'authorization': 'Bearer should-not-forward',
        'cookie': 'should-not-forward',
        'host': '127.0.0.1:99',
        'user-agent': 'should-not-forward',
      },
    });
    assert.equal(res.status, 200);
    assert.equal(captured.length, 1);
    const sent = captured[0].headers;
    assert.equal(sent['x-api-key'], 'sk-test');
    assert.equal(sent['anthropic-version'], '2023-06-01');
    assert.equal(sent['anthropic-beta'], 'prompt-caching-2024-07-31');
    assert.equal(sent['authorization'], undefined);
    assert.equal(sent['cookie'], undefined);
    assert.notEqual(sent['host'], '127.0.0.1:99');
  });

  it('returns json() for non-streaming responses', async () => {
    const res = await proxy._proxyAnthropic('/v1/messages', { model: 'm' }, {
      inboundHeaders: { 'x-api-key': 'sk' },
    });
    assert.equal(res.stream, null);
    assert.equal(typeof res.json, 'function');
    const j = await res.json();
    assert.equal(j.id, 'msg_1');
  });

  it('returns a stream for text/event-stream responses', async () => {
    const res = await proxy._proxyAnthropic('/v1/messages-stream', { model: 'm', stream: true }, {
      inboundHeaders: { 'x-api-key': 'sk' },
    });
    assert.equal(res.status, 200);
    assert.ok(res.stream, 'stream must be present');
    assert.equal(res.json, null);
    let collected = '';
    for await (const chunk of res.stream) {
      collected += Buffer.from(chunk).toString();
    }
    assert.match(collected, /data: \{"type":"message_start"\}/);
    assert.match(collected, /data: \{"type":"message_stop"\}/);
  });

  it('relays non-2xx status verbatim (no throw)', async () => {
    const res = await proxy._proxyAnthropic('/v1/messages-error', { model: 'm' }, {
      inboundHeaders: { 'x-api-key': 'sk' },
    });
    assert.equal(res.status, 503);
    const j = await res.json();
    assert.equal(j.error, 'overloaded');
  });

  it('normalizes trailing slashes on opts.baseUrl override (no double slash)', async () => {
    captured.length = 0;
    const res = await proxy._proxyAnthropic('/v1/messages', { model: 'm' }, {
      baseUrl: `${baseUrl}///`,
      inboundHeaders: { 'x-api-key': 'sk' },
    });
    assert.equal(res.status, 200);
    assert.equal(captured.length, 1);
    assert.equal(captured[0].path, '/v1/messages',
      'request path must not contain leading double slash from a trailing-slash baseUrl');
  });

  it('substitutes env ANTHROPIC_API_KEY as x-api-key when client omits it', async () => {
    captured.length = 0;
    const prevKey = process.env.ANTHROPIC_API_KEY;
    const prevTok = process.env.ANTHROPIC_AUTH_TOKEN;
    delete process.env.ANTHROPIC_AUTH_TOKEN;
    process.env.ANTHROPIC_API_KEY = 'sk-from-env';
    try {
      const res = await proxy._proxyAnthropic('/v1/messages', { model: 'm' }, {
        inboundHeaders: { 'anthropic-version': '2023-06-01' },
      });
      assert.equal(res.status, 200);
      assert.equal(captured.length, 1);
      assert.equal(captured[0].headers['x-api-key'], 'sk-from-env');
      assert.equal(captured[0].headers['authorization'], undefined);
    } finally {
      if (prevKey === undefined) delete process.env.ANTHROPIC_API_KEY;
      else process.env.ANTHROPIC_API_KEY = prevKey;
      if (prevTok !== undefined) process.env.ANTHROPIC_AUTH_TOKEN = prevTok;
    }
  });

  it('substitutes env ANTHROPIC_AUTH_TOKEN as Authorization Bearer when no x-api-key in env', async () => {
    captured.length = 0;
    const prevKey = process.env.ANTHROPIC_API_KEY;
    const prevTok = process.env.ANTHROPIC_AUTH_TOKEN;
    delete process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_AUTH_TOKEN = 'sk-bearer-from-env';
    try {
      const res = await proxy._proxyAnthropic('/v1/messages', { model: 'm' }, {
        inboundHeaders: {},
      });
      assert.equal(res.status, 200);
      assert.equal(captured.length, 1);
      assert.equal(captured[0].headers['authorization'], 'Bearer sk-bearer-from-env');
      assert.equal(captured[0].headers['x-api-key'], undefined);
    } finally {
      if (prevKey !== undefined) process.env.ANTHROPIC_API_KEY = prevKey;
      if (prevTok === undefined) delete process.env.ANTHROPIC_AUTH_TOKEN;
      else process.env.ANTHROPIC_AUTH_TOKEN = prevTok;
    }
  });

  it('does NOT substitute env creds when client already supplied x-api-key', async () => {
    captured.length = 0;
    const prevKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = 'sk-env-should-be-ignored';
    try {
      const res = await proxy._proxyAnthropic('/v1/messages', { model: 'm' }, {
        inboundHeaders: { 'x-api-key': 'sk-from-client' },
      });
      assert.equal(res.status, 200);
      assert.equal(captured.length, 1);
      assert.equal(captured[0].headers['x-api-key'], 'sk-from-client');
    } finally {
      if (prevKey === undefined) delete process.env.ANTHROPIC_API_KEY;
      else process.env.ANTHROPIC_API_KEY = prevKey;
    }
  });
});
