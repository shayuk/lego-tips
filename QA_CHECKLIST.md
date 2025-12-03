# QA Checklist (Lego-Tips)

## Core flows
- Navigation between main pages
- /auth flow works (login/logout if enabled)
- No Console errors in `npm run preview`

## UI/UX
- RTL layout preserved (menus, modals, forms)
- Mobile width ~360px looks fine; no overflow or clipped buttons
- Keyboard nav + focus indicators on interactive elements

## DOCX download (assignment)
- Click “Download as Word (DOCX)”:
  - File saved as `assignment.docx`
  - Opens in Word without “Repair”
  - Size > 1KB; first bytes are `PK` (valid DOCX/ZIP)
  - If via server/Function:
    - Response 200
    - Headers:
      - `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
      - `Content-Disposition: attachment; filename="assignment.docx"`
    - No CORS error
- No Console errors during the download

## Regression guard
- Firebase `firebase.json` rewrites unchanged
- No heavy dependencies added unnecessarily
