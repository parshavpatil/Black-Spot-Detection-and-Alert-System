Environment variables

Create a `.env` file in `backend/` with:

PORT=3000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development

Notes

- Use MongoDB Atlas or local MongoDB URI.
- On Windows PowerShell, set env vars temporarily with: `$env:MONGODB_URI="..."; $env:PORT="3000"`.


