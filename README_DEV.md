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
