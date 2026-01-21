# n8n Credentials Setup

Access n8n at http://localhost:5678

## 1. PostgreSQL

**Type**: Postgres
**Name**: Trading Database

```
Host: postgres
Port: 5432
Database: wealthsimple_trader
User: n8n
Password: [from .env DB_PASSWORD]
SSL: Disabled
```

## 2. Finnhub API

**Type**: HTTP Request (Header Auth)
**Name**: Finnhub API

```
Authentication: Header Auth
Header Name: X-Finnhub-Token
Header Value: [your FINNHUB_API_KEY]
```

## 3. Alpha Vantage API

**Type**: HTTP Request (No Auth - uses query params)
**Name**: Alpha Vantage API

No authentication needed - API key passed in URL params.

## 4. SnapTrade API

**Type**: HTTP Request (Header Auth)
**Name**: SnapTrade API

```
Authentication: Header Auth
Header Name: Authorization
Header Value: Bearer [your SNAPTRADE_API_KEY]
```

## Verification

Test each credential after creation using n8n's "Test" button.
