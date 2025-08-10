# Developer Notes

## How to verify "Download as Word"

1. Install and build:
   ```bash
   npm ci --legacy-peer-deps
   npm run build
   npm run preview
   ```
2. In the preview site, generate an assignment and click **"ייצא ל‑Word"**.
3. Ensure `assignment.docx` downloads and opens in Word without repair prompts.

## DOCX export (DOM-based)

### Run locally

```bash
npm ci
npm run build
npm run preview
```

### Supported formatting

- Headings (`<h1>`–`<h6>`)
- Bold / italic / underline
- Bulleted and numbered lists
- Line breaks inside paragraphs (`<br>`)

### Known limitations

- Ordered lists use simple "1. 2. 3." numbering without nested levels.
