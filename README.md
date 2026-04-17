# Spotify API

A NestJS REST API that integrates with the [Spotify Web API](https://developer.spotify.com/documentation/web-api) using OAuth 2.0 Authorization Code Flow. Authenticate with your Spotify account, browse playlists, manage tracks, and perform bulk operations — all through a clean JSON interface with interactive Swagger documentation.

---

## Features

- **OAuth 2.0 Authorization Code Flow** — Login, callback, and token refresh
- **Playlist management** — Fetch playlists you own or collaborate on
- **Full track listing** — Paginated fetching retrieves all tracks, even from large playlists (1000+)
- **Remove tracks** — Delete specific tracks by URI or bulk-remove all tracks added on a specific date
- **Copy tracks by date** — Copy tracks added on a given date from one playlist to another
- **Full library export** — Retrieve all playlists with their complete track lists in a single request
- **Swagger UI** — Interactive API documentation at `/docs`
- **CORS enabled** — Ready for browser-based clients

---

## Tech Stack

| Layer       | Technology                                                      |
| ----------- | --------------------------------------------------------------- |
| Framework   | [NestJS](https://nestjs.com/) v11                               |
| Language    | TypeScript (strict mode)                                        |
| HTTP Client | [Axios](https://axios-http.com/)                                |
| Auth        | Spotify OAuth 2.0 Authorization Code Flow                       |
| Docs        | [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) |
| Testing     | [Jest](https://jestjs.io/) + `@nestjs/testing`                  |
| CI/CD       | GitHub Actions                                                  |

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A [Spotify Developer](https://developer.spotify.com/dashboard) application with:
  - `Client ID` and `Client Secret`
  - Redirect URI set to `http://127.0.0.1:3000/auth/callback`

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/spotify-api.git
cd spotify-api
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/auth/callback
```

### 3. Run

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server starts at **http://127.0.0.1:3000**.
Swagger docs are available at **http://127.0.0.1:3000/docs**.

### 4. Test

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:cov
```

---

## Authentication Flow

This API uses the [Spotify Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow):

```
1. GET /auth/login                  → Redirects to the Spotify consent page
2. GET /auth/callback?code=...      → Exchanges the authorization code for tokens
3. GET /auth/refresh?refresh_token= → Refreshes an expired access token
```

After step 2, copy the returned `access_token` and use it as a `Bearer` token in the `Authorization` header for all `/spotify/*` endpoints.

---

## API Endpoints

### Auth

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| `GET`  | `/auth/login`                  | Redirect to Spotify login       |
| `GET`  | `/auth/callback?code=`         | Exchange code for tokens        |
| `GET`  | `/auth/refresh?refresh_token=` | Refresh an expired access token |

### Spotify

All endpoints require: `Authorization: Bearer <access_token>`

| Method   | Endpoint                                              | Description                                        |
| -------- | ----------------------------------------------------- | -------------------------------------------------- |
| `GET`    | `/spotify/playlists`                                  | List owned & collaborative playlists               |
| `GET`    | `/spotify/playlists/:id/items`                        | Get all tracks for a playlist (auto-paginates)     |
| `DELETE` | `/spotify/playlists/:id/items`                        | Remove tracks by URI                               |
| `DELETE` | `/spotify/playlists/:id/items/by-date?addedAt=`       | Remove all tracks added on a specific date         |
| `POST`   | `/spotify/playlists/:id/items/copy-by-date?addedAt=`  | Copy tracks added on a date to another playlist    |
| `GET`    | `/spotify/library`                                    | Export all playlists with their full track lists    |

---

## Request & Response Examples

### Remove tracks by URI

```
DELETE /spotify/playlists/abc123/items
```

```json
{
  "uris": [
    "spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
    "spotify:track:1301WleyT98MSxVHPZCA6M"
  ]
}
```

### Remove tracks by date

```
DELETE /spotify/playlists/abc123/items/by-date?addedAt=2025-01-15
```

### Copy tracks by date

```
POST /spotify/playlists/abc123/items/copy-by-date?addedAt=2025-01-15
```

```json
{
  "targetPlaylistId": "xyz789"
}
```

### Track response shape

```json
{
  "id": "4uLU6hMCjMI75M1A2tKUQC",
  "uri": "spotify:track:4uLU6hMCjMI75M1A2tKUQC",
  "title": "Never Gonna Give You Up",
  "artists": ["Rick Astley"],
  "album": "Whenever You Need Somebody",
  "albumImageUrl": "https://i.scdn.co/image/...",
  "durationMs": 213573,
  "explicit": false,
  "spotifyUrl": "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
  "addedAt": "2024-07-03T02:13:21Z"
}
```

---

## Project Structure

```
src/
├── auth/
│   ├── auth.controller.ts          # OAuth routes: login, callback, refresh
│   ├── auth.service.ts             # Token exchange & refresh logic
│   ├── auth.service.spec.ts        # Auth service tests
│   └── auth.module.ts
├── spotify/
│   ├── spotify.controller.ts       # Playlist & track routes
│   ├── spotify.controller.spec.ts  # Controller tests
│   ├── spotify.service.ts          # Spotify API integration
│   ├── spotify.service.spec.ts     # Service tests
│   ├── spotify.module.ts
│   └── dto/                        # Request body DTOs with Swagger decorators
├── common/
│   ├── types/                      # One interface per file + barrel index
│   ├── constants/                  # Error messages, API URLs, scopes
│   ├── helpers/                    # Error handling, date parsing, auth headers
│   ├── decorators/                 # @SpotifyToken() param decorator
│   ├── guards/                     # Bearer token extraction guard
│   └── filters/                    # Global HTTP exception filter
├── app.module.ts
└── main.ts                         # Bootstrap: dotenv, CORS, Swagger, port 3000
```

---

## OAuth Scopes

| Scope                           | Purpose                          |
| ------------------------------- | -------------------------------- |
| `playlist-read-private`         | Access private playlists         |
| `playlist-read-collaborative`   | Access collaborative playlists   |
| `playlist-modify-public`        | Add/remove items (public)        |
| `playlist-modify-private`       | Add/remove items (private)       |
| `user-library-read`             | Access saved library             |
| `user-read-private`             | Read user profile                |
| `user-read-email`               | Read user email                  |

---

## Error Handling

All errors are returned in a consistent JSON envelope:

```json
{
  "error": {
    "statusCode": 401,
    "message": "Invalid Spotify token"
  }
}
```

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| `400`  | Invalid request (e.g. bad date format)                   |
| `401`  | Invalid or expired Spotify token                         |
| `403`  | Access denied — playlist is private and not owned by you |
| `429`  | Spotify rate limit exceeded                              |
| `500`  | Internal server error                                    |

---

## License

This project is unlicensed and intended for personal/educational use.
