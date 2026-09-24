# Domain packs — field-specific evidence standards

Different fields have different databases, study designs, reporting guidelines,
and failure modes. At the start of a task, pick the pack(s) that fit the question
(`research-question` records this) and apply them **on top of** the general rules
in `CLAUDE.md` and `references/evidence-hierarchy.md`.

| Pack | Use for |
| --- | --- |
| [`medicine.md`](./medicine.md) | clinical, biomedical, public health, nutrition, psychology-of-health |
| [`climate.md`](./climate.md) | climate science, environment, energy, earth systems |
| [`computer-science.md`](./computer-science.md) | CS, ML/AI, engineering, algorithms |
| [`social-sciences.md`](./social-sciences.md) | economics, psychology, sociology, education, policy |

If a question spans fields (e.g. "AI in radiology"), apply both relevant packs
and reconcile their standards. If none fits, fall back to the general rules and
say so.
