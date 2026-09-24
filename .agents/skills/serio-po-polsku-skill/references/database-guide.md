# Scholarly database guide

Where to look, and what each source is good for. Prefer the MCP servers in
`.mcp.json`; if unavailable, use `WebSearch` restricted to the domains below and
resolve every hit to a DOI or stable record.

## Primary databases (via MCP `paper-search` and `openalex`)

| Source | Best for | Key? | Domain |
| --- | --- | --- | --- |
| **OpenAlex** | 240M+ works, citations, concepts, open metadata, trends | no (email = polite pool) | openalex.org |
| **PubMed / MEDLINE / Europe PMC** | biomedicine, life sciences, clinical | no | pubmed.ncbi.nlm.nih.gov, europepmc.org |
| **arXiv** | physics, math, CS, quant — **preprints** | no | arxiv.org |
| **bioRxiv / medRxiv** | biology, medicine — **preprints** | no | biorxiv.org, medrxiv.org |
| **Semantic Scholar** | cross-domain, TLDRs, citation graph, influence | optional | semanticscholar.org |
| **Crossref** | DOI resolution, metadata, funder & retraction info | no | crossref.org |
| **Cochrane Library** | systematic reviews, clinical evidence | (web) | cochranelibrary.com |

## Authoritative bodies (consensus)

- **WHO** (who.int), **IPCC** (ipcc.ch), **national academies** (e.g.
  nasonline.org), **NIH/NICE/CDC/ECDC**, major professional societies,
  government statistics agencies (Eurostat, OECD, national stats offices).

## Scholarly domains to allow when falling back to WebSearch

```
openalex.org, semanticscholar.org, pubmed.ncbi.nlm.nih.gov, ncbi.nlm.nih.gov,
europepmc.org, arxiv.org, biorxiv.org, medrxiv.org, doi.org, crossref.org,
cochranelibrary.com, nature.com, science.org, cell.com, thelancet.com,
nejm.org, bmj.com, jamanetwork.com, plos.org, pnas.org, springer.com,
link.springer.com, sciencedirect.com, wiley.com, tandfonline.com, sagepub.com,
oup.com, cambridge.org, ieee.org, acm.org, jstor.org, who.int, ipcc.ch,
nasonline.org, nih.gov, cdc.gov, nice.org.uk, oecd.org
```

## Search-quality tips

- Build **Boolean queries** with synonyms and field tags; record the exact
  string used.
- Use **citation chasing**: follow references backward and citations forward
  (OpenAlex / Semantic Scholar) to find seminal and superseding work.
- Sort by relevance *and* by date; scan a review article first to map the field.
- Note counts at each step for a PRISMA flow (identified → screened → included).
