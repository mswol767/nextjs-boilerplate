Google Sheets waitlist integration

This project can append waitlist submissions to a Google Sheet when configured.

Required environment variables:
- SHEET_ID: the spreadsheet ID (from the sheet URL)
- GOOGLE_SERVICE_ACCOUNT: base64-encoded JSON key for a service account with Sheets API access

How to create a service account and encode the key:
1. Visit Google Cloud Console and create/select a project.
2. Enable the Google Sheets API for the project.
3. Create a Service Account (IAM & Admin -> Service Accounts).
4. Create a JSON key for the service account and download it.
5. Share your Google Sheet (the target) with the service account email (client_email from the JSON).
6. Base64-encode the JSON file and set it as the environment variable. Example (PowerShell):

```powershell
$raw = Get-Content -Raw ./service-account.json
$b64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($raw))
# set for session
$env:GOOGLE_SERVICE_ACCOUNT = $b64
# set sheet id
$env:SHEET_ID = 'your-sheet-id'
```

If Sheets isn't configured or the append fails, the API will fall back to writing to `data/waitlist.json` if writable, or to the system temp directory otherwise.

Notes:
- The sheet range used is `Sheet1!A:G` and the values appended are: id, name, email, phone, address, message, createdAt.
- Ensure the service account has Editor access to the spreadsheet (or at least permission to append values).

If you'd like, I can:
- Add a small admin UI button to re-sync tmp entries into the sheet.
- Let you pick the sheet range/worksheet name via env var.
