# Settings

API for global system configurations (e.g., UI themes).

---

## `GET /api/settings/theme`

Get current active theme.

**Auth:** Not required (Public)

### Response `200`

```json
{
  "data": {
    "mode": "auto",
    "theme": "christmas",
    "updatedBy": "admin"
  }
}
```

---

## `PUT /api/settings/theme`

Update the system theme.

**Auth:** Authentication + Admin role required (`X-Username` header + ADMIN role)

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|--------|
| `mode` | string | Yes | `"auto"` \| `"manual"` \| `"default"` |
| `theme` | string | Only if `mode = "manual"` | The specific theme name (e.g. `"christmas"`, `"lunarnewyear"`, `"newyear"`) |

**Modes:**
- `auto` — System dynamically selects themes based on real-world seasons/dates
- `manual` — Forces the theme specified in the `theme` field
- `default` — Disables all themes (uses standard application styles)

### Examples

```json
{ "mode": "auto" }
```

```json
{ "mode": "manual", "theme": "christmas" }
```

```json
{ "mode": "default" }
```

### Response `200`

```json
{
  "data": {
    "mode": "manual",
    "theme": "christmas",
    "updatedBy": "admin",
    "message": "Theme đã được cập nhật: christmas"
  }
}
```

### Error `400`

```json
{
  "error": "Invalid request. Provide mode (auto/manual/default) and theme for manual mode."
}
```
