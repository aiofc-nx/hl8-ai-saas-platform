# Third-Party Integration Patterns

> **Purpose**: Document integration patterns and best practices  
> **Scope**: OAuth, API keys, SSO, webhooks

---

## Overview

The platform supports various integration patterns for third-party systems.

---

## Integration Methods

### 1. OAuth 2.0

**Grant Types**:

- Authorization Code
- Client Credentials

### 2. API Keys

```http
Authorization: ApiKey your-api-key
```

### 3. SSO (Single Sign-On)

- SAML 2.0
- OpenID Connect

---

## Integration Examples

### Custom Domain Integration

```http
POST /api/v1/integrations
{
  "type": "custom",
  "endpoint": "https://example.com/api",
  "authentication": {
    "type": "api_key",
    "key": "your-key"
  }
}
```

---

## Related Documentation

- [Authentication](./authentication.md)
- [Webhooks](./webhooks.md)
