# Postman Collection

This directory contains Postman collections for testing the Portfolio API endpoints.

## Setup

1. **Import the collection:**
   - Open Postman
   - Click "Import" button
   - Select `portfolio-api.postman_collection.json`

2. **Configure environment variables:**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseUrl`: `http://localhost:3000` (for local development)
     - For production: `https://your-domain.com`

## Endpoints

### GET /api/github/stats

Fetches GitHub statistics including:
- Total repositories
- Commits in the last 30 days
- Language usage across all repositories
- Repository details
- Per-repository language breakdown

**Note:** This endpoint requires `GITHUB_TOKEN` to be set in the server environment. The token is not passed via the API request.

## Testing

1. Start the development server: `npm run dev`
2. Open Postman and select the "Portfolio API" collection
3. Run the "GitHub Stats" request
4. Verify the response structure and data

## Error Handling

If the `GITHUB_TOKEN` is not set or invalid, the API will return a 500 error with:
```json
{
  "error": "Failed to fetch GitHub stats"
}
```
