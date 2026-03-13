# Users

API for user management.

---

## `GET /api/users`

List all users.

**Auth:** Not required

### Query Parameters

| Param | Type | Description |
|-------|------|--------|
| `status` | string | Filter by status (e.g. `online`, `offline`) |
| `type` | string | Filter by account type |

### Response `200`

```json
{
  "data": [
    {
      "username": "admin",
      "status": "offline",
      "type": "LEGENDARY",
      "role": "ADMIN"
    }
  ]
}
```

---

## `GET /api/users/:username`

Get information about a specific user.

**Auth:** Not required

### Path Parameters

| Param | Description |
|-------|--------|
| `username` | The username |

### Response `200`

```json
{
  "data": {
    "username": "admin",
    "status": "offline"
  }
}
```

### Error `404`

```json
{
  "message": "User not found"
}
```

---

## `POST /api/users`

Create a new user.

**Auth:** Not required

### Request Body

```json
{
  "username": "newuser",
  "password": "password123"
}
```

### Response `201`

```json
{
  "data": {
    "username": "newuser",
    "status": "offline"
  }
}
```

---

## `PATCH /api/users/:username/status`

Update user status.

**Auth:** Not required

### Path Parameters

| Param | Description |
|-------|--------|
| `username` | The username |

### Request Body

```json
{
  "status": "online"
}
```

### Response `200`

```json
{
  "data": {
    "username": "newuser",
    "status": "online"
  }
}
```

### Error `404`

```json
{
  "message": "User not found"
}
```
