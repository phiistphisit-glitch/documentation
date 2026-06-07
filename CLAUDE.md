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
│   ├── applications/         # End-user app docs
│   │   ├── essentials/       # General app essentials
│   │   ├── finance/          # Accounting, expenses, payment providers
│   │   ├── general/          # Settings, general config
│   │   ├── hr/               # Employees, payroll, leaves
│   │   ├── inventory_and_mrp/# Inventory, manufacturing, maintenance
│   │   ├── marketing/        # Email, SMS, social, events
│   │   ├── productivity/     # Discuss, project, timesheets
│   │   ├── sales/            # CRM, sales, subscriptions, rentals
│   │   ├── services/         # Helpdesk, field service, planning
│   │   ├── studio/           # Studio no-code customization
│   │   └── websites/         # Website, eCommerce, eLearning, live chat
│   ├── administration/       # Hosting, upgrade, Odoo.sh, mobile
│   ├── developer/            # API references, tutorials, howtos
│   ├── contributing/         # Contribution guidelines, RST style guides
│   └── legal/                # Terms, agreements (multi-language LaTeX)
│
├── extensions/               # Custom Sphinx extensions (Python packages)
│   ├── odoo_theme/           # Custom HTML theme (SCSS → CSS, templates)
│   │   ├── static/           # Theme assets: fonts, img, js, lib, scss
│   │   │   └── style.scss    # Main SCSS entry point
│   │   ├── layout.html       # Base Jinja2 template
│   │   ├── search.html       # Search page template
│   │   ├── layout_templates/ # Partial templates
│   │   ├── pygments_override.py  # Custom 'odoo' Pygments style
│   │   ├── translator.py     # Custom Sphinx translator
│   │   └── theme.conf        # Theme metadata
│   ├── cards/                # Card grid directive (.. cards:: / .. card::)
│   ├── custom_admonitions/   # example, exercise directives
│   ├── embedded_video/       # YouTube/Vimeo directives
│   ├── spoilers/             # Collapsible spoiler directive
│   ├── redirects/            # Generates redirect HTML pages
│   ├── github_link/          # Linkcode integration with GitHub
│   ├── html_domain/          # HTML domain logic for memento pages
│   ├── autodoc_field/        # Odoo model field autodoc
│   ├── autodoc_placeholder/  # Stub when odoo sources are absent
│   └── graphviz_placeholder/ # Stub when graphviz/dot is absent
│
├── redirects/                # Per-version redirect rule files
│   ├── MANUAL.md             # How to write redirect rules
│   ├── 18.0.txt              # Current version redirect rules
│   └── *.txt                 # Historical versions (11.0–17.0, saas-*)
│
├── locale/                   # Gettext translation files (20+ languages)
│   └── <lang>/LC_MESSAGES/   # Per-language .po files
│
├── invs/                     # Intersphinx inventory files
│   ├── python.inv
│   └── werkzeug.inv
│
├── static/                   # Static assets copied verbatim into HTML build
│   ├── css/                  # Extra stylesheets
│   ├── img/                  # Extra images (e.g., Odoo logo for LaTeX)
│   ├── js/                   # Extra JavaScript
│   ├── latex/                # LaTeX style file (odoo.sty)
│   ├── packaging-calculator.html   # ERP LINKS packaging price calculator (Thai)
│   └── richmax-quote.html          # Richmax Smart Quote v3.0 UI (Thai)
│
├── tests/                    # Guideline linting / CI checks
│   ├── main.py               # Entry point (wraps sphinxlint)
│   ├── requirements.txt      # Test dependencies (sphinxlint, Pillow)
│   └── checkers/             # Custom checker modules
│       ├── __init__.py
│       ├── redirect_rules.py # Validates redirect rule format & targets
│       ├── resource_files.py # Validates images (size, color depth, naming)
│       └── rst_style.py      # Validates headings, spacing, conflict markers
│
└── packaging_calculator_v2.gs  # Google Apps Script — Packaging/Offset calculator V2
```

## Build System

### Prerequisites

- Python 3.6–3.8 (3.7+ recommended; monkey-patching handles 3.6 edge case with Odoo sources)
- Dependencies: `pip install -r requirements.txt`
- `make` (GNU Make)
- Optional: local `odoo/odoo` and `odoo/upgrade-util` repos in the parent or root directory
  (enables autodoc directives in Developer docs — without them, `autodoc_placeholder` is used)
- Optional: `dot` (Graphviz) — without it, `graphviz_placeholder` is used

### Common Commands

| Command | Description |
|---------|-------------|
| `make` or `make html` | Full HTML build → `_build/html/` |
| `make fast` | HTML with collapsed menu (faster rebuild) |
| `make clean` | Delete all build artefacts (`_build/*`) |
| `make test` | Run RST guideline linter (CI check) |
| `make review` | Interactive review lint (prompts for path + line length) |
| `make gettext` | Extract translatable strings → `locale/sources/` |
| `make latexpdf` | Build PDF via LaTeX (requires texlive) |
| `make static` | Copy SCSS-compiled styles and static assets only |

### Build Output Paths

| Env vars set | Output path |
|---|---|
| Neither `VERSIONS` nor `CURRENT_LANG` | `_build/html/` |
| `VERSIONS` set | `_build/html/18.0/` |
| `VERSIONS` + `CURRENT_LANG=fr` | `_build/html/18.0/fr/` |

### SCSS Compilation

CSS is compiled from SCSS automatically as a prerequisite for `html` builds:
```
extensions/odoo_theme/static/style.scss  →  _build/html/_static/style.css
```
Uses `pysassc` (via `libsass` in `requirements.txt`). Edit SCSS source files, never the compiled
output.

### Sphinx Configuration Details (`conf.py`)

- **Source dir**: `content/`
- **Sphinx version required**: `>= 3.0.0`
- **Python**: `sphinx==4.3.2`, `docutils==0.17.0`
- **Pygments style**: `odoo` (defined in `extensions/odoo_theme/pygments_override.py`)
- **Odoo sources autodoc**: Looks in `./odoo` and `../odoo` for `odoo-bin`. Falls back to
  `autodoc_placeholder` if not found.
- **Intersphinx**: `python` → `invs/python.inv`, `werkzeug` → `invs/werkzeug.inv`
- **Version switcher labels** (`versions_names`): master, saas-18.4 through 16.0 defined
- **Language switcher labels** (`languages_names`): 18 languages defined (de, en, es, es_419,
  fr, id, it, ja, ko, nl, pt_BR, ro, sv, th, uk, vi, zh_CN, zh_TW)
- **Legal translations** (have localized contract links): de, es, fr, nl, pt_BR

## Content Conventions

### RST Writing Rules

- Source files use the `.rst` extension; `source_suffix = '.rst'` in `conf.py`.
- Default role is `literal` — single-backtick text (`` `foo` ``) renders as inline code.
- Line length target: **100 characters** (enforced by `make review`, not `make test`).
- Files must end with a trailing newline.
- No trailing whitespace, no carriage returns (`\r`), no horizontal tabs (`\t`).

### Heading Conventions

Allowed heading delimiter characters, **in this strict order** (enforced by linter):

| Level | Character | Example |
|-------|-----------|---------|
| H1 | `=` (overline + underline) | `=====` above and below |
| H2 | `-` | `-----` |
| H3 | `~` | `~~~~~` |
| H4 | `*` | `*****` |
| H5 | `^` | `^^^^^` |

Rules:
- Each file must have exactly **one H1** heading.
- Heading delimiters must **match the length** of their heading text.
- A blank line must appear **before and after** every heading.
- Characters `#`, `"`, `'`, `+`, `` ` ``, `@`, `!`, `,`, `.`, `/` are **forbidden** as delimiters.
- Heading levels must not skip — you cannot use `~` directly after `=` without a `-` in between.

### Image / Resource File Rules (`make review`)

- **PNG max size**: ~0.5 MB (505,000 bytes) — compress with `pngquant`
- **GIF max size**: ~2.1 MB (2,100,000 bytes)
- **PNG color depth**: must be 8-bit — compress with `pngquant`
- **File names**: use hyphens, not underscores (e.g., `my-image.png`, not `my_image.png`)
- **Resource files** (images, attachments) must be referenced in their sibling `.rst` file

### RST Checkers (`make test`)

The CI test runs `sphinxlint` with custom Odoo directives registered, plus checks defined in
`tests/checkers/`. **Failures block merging.** Key checks include:

- `backtick-before-role` — roles preceded by a backtick
- `bad-dedent` — mis-aligned indentation in code blocks
- `carriage-return` — `\r` characters
- `directive-missing-colons` — directives mistyped as comments
- `directive-with-three-dots` — `...` instead of `..`
- `horizontal-tab` — `\t` characters
- `missing-backtick-after-role` — unclosed role backticks
- `missing-colon-in-role` — missing `:` in role syntax
- `missing-final-newline` — file doesn't end with `\n`
- `python-syntax` — invalid Python in code blocks
- `trailing-whitespace` — trailing spaces/tabs
- `unbalanced-inline-literals-delimiters` — unpaired ` `` `
- `check_heading_*` — delimiter chars, order, length, spacing (from `rst_style.py`)
- `check_git_conflict_markers` — unresolved `<<<<<<<` / `>>>>>>>` in `.rst`, `.py`, `.js`,
  `.xml`, `.css`, `.sass`, `.less`, `.po`, `.pot`
- `check_redirect_rules_format` / `check_redirect_rules_target` — redirect rule syntax and
  target file existence (from `redirect_rules.py`)
- `check_resource_file_referenced` — resource files not referenced in RST

Additional checks **only in `make review`**:
- `line-too-long` — lines exceeding max length (default 100)
- `check_early_line_breaks` — line breaks before reaching max length
- `check_image_size` / `check_image_color_depth` / `check_resource_file_name`

### Custom Directives

| Directive | Extension | Purpose |
|-----------|-----------|---------|
| `.. cards::` / `.. card::` | `cards` | Card grid layouts |
| `.. example::` / `.. exercise::` | `custom_admonitions` | Example/exercise callouts |
| `.. spoiler::` | `spoilers` | Collapsible content |
| `.. tab::` / `.. tabs::` / `.. group-tab::` / `.. code-tab::` | `sphinx_tabs` | Tabbed content |
| `.. youtube::` / `.. vimeo::` | `embedded_video` | Embedded video |

### Template Variables in RST

Use `{VARNAME}` syntax in RST source — substituted at read time by the `source-read` event hook
in `conf.py`:

| Variable | Value (18.0 branch) |
|----------|---------------------|
| `{BRANCH}` / `{CURRENT_BRANCH}` | `18.0` |
| `{CURRENT_VERSION}` | `18` |
| `{CURRENT_MAJOR_BRANCH}` | `18.0` |
| `{CURRENT_MAJOR_VERSION}` | `18` |
| `{GITHUB_PATH}` | `https://github.com/odoo/odoo/blob/18.0` |
| `{GITHUB_ENT_PATH}` | `https://github.com/odoo/enterprise/blob/18.0` |
| `{GITHUB_TUTO_PATH}` | `https://github.com/odoo/tutorials/blob/18.0` |
| `{OWL_PATH}` | `https://github.com/odoo/owl/blob/master` |

Note: substitution does **not** apply inside `.. include::` files (pending upstream Sphinx fix).

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

Rules:
- Sorted alphabetically within blocks grouped by app/scope.
- Target file must exist on disk (the linter checks this for the latest version file).
- No redirect needed for outright deletions with no replacement.
- See `redirects/MANUAL.md` for full details.

## Translations / i18n

- Translation files live in `locale/<lang>/LC_MESSAGES/`.
- Generate `.pot` sources with `make gettext` (output: `locale/sources/`).
- The `conf.py` overrides `docname_to_domain` so that `applications/` pages use
  per-subdirectory translation domains (e.g., `applications/sales/...` → `sales` domain).
  This enables finer-grained Transifex management.
- Languages: de, es, es_419, fr, id, it, ja, ko, nl, pt_BR, ro, sv, th, uk, vi, zh_CN, zh_TW.
- Legal translations (full localized contracts, not via Transifex): de, es, fr, nl, pt_BR.

## Custom Assets (Fork-Specific)

These files are additions specific to this fork and are **not** part of upstream Odoo docs:

### `static/packaging-calculator.html`
Standalone Thai-language packaging price calculator web app for ERP LINKS. Self-contained
HTML/CSS/JS — no build step. Copied verbatim into `_build/html/_static/` by the Sphinx build
(`html_static_path = ['static']` in `conf.py`).

### `static/richmax-quote.html`
Richmax Smart Quote v3.0 — Thai-language quotation UI for offset printing. Uses Google Fonts
(Prompt, Sarabun). Self-contained HTML/CSS/JS.

### `packaging_calculator_v2.gs`
Google Apps Script (643 lines) for a Packaging & Offset calculator V2 for use with Google
Sheets / Google Drive. Not part of the Sphinx build.

## Development Workflow

1. Work on feature branches — the current active development branch for this session is
   `claude/claude-md-docs-q6tfK` (base: `18.0`).
2. Run `make test` before committing to catch RST lint errors.
3. Run `make html` to verify the full build; open `_build/html/index.html` to preview.
4. Use the commit tag convention from `commit_template.txt`.
5. For moved/renamed pages, add redirect rules to `redirects/18.0.txt`.
6. For new images, run `pngquant` to reduce to 8-bit before committing.

## Key Files for AI Reference

| File | Why it matters |
|------|---------------|
| `conf.py` | All Sphinx config: version, extensions, template vars, URL generation |
| `Makefile` | Canonical build/test commands and environment variable documentation |
| `requirements.txt` | Python build dependencies (pinned versions) |
| `tests/main.py` | RST linter entry point — what `make test` and `make review` run |
| `tests/checkers/rst_style.py` | Heading rules and early line-break checker |
| `tests/checkers/resource_files.py` | Image size/depth/naming rules |
| `tests/checkers/redirect_rules.py` | Redirect format and target validation |
| `redirects/MANUAL.md` | How and when to create redirect rules |
| `redirects/18.0.txt` | Active redirect rules for this branch |
| `commit_template.txt` | Required commit message format |
| `extensions/odoo_theme/` | Custom HTML theme — edit SCSS source, not compiled CSS |
| `extensions/odoo_theme/static/style.scss` | SCSS entry point for the theme |
