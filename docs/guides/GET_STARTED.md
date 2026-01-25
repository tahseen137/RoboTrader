# Get Started - Add Your API Keys

## Current Status
✓ Docker running
✓ n8n accessible at http://localhost:5678
✓ Database initialized
✓ Workflows ready to import

## Next: Add API Keys

### Option 1: Manual Edit
Open `.env` file and update:

```bash
# Replace this placeholder:
FINNHUB_API_KEY=your_finnhub_api_key_here

# With your actual key:
FINNHUB_API_KEY=cp123abc...
```

### Option 2: Command Line (Windows)
```powershell
# Replace YOUR_ACTUAL_KEY with your key
(Get-Content .env) -replace 'FINNHUB_API_KEY=your_finnhub_api_key_here','FINNHUB_API_KEY=YOUR_ACTUAL_KEY' | Set-Content .env
```

## Get Your Finnhub Key

1. Go to: https://finnhub.io/register
2. Sign up (email + password)
3. Dashboard → API Key tab → Copy key
4. Paste into `.env` as shown above

## Verify Key Works

Test the API:
```bash
# Get your key
grep FINNHUB_API_KEY .env

# Test it (replace with your key)
curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_KEY"
```

Should return JSON with stock data.

## Then Follow Quick Test

Once key is in `.env`, follow **QUICK_TEST.md** to:
1. Configure n8n credentials
2. Import Market Scanner
3. Test workflow

---

**Having trouble?** The key should look like: `cp123abc456def789` (alphanumeric string)
