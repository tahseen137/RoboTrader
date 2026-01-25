#!/bin/bash

# ============================================================================
# DEPLOY CACHING SOLUTION
# ============================================================================
# This script deploys the Alpha Vantage rate limit caching solution
# Run this from the RoboTrader root directory
# ============================================================================

set -e  # Exit on error

echo "=========================================="
echo "RoboTrader - Deploy Caching Solution"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "Step 1: Checking Docker status..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Check if containers are running
echo "Step 2: Checking RoboTrader containers..."
if ! docker ps | grep -q trading_postgres; then
    echo -e "${YELLOW}WARNING: PostgreSQL container not running${NC}"
    echo "Starting containers..."
    docker-compose up -d
    echo "Waiting 10 seconds for PostgreSQL to initialize..."
    sleep 10
fi
echo -e "${GREEN}✓ Containers are running${NC}"
echo ""

# Apply database migration
echo "Step 3: Applying database migration..."
docker exec -i trading_postgres psql -U n8n -d wealthsimple_trader < migrations/001_add_market_data_cache.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migration completed${NC}"
else
    echo -e "${RED}ERROR: Database migration failed${NC}"
    exit 1
fi
echo ""

# Verify table was created
echo "Step 4: Verifying cache table..."
ROWS=$(docker exec trading_postgres psql -U n8n -d wealthsimple_trader -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'market_data_cache';")

if [ "$ROWS" -eq 1 ]; then
    echo -e "${GREEN}✓ Cache table verified${NC}"
else
    echo -e "${RED}ERROR: Cache table not found${NC}"
    exit 1
fi
echo ""

# Show cache table info
echo "Step 5: Cache table details..."
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'market_data_cache'
ORDER BY ordinal_position;
"
echo ""

# Success message
echo "=========================================="
echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open n8n: http://localhost:5678"
echo "2. Import workflow: n8n-workflows/1-market-scanner-cached.json"
echo "3. Deactivate old 'Market Scanner' workflow"
echo "4. Activate new 'Market Scanner (Cached)' workflow"
echo ""
echo "To monitor cache performance:"
echo "  docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c \\"
echo "    \"SELECT symbol, close_price, cached_at FROM market_data_cache ORDER BY cached_at DESC LIMIT 5;\""
echo ""
echo "Full documentation: CACHING_SOLUTION.md"
echo ""
