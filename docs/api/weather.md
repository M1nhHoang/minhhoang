# Weather

API for fetching weather information based on the user's IP address.

---

## `GET /api/weather`

Returns current weather data derived from the requester's IP.

**Auth:** Not required

### Success Response `200`

```json
{
  "success": true,
  "data": {
    "location": { "name": "Ho Chi Minh City", "country": "Vietnam" },
    "current": { "temp_c": 32, "condition": { "text": "Sunny", "code": 1000 } },
    "effects": {
      "category": "CLEAR",
      "intensity": 0,
      "isRainy": false,
      "isSnowy": false,
      "isCold": false,
      "isHot": true,
      "isDaytime": true
    }
  }
}
```

### Fallback Response `200`

If the weather cannot be fetched (e.g., missing API key or network error), the API still returns a `200` status with default fallback data:

```json
{
  "success": false,
  "error": "API key not configured",
  "data": {
    "location": null,
    "current": null,
    "effects": {
      "category": "UNKNOWN",
      "intensity": 0.3,
      "isRainy": false,
      "isSnowy": false,
      "isCold": false,
      "isHot": false,
      "isDaytime": true
    }
  }
}
```
