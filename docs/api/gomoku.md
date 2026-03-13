# Gomoku AI Engine

API for playing Gomoku (Five in a Row) against the Rapfi AI engine.

> Engine: [Rapfi](https://github.com/dhbloo/rapfi) — Gomocup protocol  
> Architecture: Stateless. Each request sends the entire board state; the server does not store active game states.

---

## `POST /api/games/gomoku/move`

Send the current board state and get the next move computed by the AI.

**Auth:** Not required

### Request Body

```json
{
  "boardSize": 15,
  "rule": 0,
  "moves": [
    { "x": 7, "y": 7, "player": 1 },
    { "x": 8, "y": 8, "player": 2 }
  ],
  "maxDepth": 10
}
```

### Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `boardSize` | number | No | `15` | Board dimension. Range: `10` – `22`. Common: `15` |
| `rule` | number | No | `0` | Game rule variant (see table below) |
| `moves` | array | No | `[]` | List of moves made so far. Empty array = AI plays first move (Black) |
| `maxDepth` | number | No | `10` | Max search depth. Range: `1` – `15`. Values > 15 are capped at 15 |

### `rule` — Game Variants

| Value | Name | Description |
|-------|------|-------------|
| `0` | Freestyle | No restrictions — exactly 5 or more in a row wins. Black has a strong first-mover advantage |
| `1` | Standard Renju | Black is restricted from certain moves (overline, double-three, double-four) |
| `2` | Free Renju | Free variant of Renju rules |

### `moves[]` — Move Format

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Column index (0-based). Range: `0` – `boardSize - 1` |
| `y` | number | Row index (0-based). Range: `0` – `boardSize - 1` |
| `player` | number | Who made the move: `1` = AI (OWN), `2` = Human (OPPONENT), `3` = AI via swap rule |

**Important Notes:**
- Coordinate `(0, 0)` is the top-left corner of the board
- Duplicate coordinates `(x, y)` across the moves array will return a `400` error
- The order of elements in the `moves` array must reflect the exact chronological sequence of the game

### Successful Response `200`

```json
{
  "success": true,
  "move": { "x": 6, "y": 6 },
  "engineTime": 1234
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `move.x` | number | Column index of the AI's chosen move (0-based) |
| `move.y` | number | Row index of the AI's chosen move (0-based) |
| `engineTime` | number | Time taken by the AI engine to compute the move (in milliseconds) |

### Errors

| Status | Trigger Condition |
|--------|-------------------|
| `400` | Invalid input payload (e.g. out of bounds, wrong type, duplicate moves) |
| `408` | Request timed out while waiting in the process queue for > 30 seconds |
| `429` | Rate limit exceeded: current IP already has 5 requests queuing |
| `500` | Engine process crashed or failed to return a valid move |

```json
{
  "success": false,
  "error": "boardSize must be a number between 10 and 22"
}
```

### Usage Examples

**Prompt AI to play the first move (Black):**

```bash
curl -X POST /api/games/gomoku/move \
  -H "Content-Type: application/json" \
  -d '{"boardSize": 15, "rule": 0, "moves": [], "maxDepth": 10}'
```

**Resume an ongoing game — send full history:**

```bash
curl -X POST /api/games/gomoku/move \
  -H "Content-Type: application/json" \
  -d '{
    "boardSize": 15,
    "rule": 0,
    "moves": [
      {"x": 7, "y": 7, "player": 1},
      {"x": 8, "y": 8, "player": 2},
      {"x": 6, "y": 6, "player": 1},
      {"x": 9, "y": 9, "player": 2}
    ],
    "maxDepth": 12
  }'
```

---

## `GET /api/games/gomoku/info`

Check engine execution status and metadata.

**Auth:** Not required

### Response `200`

```json
{
  "success": true,
  "data": {
    "running": true,
    "about": "name=\"Rapfi\", version=\"2024.1\", author=\"dhbloo\", country=\"China\""
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.running` | boolean | Is the background worker process currently active |
| `data.about` | string\|null | Engine metadata directly from the executable (null if stopped) |

---

## Rate Limiting & Queueing Rules

- **Per-IP limit**: Max **5 requests** in the processing queue at any given time.
- **Queue timeout**: Requests waiting in the queue for more than **30 seconds** will be rejected with `408`.
- **Auto-stop**: Engine process automatically terminates after **60 seconds** of inactivity to conserve server resources.
- **Singleton process**: The server spawns strictly **1 process instance** globally. Concurrent requests are queued and processed sequentially.
