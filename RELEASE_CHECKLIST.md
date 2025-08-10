# Release Checklist (Preview → PR → Production)

## Local validation
- `git switch <feature-branch>`
- `npm ci && npm run build`
- `npm run preview` → no Console errors, routing OK, 404 OK
- Quick manual QA: critical paths, /auth, RTL, mobile ~360px

## Preview
- `firebase hosting:channel:deploy <name> --expires 30d`
- Save the preview URL

## PR to main
- Title: concise feature/fix name
- Body must include:
  - What changed + Why
  - How to verify (steps)
  - **Preview URL**
  - Screenshots/GIF if UI

## Review & fixes
- Push more commits as needed (redeploy preview if relevant)

## Production
- Option A (standard): merge → `npm run build` → `firebase deploy --only hosting`
- Option B (safe): `firebase hosting:clone lego-tips:<name> lego-tips:live`

## Rollback (if needed)
- Re-clone a previous preview channel to `live` OR redeploy a known-good build.
