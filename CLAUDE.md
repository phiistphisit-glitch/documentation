# CLAUDE.md — Odoo Documentation Repository

This file provides context for AI assistants working in this repository.

## Overview

This is a fork of the official [odoo/documentation](https://github.com/odoo/documentation) repository,
tracking the **18.0** branch. It is a **Sphinx**-based documentation site written in
reStructuredText (RST). The fork adds custom tooling and assets for ERP LINKS / Richmax business
tools on top of the upstream Odoo docs.

## Repository Structure

```
.
├── conf.py                   # Sphinx configuration (version, extensions, themes)
├── Makefile                  # Build, test, and utility targets
├── requirements.txt          # Python dependencies for building
├── commit_template.txt       # Commit message conventions
│
├── content/                  # RST source files (Sphinx SOURCE_DIR)
│   ├── index.rst             # Root toctree
│   ├── applications/         # End-user app docs (Finance, Sales, HR, etc.)
│   ├── administration/       # Hosting, upgrade, Odoo.sh, mobile
│   ├── developer/            # API references, tutorials, howtos
│   ├── contributing/         # Contribution guidelines, RST style guides
│   └── legal/                # Terms, agreements
│
├── extensions/               # Custom Sphinx extensions (Python packages)
│   ├── odoo_theme/           # Custom HTML theme (SCSS → CSS, templates)
│   ├── cards/                # Card grid directive
│   ├── custom_admonitions/   # example, exercise directives
│   ├── embedded_video/       # YouTube/Vimeo directive
│   ├── spoilers/             # Collapsible spoiler directive
│   ├── redirects/            # Generates redirect HTML pages
│   ├── github_link/          # Linkcode integration with GitHub
│   ├── autodoc_field/        # Odoo model field autodoc
│   └── autodoc_placeholder/  # Stub when odoo sources are absent
│
├── redirects/                # Per-version redirect rule files (*.txt)
│   └── MANUAL.md             # How to write redirect rules
│
├── locale/                   # Gettext translation files (20+ languages)
│   └── <lang>/LC_MESSAGES/   # Per-language .po files
│
├── invs/                     # Intersphinx inventory files
│   ├── python.inv
│   └── werkzeug.inv
│
├── static/                   # Static assets copied into the HTML build
│   ├── packaging-calculator.html   # ERP LINKS packaging price calculator (Thai)
│   └── richmax-quote.html          # Richmax Smart Quote v3.0 UI (Thai)
│
├── tests/                    # Guideline linting / CI checks
│   ├── main.py               # Entry point (wraps sphinxlint)
│   ├── requirements.txt      # Test dependencies (sphinxlint)
│   └── checkers/             # Custom checker modules
│       ├── redirect_rules.py
│       ├── resource_files.py
│       └── rst_style.py
│
└── packaging_calculator_v2.gs  # Google Apps Script — Packaging/Offset calculator V2
```

## Build System

### Prerequisites

- Python 3.6–3.8
- Dependencies: `pip install -r requirements.txt`
- `make` (GNU Make)
- Optional: local `odoo/odoo` and `odoo/upgrade-util` repos in the parent or root directory
  (enables autodoc directives in Developer docs)

### Common Commands

| Command | Description |
|---------|-------------|
| `make` or `make html` | Full HTML build → `_build/html/` |
| `make fast` | HTML with collapsed menu (faster rebuild) |
| `make clean` | Delete all build artefacts |
| `make test` | Run RST guideline linter (CI check) |
| `make review` | Interactive review lint (prompts for path + line length) |
| `make gettext` | Extract translatable strings → `locale/sources/` |
| `make latexpdf` | Build PDF via LaTeX (requires texlive) |

Build output goes to `_build/html/` by default. When `VERSIONS` is set, output is
`_build/html/18.0/`; when `CURRENT_LANG` is set to a non-English code, it becomes
`_build/html/18.0/<lang>/`.

### SCSS Compilation

The theme's CSS is compiled from SCSS automatically before `html` builds:
```
extensions/odoo_theme/static/style.scss  →  _build/html/_static/style.css
```
Uses `pysassc` (included via `libsass` in requirements).

## Content Conventions

### RST Writing Rules

- Source files use the `.rst` extension; `source_suffix = '.rst'` in `conf.py`.
- Default role is `literal` — backtick-quoted text (`` `foo` ``) renders as inline code.
- Line length target: **100 characters** (enforced by `make review`, not `make test`).
- Files must end with a trailing newline.
- No trailing whitespace, no carriage returns, no horizontal tabs.

### RST Checkers (`make test`)

The CI test runs `sphinxlint` with custom Odoo directives registered. Failures block merging.
Key checks: unbalanced backticks, missing colons in roles, malformed directives, Python syntax
errors in code blocks, missing final newlines, trailing whitespace.

### Custom Directives

| Directive | Extension | Purpose |
|-----------|-----------|---------|
| `.. cards::` / `.. card::` | `cards` | Card grid layouts |
| `.. example::` / `.. exercise::` | `custom_admonitions` | Example/exercise callouts |
| `.. spoiler::` | `spoilers` | Collapsible content |
| `.. tab::` / `.. tabs::` / `.. group-tab::` / `.. code-tab::` | `sphinx_tabs` | Tabbed content |
| `.. youtube::` / `.. vimeo::` | `embedded_video` | Embedded video |

### Template Variables in RST

Use `{VARNAME}` syntax in RST source — they are substituted at read time by `conf.py`:

| Variable | Value (18.0) |
|----------|-------------|
| `{BRANCH}` / `{CURRENT_BRANCH}` | `18.0` |
| `{CURRENT_VERSION}` | `18` |
| `{CURRENT_MAJOR_BRANCH}` | `18.0` |
| `{CURRENT_MAJOR_VERSION}` | `18` |
| `{GITHUB_PATH}` | `https://github.com/odoo/odoo/blob/18.0` |
| `{GITHUB_ENT_PATH}` | `https://github.com/odoo/enterprise/blob/18.0` |

## Commit Message Convention

Follow the tag format from `commit_template.txt`:

```
[TAG] application/module: short description in imperative mood
```

| Tag | Meaning |
|-----|---------|
| `[ADD]` | New content |
| `[IMP]` | Improvement to existing content |
| `[FIX]` | Content or RST fix |
| `[REM]` | Removal |
| `[REF]` | Refactoring / restructuring |
| `[MOV]` | Move or rename |

**Example:** `[ADD] applications/sales: document new discount policy`

Write the commit message as if completing: *"If merged, this commit will …"*

## Redirect Rules

When a `.rst` file is renamed or moved, add a redirect rule to `redirects/18.0.txt`:

```
path/to/old/file.rst  path/to/new/file.rst  # optional comment
```

Rules must be sorted alphabetically within blocks grouped by app/scope. See
`redirects/MANUAL.md` for full details. No redirect needed for outright deletions with no replacement.

## Translations / i18n

- Translation files live in `locale/<lang>/LC_MESSAGES/`.
- Generate `.pot` sources with `make gettext`.
- The `conf.py` custom `docname_to_domain` splits `applications/` pages into per-subdirectory
  translation domains for finer-grained Transifex management.
- Languages supported: de, es, es_419, fr, id, it, ja, ko, nl, pt_BR, ro, sv, th, uk, vi, zh_CN, zh_TW.

## Custom Assets (Fork-Specific)

These files are additions specific to this fork and are **not** part of upstream Odoo docs:

### `static/packaging-calculator.html`
Standalone Thai-language packaging price calculator web app for ERP LINKS. Self-contained HTML/CSS/JS.
No build step required — it is copied verbatim into `_build/html/_static/`.

### `static/richmax-quote.html`
Richmax Smart Quote v3.0 — Thai-language quotation UI for offset printing. Uses Google Fonts
(Prompt, Sarabun). Self-contained HTML/CSS/JS.

### `packaging_calculator_v2.gs`
Google Apps Script (643 lines) for a Packaging & Offset calculator V2 intended for use with
Google Sheets / Google Drive. Not part of the Sphinx build.

## Development Workflow

1. Work on feature branches — the primary development branch for this session is
   `claude/claude-md-docs-pBp7C` (base: `18.0`).
2. Run `make test` before committing to catch RST lint errors.
3. Run `make html` to verify the full build is clean; open `_build/html/index.html` to preview.
4. Use the commit tag convention above.
5. For moved/renamed pages, add redirect rules to `redirects/18.0.txt`.

## Key Files for AI Reference

| File | Why it matters |
|------|---------------|
| `conf.py` | All Sphinx config: version, extensions, language switcher, URL generation |
| `Makefile` | Canonical build/test commands |
| `requirements.txt` | Python build dependencies (pin versions) |
| `tests/main.py` | RST linter entry point — what `make test` runs |
| `redirects/MANUAL.md` | How and when to create redirect rules |
| `commit_template.txt` | Required commit message format |
| `extensions/odoo_theme/` | Custom HTML theme — edit SCSS here, not the compiled CSS |
