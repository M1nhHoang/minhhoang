# Authentication

Account login and creation API.

---

## `POST /api/auth/login`

Login to an account.

**Auth:** Not required

### Request Body

```json
{
  "username": "admin",
  "password": "admin"
}
```

| Field | Type | Required | Description |
|-------|------|----------|--------|
| `username` | string | Yes | The username |
| `password` | string | Yes | The password |

### Success Response `200`

```json
{
  "data": {
    "username": "admin",
    "isVerified": true,
    "type": "LEGENDARY",
    "role": "ADMIN",
    "roleName": "Admin",
    "isAdmin": true,
    "isVIP": false,
    "message": "Chào mừng Admin! 👑"
  }
}
```

### Unverified Account Response `403`

```json
{
  "data": {
    "username": "user1",
    "isVerified": false,
    "rickrollUrl": "...",
    "message": "Tài khoản chưa được kích hoạt đâu, liên hệ admin nhé :D"
  }
}
```

---

## `POST /api/auth/forgot`

Create a new "legendary" account.

**Auth:** Not required

### Request Body

```json
{
  "password": "mypassword"
}
```

| Field | Type | Required | Description |
|-------|------|----------|--------|
| `password` | string | Yes | Password for the new account (also accepts `rememberedPassword` field) |

### Response `201`

```json
{
  "data": {
    "username": "legend_abc123",
    "isVerified": true,
    "message": "Chào chiến thần! Tài khoản VIP của bạn đã sẵn sàng."
  }
}
```
