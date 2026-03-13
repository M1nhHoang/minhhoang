# API Reference

Base URL: `/api`

## Modules

| Module | Prefix | File |
|--------|--------|------|
| [Health](health.md) | `/api/health` | — |
| [Auth](auth.md) | `/api/auth` | `authRoutes.js` |
| [Users](users.md) | `/api/users` | `userRoutes.js` |
| [Weather](weather.md) | `/api/weather` | `weatherRoutes.js` |
| [Settings](settings.md) | `/api/settings` | `settingRoutes.js` |
| [Gomoku](gomoku.md) | `/api/games/gomoku` | `gomokuRoutes.js` |

## Common Notes

- Content-Type is always `application/json`
- Errors generally return `{ success: false, error: "message" }` or `{ message: "..." }` depending on the module
- Authentication is handled via the `X-Username` header (see individual module docs for protected routes)
