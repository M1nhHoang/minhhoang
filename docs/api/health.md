# Health Check

## `GET /api/health`

Checks if the server is running and returning responses.

**Auth:** Not required

### Response `200`

```json
{
  "status": "ok",
  "uptime": 12345.678
}
```

| Field | Type | Description |
|-------|------|--------|
| `status` | string | Always `"ok"` |
| `uptime` | number | Server uptime in seconds |
