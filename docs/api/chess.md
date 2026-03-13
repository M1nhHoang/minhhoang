# Chess AI Engine

API chơi cờ vua với engine AI Stockfish — engine cờ vua mã nguồn mở mạnh nhất thế giới.

> Engine: [Stockfish](https://stockfishchess.org/) — UCI protocol  
> Stateless: mỗi request gửi trạng thái bàn cờ (FEN hoặc moves), server không lưu game state

---

## `POST /api/games/chess/move`

Gửi trạng thái bàn cờ, nhận nước đi tốt nhất của AI.

**Auth:** Không yêu cầu

### Request Body

**Cách 1 — FEN string** (khuyến nghị, linh hoạt nhất):

```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "depth": 12,
  "multiPV": 1,
  "skillLevel": 20
}
```

**Cách 2 — Moves list** (từ vị trí ban đầu):

```json
{
  "moves": ["e2e4", "e7e5", "g1f3"],
  "depth": 12
}
```

**Cả hai không truyền** → engine tính nước đầu tiên từ vị trí ban đầu.

> Nếu cả `fen` và `moves` đều có, `fen` được ưu tiên.

### Tham số

| Field | Type | Required | Default | Mô tả |
|-------|------|----------|---------|--------|
| `fen` | string | Không | — | Trạng thái bàn cờ dạng [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) |
| `moves` | string[] | Không | `[]` | Danh sách nước đi UCI từ vị trí ban đầu |
| `depth` | number | Không | `12` | Độ sâu tìm kiếm. Phạm vi: `1` – `15` |
| `multiPV` | number | Không | `1` | Số nước tốt nhất trả về. Phạm vi: `1` – `3` |
| `skillLevel` | number | Không | `20` | Trình độ AI. Phạm vi: `0` (yếu nhất) – `20` (mạnh nhất) |

### FEN string

FEN (Forsyth–Edwards Notation) mô tả đầy đủ trạng thái bàn cờ trong 1 chuỗi:

```
rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
│                                                │  │    │  │ │
│                                                │  │    │  │ └─ Số nước đầy đủ
│                                                │  │    │  └─── Số nước nửa không ăn/đi tốt
│                                                │  │    └────── Ô en passant
│                                                │  └─────────── Quyền nhập thành
│                                                └────────────── Lượt đi (w=trắng, b=đen)
└──────────────────────────────────────────────────────────────── Vị trí quân (hàng 8→1)
```

Vị trí ban đầu: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`

### Moves — Ký hiệu UCI

Nước đi dạng `<ô_đi><ô_đến>[quân_phong]`:

| Ví dụ | Mô tả |
|-------|--------|
| `e2e4` | Tốt e2 đi e4 |
| `g1f3` | Mã g1 đi f3 |
| `e1g1` | Nhập thành cánh vua (Trắng) |
| `e1c1` | Nhập thành cánh hậu (Trắng) |
| `e7e8q` | Tốt phong cấp thành Hậu |
| `e7e8r` | Tốt phong cấp thành Xe |

Quân phong cấp: `q` (hậu), `r` (xe), `b` (tượng), `n` (mã)

### `skillLevel` — Điều chỉnh độ khó

| Giá trị | Trình độ ước tính |
|---------|-------------------|
| `0` | Người mới (~1100 Elo) |
| `5` | Nghiệp dư (~1500 Elo) |
| `10` | Trung bình (~1900 Elo) |
| `15` | Khá (~2200 Elo) |
| `20` | Sức mạnh tối đa (~3200+ Elo) |

### `multiPV` — Nhiều nước ứng viên

- `1` — Chỉ trả `bestmove` (nhanh nhất)
- `2` — Trả top 2 nước tốt nhất (chậm hơn ~2x)
- `3` — Trả top 3 nước tốt nhất (chậm hơn ~3x)

### Response thành công `200`

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

### Response fields

| Field | Type | Mô tả |
|-------|------|--------|
| `bestmove` | string | Nước đi tốt nhất (UCI notation) |
| `ponder` | string\|null | Nước engine dự đoán đối thủ sẽ đi tiếp |
| `evaluation` | object\|null | Đánh giá thế cờ |
| `evaluation.type` | string | `"cp"` (centipawn) hoặc `"mate"` (chiếu hết) |
| `evaluation.value` | number | Giá trị: cp dương = trắng lợi, âm = đen lợi. mate dương = trắng thắng trong N nước |
| `lines` | array\|null | Danh sách nước ứng viên (chỉ khi `multiPV > 1`) |
| `lines[].rank` | number | Thứ hạng (1 = tốt nhất) |
| `lines[].move` | string | Nước đi |
| `lines[].score` | object | Đánh giá riêng của nước này |
| `lines[].pv` | string[] | Principal variation — chuỗi nước đi tối ưu |
| `engineTime` | number | Thời gian AI suy nghĩ (ms) |

### Evaluation giải thích

| Ví dụ | Nghĩa |
|-------|--------|
| `{ "type": "cp", "value": 100 }` | Trắng hơn 1 quân tốt (100 centipawn = 1 pawn) |
| `{ "type": "cp", "value": -250 }` | Đen hơn 2.5 quân tốt |
| `{ "type": "mate", "value": 3 }` | Trắng chiếu hết trong 3 nước |
| `{ "type": "mate", "value": -1 }` | Đen chiếu hết trong 1 nước |

### Errors

| Status | Khi nào |
|--------|---------|
| `400` | Input không hợp lệ (FEN sai format, moves sai UCI notation) |
| `408` | Request chờ quá 30 giây trong queue |
| `429` | IP này đã có 5 request đang chờ xử lý |
| `500` | Engine lỗi hoặc không còn nước hợp lệ (game over) |

### Ví dụ sử dụng

**Nước đầu tiên (Trắng):**

```bash
curl -X POST /api/games/chess/move \
  -H "Content-Type: application/json" \
  -d '{"depth": 12}'
```

**Từ FEN với top 3 gợi ý:**

```bash
curl -X POST /api/games/chess/move \
  -H "Content-Type: application/json" \
  -d '{
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "depth": 12,
    "multiPV": 3
  }'
```

**Từ moves list, AI yếu:**

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

Kiểm tra trạng thái engine.

**Auth:** Không yêu cầu

### Response `200`

```json
{
  "success": true,
  "data": {
    "running": true,
    "name": "Stockfish 15.1",
    "author": "T. Romstad, M. Costalba, J. Kiiski, G. Linscott"
  }
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `data.running` | boolean | Engine process có đang chạy không |
| `data.name` | string\|null | Tên engine (null nếu chưa chạy) |
| `data.author` | string\|null | Tác giả (null nếu chưa chạy) |

---

## Rate Limiting

- Mỗi IP tối đa **5 request** đang pending trong queue
- Request chờ quá **30 giây** sẽ tự timeout (`408`)
- Engine tự tắt sau **60 giây** không có request (tiết kiệm tài nguyên)
- Engine chỉ chạy **1 process** — các request xếp hàng xử lý tuần tự
- Cấu hình cố định: `Threads: 1`, `Hash: 64MB` (phù hợp shared hosting)
