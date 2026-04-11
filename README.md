# Spotify API

A NestJS REST API that integrates with the Spotify Web API using OAuth 2.0 Authorization Code Flow. Authenticate with your Spotify account and explore your playlists and tracks through a clean, structured JSON interface — with interactive Swagger documentation included.

---

## Features

- **OAuth 2.0** — Full Authorization Code Flow: login, callback, and token refresh
- **Playlist access** — Fetch only the playlists you own or collaborate on
- **Track listing** — Get clean, descriptive track data for any playlist
- **Full library dump** — Retrieve all your playlists with their tracks in a single request
- **Swagger UI** — Interactive API docs available at `/api`
- **CORS enabled** — Ready to connect from browser clients

---

## Tech Stack

| Layer       | Technology                                                      |
| ----------- | --------------------------------------------------------------- |
| Framework   | [NestJS](https://nestjs.com/) v11                               |
| Language    | TypeScript                                                      |
| HTTP Client | [axios](https://axios-http.com/)                                |
| Auth        | Spotify OAuth 2.0                                               |
| Docs        | [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) |
| Config      | [dotenv](https://github.com/motdotla/dotenv)                    |

---

## Prerequisites

- Node.js >= 18
- A [Spotify Developer](https://developer.spotify.com/dashboard) app with:
  - `Client ID` and `Client Secret`
  - Redirect URI set to `http://127.0.0.1:3000/auth/callback`

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/auth/callback
```

### 3. Run the server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run start:prod
```

The server starts at `http://127.0.0.1:3000`.
Swagger docs are available at `http://127.0.0.1:3000/docs`.

---

## Authentication Flow

This API uses the [Spotify Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow).

```
1. GET /auth/login                  → Redirects you to the Spotify login page
2. GET /auth/callback?code=         → Exchanges the code for access_token + refresh_token
3. GET /auth/refresh?refresh_token= → Gets a new access_token when it expires
```

After step 2, copy the returned `access_token` and use it as a Bearer token in the `Authorization` header for all `/spotify/*` endpoints.

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

| Method | Endpoint                       | Description                                   |
| ------ | ------------------------------ | --------------------------------------------- |
| `GET`  | `/spotify/playlists`           | List your owned & collaborative playlists     |
| `GET`  | `/spotify/playlists/:id/items` | Get tracks for a specific playlist            |
| `GET`  | `/spotify/library`             | Get all playlists with their full track lists |

---

## Response Shapes

### `GET /spotify/playlists`

```json
{
  "message": "Fetched 5 owned/collaborative playlists",
  "data": {
    "total": 5,
    "playlists": [
      {
        "id": "3bjhwY6Z41FElrUEVyd5Hd",
        "name": "Work Out",
        "description": "",
        "public": true,
        "collaborative": false,
        "tracksCount": 385,
        "imageUrl": "https://...",
        "spotifyUrl": "https://open.spotify.com/playlist/..."
      }
    ]
  }
}
```

### `GET /spotify/playlists/:id/items`

```json
{
  "message": "Fetched 385 tracks from playlist 3bjhwY6Z41FElrUEVyd5Hd",
  "data": {
    "playlistId": "3bjhwY6Z41FElrUEVyd5Hd",
    "total": 385,
    "tracks": [
      {
        "id": "4uLU6hMCjMI75M1A2tKUQC",
        "title": "Never Gonna Give You Up",
        "artists": ["Rick Astley"],
        "album": "Whenever You Need Somebody",
        "albumImageUrl": "https://...",
        "durationMs": 213573,
        "explicit": false,
        "spotifyUrl": "https://open.spotify.com/track/...",
        "addedAt": "2024-07-03T02:13:21Z"
      }
    ]
  }
}
```

### `GET /spotify/library`

```json
{
  "message": "Fetched full library: 5 playlists",
  "data": {
    "total": 5,
    "playlists": [
      {
        "id": "3bjhwY6Z41FElrUEVyd5Hd",
        "name": "Work Out",
        "tracksCount": 385,
        "tracks": ["..."]
      }
    ]
  }
}
```

---

## Project Structure

```
src/
├── auth/
│   ├── auth.controller.ts    # OAuth routes: /auth/login, /callback, /refresh
│   ├── auth.service.ts       # Spotify OAuth logic & token exchange
│   └── auth.module.ts
├── spotify/
│   ├── spotify.controller.ts # Spotify data routes
│   ├── spotify.service.ts    # Playlist & track fetching logic
│   └── spotify.module.ts
├── common/
│   ├── guards/
│   │   └── spotify-auth/     # Extracts Bearer token from Authorization header
│   └── filters/
│       └── http-exception/   # Global HTTP exception filter
├── app.module.ts
└── main.ts                   # Bootstrap: dotenv, CORS, Swagger
```

---

## Scopes Requested

| Scope                         | Purpose                        |
| ----------------------------- | ------------------------------ |
| `playlist-read-private`       | Access private playlists       |
| `playlist-read-collaborative` | Access collaborative playlists |
| `user-library-read`           | Access saved library           |
| `user-read-private`           | Read user profile              |

---

## Error Handling

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| `401`  | Invalid or expired Spotify token                         |
| `403`  | Access denied — playlist is private and not owned by you |
| `429`  | Spotify rate limit exceeded                              |
