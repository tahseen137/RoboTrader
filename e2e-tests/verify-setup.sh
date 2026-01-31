#!/bin/bash
# E2E Testing Suite Verification Script

echo "🔍 Verifying E2E Testing Suite Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if mock server is running
echo "1. Checking mock server..."
if curl -s http://localhost:5679/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Mock server is running on port 5679"
    HEALTH=$(curl -s http://localhost:5679/health)
    echo "   Status: $HEALTH"
else
    echo -e "${RED}✗${NC} Mock server is NOT running"
    echo "   Run: npm run mock:start"
fi
echo ""

# Check dependencies
echo "2. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Node modules installed"
else
    echo -e "${RED}✗${NC} Node modules NOT installed"
    echo "   Run: npm install"
fi
echo ""

# Check Playwright
echo "3. Checking Playwright browsers..."
if npx playwright --version > /dev/null 2>&1; then
    VERSION=$(npx playwright --version)
    echo -e "${GREEN}✓${NC} Playwright installed: $VERSION"
else
    echo -e "${RED}✗${NC} Playwright NOT installed"
    echo "   Run: npx playwright install"
fi
echo ""

# Test endpoints
echo "4. Testing mock server endpoints..."
ENDPOINTS=("health" "api/scenario" "webhook/account-data" "webhook/positions" "webhook/trades" "webhook/alerts")
for endpoint in "${ENDPOINTS[@]}"; do
    if curl -s "http://localhost:5679/$endpoint" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} GET /$endpoint"
    else
        echo -e "   ${RED}✗${NC} GET /$endpoint"
    fi
done
echo ""

# List available scenarios
echo "5. Available test scenarios:"
SCENARIOS=$(curl -s http://localhost:5679/api/scenario | grep -o '"availableScenarios":\[[^]]*\]' | sed 's/"availableScenarios":\[//;s/\]//;s/"//g')
IFS=',' read -ra SCENARIO_ARRAY <<< "$SCENARIOS"
for scenario in "${SCENARIO_ARRAY[@]}"; do
    echo "   - $scenario"
done
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Setup Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Mock Server: http://localhost:5679"
echo "  Test Scenarios: 11"
echo "  Test Files: 8 (6 critical, 2 high priority)"
echo ""
echo "🚀 Next Steps:"
echo "   1. Start frontend: cd ../frontend-new && npm run dev"
echo "   2. Run tests: npm test"
echo "   3. Or use interactive mode: npm run test:ui"
echo ""
echo "📖 Documentation:"
echo "   - README.md - Quick start guide"
echo "   - IMPLEMENTATION_SUMMARY.md - Complete documentation"
echo ""
