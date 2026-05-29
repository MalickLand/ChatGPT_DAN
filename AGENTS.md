# AGENTS.md

Guidance for AI agents working in this repository.

## Repository overview

This project is a **markdown prompt catalog** for ChatGPT “jailbreak” prompts (DAN and variants). It is **not** a runnable application: there is no `package.json`, backend, frontend, database, or CI pipeline in-tree.

| Path | Purpose |
|------|---------|
| `README.md` | Full catalog of prompts (HTML `<details>` sections) |
| `citation.cff` | Citation metadata (CFF 1.2.0) |

End-to-end “usage” is manual: copy a prompt from `README.md` into [ChatGPT](https://chat.openai.com/). No local services are required for that workflow.

## Cursor Cloud specific instructions

### What to run (and what not to run)

- **No dev server is required** for normal agent work. Do not start Docker, databases, or app frameworks unless you are explicitly adding application code.
- **No install step** on VM startup: there are no locked dependencies. The update script is a no-op (`true`).
- Optional local preview: `python3 -m http.server 8765 --bind 127.0.0.1` from `/workspace`, then open `http://127.0.0.1:8765/README.md`.

### Lint / validation (optional)

There is no project-defined lint script. For markdown checks, use on-demand tooling (does not modify the repo):

```bash
npx --yes markdownlint-cli@0.44.0 README.md
```

Expect many findings (inline HTML, long prompt lines); the README is authored for GitHub rendering, not strict markdownlint defaults.

To verify the catalog structure without editing files:

```bash
python3 -c "
import re
from pathlib import Path
t = Path('README.md').read_text(encoding='utf-8')
n = len(re.findall(r'<summary>([^<]+)</summary>', t))
assert n >= 5 and 'DAN' in t
print(f'OK: {n} prompt sections')
"
```

### Tests and build

- **Tests:** None in-repo. Use the Python snippet above or manual inspection of `README.md`.
- **Build:** None.

### Gotchas

- Editing `README.md` is the primary “feature” work; preserve existing HTML `<details>` / `<summary>` patterns unless the user asks for a restructure.
- Real E2E testing of prompts requires an external OpenAI account and is outside this VM/repo scope.
