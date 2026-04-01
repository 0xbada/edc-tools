# DevHackDebug Tools

Free online developer utility tools. All processing happens in your browser — no data is sent to any server.

**Live:** [tools.devhackdebug.com](https://tools.devhackdebug.com)

## Tools (11)

| Category | Tool | Description |
|----------|------|-------------|
| Encoding | [URL Encoder/Decoder](https://tools.devhackdebug.com/encoding/url-encoder/) | Encode or decode URL components |
| Encoding | [Base64 Encoder/Decoder](https://tools.devhackdebug.com/encoding/base64/) | Encode or decode Base64 strings |
| Encoding | [HTML Entity Encoder/Decoder](https://tools.devhackdebug.com/encoding/html-entity/) | Encode or decode HTML entities |
| Encoding | [JWT Decoder](https://tools.devhackdebug.com/encoding/jwt-decoder/) | Decode and inspect JWT tokens |
| Crypto | [Hash Generator](https://tools.devhackdebug.com/crypto/hash-generator/) | Generate MD5, SHA-1, SHA-256, SHA-512 hashes |
| Generator | [UUID Generator](https://tools.devhackdebug.com/generator/uuid-generator/) | Generate random UUID v4 identifiers |
| Formatter | [JSON Formatter](https://tools.devhackdebug.com/formatter/json-formatter/) | Format and validate JSON data |
| Formatter | [Regex Tester](https://tools.devhackdebug.com/formatter/regex-tester/) | Test regular expressions with live matching |
| Converter | [Timestamp Converter](https://tools.devhackdebug.com/converter/timestamp-converter/) | Convert between Unix timestamps and dates |
| Converter | [Color Converter](https://tools.devhackdebug.com/converter/color-converter/) | Convert colors between HEX, RGB, and HSL |
| Converter | [Cron Expression Parser](https://tools.devhackdebug.com/converter/cron-parser/) | Parse cron expressions into human-readable descriptions |

## Tech Stack

- **SSG:** [11ty (Eleventy)](https://www.11ty.dev/) with Nunjucks templates
- **Frontend:** Vanilla HTML, CSS, JavaScript — no frameworks
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **Design:** Dark minimal theme, monospace UI, side-by-side input/output panels

## Architecture

Data-driven static site. Tool metadata lives in `src/_data/tools.json` — 11ty pagination generates individual pages from a shared layout template.

```
src/
  _data/
    tools.json          ← tool metadata (drives page generation)
    categories.json     ← category definitions
  _includes/
    base.njk            ← HTML shell (head, nav, footer)
    tool-layout.njk     ← tool page layout (panels, buttons)
    seo/                ← per-tool SEO content (Korean)
  css/
    global.css          ← theme, nav, cards
    tool.css            ← panels, buttons, responsive
  js/
    common.js           ← tool bootstrapper (reads module, wires UI)
    tools/              ← one JS file per tool
  tools/
    tools.njk           ← pagination template
```

## Adding a New Tool

1. Add an entry to `src/_data/tools.json`:

```json
{
  "name": "My Tool",
  "slug": "my-tool",
  "category": "converter",
  "description": "What it does",
  "keywords": ["keyword1", "keyword2"],
  "script": "my-tool.js"
}
```

2. Create `src/js/tools/my-tool.js`:

```js
export default {
  actions: [
    { label: 'Run', fn: (input) => input.toUpperCase() },
  ],
};
```

3. Create `src/_includes/seo/my-tool.njk` with description and FAQ.

4. `git push` — Cloudflare Pages auto-builds and deploys.

## Development

```bash
npm install
npm run dev       # local dev server at http://localhost:8080
npm run build     # production build to _site/
```

## License

MIT
