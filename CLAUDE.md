# CLAUDE.md — AI Assistant Guide for ChatGPT_DAN

## Repository Overview

This is a **documentation-only repository** that archives a collection of ChatGPT "jailbreak" and persona-injection prompts, most notably the "DAN" (Do Anything Now) series. There is no executable code, build system, test suite, or package management in this project.

- **Author:** Kiho Lee (ORCID: 0000-0002-8713-3863)
- **Initial release:** 2023-02-22
- **Version:** 1.0.0
- **Upstream GitHub:** https://github.com/0xk1h0/ChatGPT_DAN

---

## Repository Structure

```
ChatGPT_DAN/
├── README.md        # Primary content — all prompt documentation (57 KB, ~291 lines)
├── citation.cff     # Citation metadata (CFF 1.2.0 format)
└── CLAUDE.md        # This file
```

There are no source code files, configuration files, dependencies, scripts, or CI/CD workflows.

---

## Content Organization (README.md)

The README uses GitHub-flavored Markdown with nested `<details>`/`<summary>` collapsible sections to organize prompts. The top-level structure is:

```
# ChatGPT "DAN" (and other "Jailbreaks")
## ChatGPT "DAN" (and other "Jailbreaks") PROMPTS
  <details> DAN (Do Anything Now)           ← parent collapsible
    <details> DAN 13.0 Prompt               ← child collapsible
    <details> DAN 12.0 Prompt
    <details> DAN 11.0 Prompt
    <details> DAN 10.0 Prompt
    <details> DAN 9.0 Prompt
    <details> DAN 8.0 Prompt
    <details> DAN 7.0 Prompt
    <details> DAN 6.0 Prompt
    <details> DAN 6.2 Prompt
  <details> Evil-Bot Prompt
  <details> The ANTI-DAN Prompt
  <details> ChatGPT Developer Mode v2
  <details> ChatGPT Image Unlocker
  <details> ChatGPT DevMode + Ranti
  <details> The Jailbreak Prompt
  <details> The STAN Prompt
  <details> The DUDE Prompt
  <details> The Mongo Tom Prompt
## Star History               ← chart widget at end of file
```

Each prompt entry follows a consistent pattern:

```markdown
<details>
  <summary>PROMPT NAME</summary>
<blockquote>From <a href="SOURCE_URL">SOURCE_URL</a>.</blockquote>

[Prompt text here]
</details>
```

Source attribution via `<blockquote>` is included where the origin is known.

---

## Contribution Conventions

### Adding a New Prompt

1. Add a `<details>` block inside the appropriate parent section (or at the top level for entirely new categories).
2. Use a concise, descriptive `<summary>` label (e.g., `The DAN 14.0 Prompt`).
3. Include a `<blockquote>` attribution block if the source is known.
4. Paste the prompt text verbatim — do **not** paraphrase or alter the wording.
5. Close `</details>` correctly; unclosed tags break GitHub rendering.

### Markdown Rules

- Use HTML (`<details>`, `<summary>`, `<blockquote>`, `<a>`) for collapsible sections — GitHub Markdown does not support native collapsibles.
- Keep prompt text as a single block of prose (no additional headers inside prompt blocks).
- Images (preview screenshots) may be embedded with standard Markdown `![alt](url)` syntax inside a `<details>` block.
- Bold notes at the top of the file use raw HTML `<b>` tags — maintain this style for consistency.

### citation.cff

Update `citation.cff` only if the author list or canonical URL changes. Version and date fields should remain stable unless a formal release is being tagged.

---

## Development Workflow

There is no build, lint, test, or deployment pipeline. Contribution workflow is:

1. Edit `README.md` directly.
2. Preview changes locally (any Markdown viewer) or via GitHub's preview tab.
3. Commit with a descriptive message, e.g.:
   ```
   Add DAN 14.0 prompt
   Update DUDE prompt attribution link
   ```
4. Push and open a pull request against `master`.

---

## Important Notes for AI Assistants

- This repository **contains no code** — do not attempt to run, build, or test anything.
- The prompts documented here are **historical/research artifacts**. Do not generate, improve, extend, or compose new jailbreak prompts when assisting with this repository. Limit contributions to documentation structure, formatting corrections, attribution links, and factual metadata.
- When editing `README.md`, preserve all existing prompt text exactly. Altering the wording of documented prompts would make the archive inaccurate.
- The file uses a mix of Markdown and raw HTML — validate that `<details>` tags are properly nested and closed after any edit.
- There is no automated formatting or linting; rely on visual inspection and GitHub's Markdown preview.
