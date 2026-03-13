# Chess AI Engine

Chess API powered by Stockfish — the world's strongest open-source chess engine.

> Engine: [Stockfish](https://stockfishchess.org/) — UCI protocol  
> Stateless: each request sends the board state (FEN or moves), the server does not persist game state

---

## `POST /api/games/chess/move`

Send a board position, receive the best move from the AI.

**Auth:** Not required

### Request Body

**Option 1 — FEN string** (recommended, most flexible):

```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "depth": 12,
  "multiPV": 1,
  "skillLevel": 20
}
```

**Option 2 — Moves list** (from the starting position):

```json
{
  "moves": ["e2e4", "e7e5", "g1f3"],
  "depth": 12
}
```

**Neither provided** → engine computes the first move from the starting position.

> If both `fen` and `moves` are provided, `fen` takes priority.

### Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `fen` | string | No | — | Board state in [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) format |
| `moves` | string[] | No | `[]` | List of UCI moves from the starting position |
| `depth` | number | No | `12` | Search depth. Range: `1` – `15` |
| `multiPV` | number | No | `1` | Number of best moves to return. Range: `1` – `3` |
| `skillLevel` | number | No | `20` | AI strength. Range: `0` (weakest) – `20` (strongest) |

### FEN String

FEN (Forsyth–Edwards Notation) fully describes a board state in a single string:

```
rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
│                                                │  │    │  │ │
│                                                │  │    │  │ └─ Fullmove number
│                                                │  │    │  └─── Halfmove clock
│                                                │  │    └────── En passant square
│                                                │  └─────────── Castling rights
│                                                └────────────── Side to move (w=white, b=black)
└──────────────────────────────────────────────────────────────── Piece placement (rank 8→1)
```

Starting position: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`

### Moves — UCI Notation

Move format: `<from><to>[promotion]`:

| Example | Description |
|---------|-------------|
| `e2e4` | Pawn e2 to e4 |
| `g1f3` | Knight g1 to f3 |
| `e1g1` | Kingside castling (White) |
| `e1c1` | Queenside castling (White) |
| `e7e8q` | Pawn promotes to Queen |
| `e7e8r` | Pawn promotes to Rook |

Promotion pieces: `q` (queen), `r` (rook), `b` (bishop), `n` (knight)

### `skillLevel` — Difficulty Adjustment

| Value | Estimated Strength |
|-------|-------------------|
| `0` | Beginner (~1100 Elo) |
| `5` | Amateur (~1500 Elo) |
| `10` | Intermediate (~1900 Elo) |
| `15` | Advanced (~2200 Elo) |
| `20` | Maximum strength (~3200+ Elo) |

### `multiPV` — Multiple Candidate Moves

- `1` — Returns only `bestmove` (fastest)
- `2` — Returns top 2 best moves (~2x slower)
- `3` — Returns top 3 best moves (~3x slower)

### Success Response `200`

**multiPV = 1:**

```json
{
  "success": true,
  "bestmove": "g1f3",
  "ponder": "b8c6",
  "evaluation": { "type": "cp", "value": 35 },
  "lines": null,
  "engineTime": 850
}
```

**multiPV = 3:**

```json
{
  "success": true,
  "bestmove": "g1f3",
  "ponder": "b8c6",
  "evaluation": { "type": "cp", "value": 35 },
  "lines": [
    { "rank": 1, "move": "g1f3", "score": { "type": "cp", "value": 35 }, "pv": ["g1f3", "b8c6", "f1b5"] },
    { "rank": 2, "move": "d2d4", "score": { "type": "cp", "value": 28 }, "pv": ["d2d4", "d7d5"] },
    { "rank": 3, "move": "f1c4", "score": { "type": "cp", "value": 22 }, "pv": ["f1c4", "g8f6"] }
  ],
  "engineTime": 2400
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `bestmove` | string | Best move (UCI notation) |
| `ponder` | string\|null | Move the engine predicts the opponent will play next |
| `evaluation` | object\|null | Position evaluation |
| `evaluation.type` | string | `"cp"` (centipawn) or `"mate"` (checkmate) |
| `evaluation.value` | number | Positive cp = White advantage, negative = Black advantage. Positive mate = White mates in N moves |
| `lines` | array\|null | Candidate move list (only when `multiPV > 1`) |
| `lines[].rank` | number | Rank (1 = best) |
| `lines[].move` | string | Move |
| `lines[].score` | object | Individual evaluation for this move |
| `lines[].pv` | string[] | Principal variation — optimal move sequence |
| `engineTime` | number | AI thinking time (ms) |

### Evaluation Explained

| Example | Meaning |
|---------|---------|
| `{ "type": "cp", "value": 100 }` | White is up 1 pawn (100 centipawns = 1 pawn) |
| `{ "type": "cp", "value": -250 }` | Black is up 2.5 pawns |
| `{ "type": "mate", "value": 3 }` | White checkmates in 3 moves |
| `{ "type": "mate", "value": -1 }` | Black checkmates in 1 move |

### Errors

| Status | When |
|--------|------|
| `400` | Invalid input (bad FEN format, invalid UCI moves) |
| `408` | Request waited more than 30 seconds in queue |
| `429` | This IP already has 5 pending requests |
| `500` | Engine error or no legal moves (game over) |

### Usage Examples

**First move (White):**

```bash
curl -X POST /api/games/chess/move \
  -H "Content-Type: application/json" \
  -d '{"depth": 12}'
```

**From FEN with top 3 suggestions:**

```bash
curl -X POST /api/games/chess/move \
  -H "Content-Type: application/json" \
  -d '{
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "depth": 12,
    "multiPV": 3
  }'
```

**From moves list, weak AI:**

```bash
curl -X POST /api/games/chess/move \
  -H "Content-Type: application/json" \
  -d '{
    "moves": ["e2e4", "e7e5", "g1f3"],
    "depth": 10,
    "skillLevel": 5
  }'
```

---

## `GET /api/games/chess/info`

Check engine status.

**Auth:** Not required

### Response `200`

```json
{
  "success": true,
  "data": {
    "running": true,
    "name": "Stockfish 11",
    "author": "T. Romstad, M. Costalba, J. Kiiski, G. Linscott"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.running` | boolean | Whether the engine process is currently running |
| `data.name` | string\|null | Engine name (null if not started) |
| `data.author` | string\|null | Author (null if not started) |

---

## Rate Limiting

- Max **5 pending requests** per IP in the queue
- Requests waiting more than **30 seconds** auto-timeout (`408`)
- Engine auto-shuts down after **60 seconds** of inactivity (saves resources)
- Engine runs as a **single process** — requests are queued and processed sequentially
- Fixed configuration: `Threads: 1`, `Hash: 64MB` (suitable for shared hosting)
