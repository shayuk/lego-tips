# Preview Deployment (Firebase Hosting)

## Prereqs
- Firebase CLI installed and logged in: `firebase --version`, `firebase login`
- Project selected once: `firebase use --add` (choose lego-tips, alias: `prod`)
- Build output folder (Vite): `dist`

## Workflow (manual)
1) Make sure your branch is pushed:
   `git push -u origin <your-branch>`
2) Build locally:
   `npm ci && npm run build`
3) Deploy preview channel (30 days):
   `firebase hosting:channel:deploy <preview-name> --expires 30d`
   Example: `firebase hosting:channel:deploy ux-beta-batch2`
4) Copy the URL shown, e.g.:
   `https://ux-beta-batch2--lego-tips.web.app`
5) List channels:
   `firebase hosting:channel:list`
6) Delete old channel:
   `firebase hosting:channel:delete <preview-name>`

## Clone preview -> live (safe release)
- Publish exactly what you tested:
  `firebase hosting:clone lego-tips:<preview-name> lego-tips:live`

## Common errors
- **Site Not Found**: the channel expired/was deleted OR you deployed an empty dir.
  - Check `firebase.json` → `"hosting.public": "dist"`
  - Rebuild: `npm run build`, redeploy channel.
- **Wrong project/site**: if you have multiple sites, use `-s <site-id>`.
- **SPA routing broken**: keep the rewrite to `/index.html` intact in `firebase.json`.
