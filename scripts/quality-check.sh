#!/bin/bash
# RoboTrader Quality Check Script
# Run this before pushing code at the end of each phase

set -e

echo "=== RoboTrader Quality Check ==="
echo ""

# Colors (works on most terminals)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"
echo ""

# 1. Docker Compose Validation
echo "1. Validating docker-compose.yml..."
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.yml is valid${NC}"
else
    echo -e "${RED}✗ docker-compose.yml has errors${NC}"
    docker-compose config 2>&1 | head -5
    ERRORS=$((ERRORS + 1))
fi

# 2. Check .env exists (but not .env in git)
echo ""
echo "2. Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ .env file missing (copy from .env.example)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓ .env.example template exists${NC}"
else
    echo -e "${RED}✗ .env.example missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check .env not in git
echo ""
echo "3. Verifying .env is gitignored..."
if git check-ignore .env > /dev/null 2>&1; then
    echo -e "${GREEN}✓ .env is properly gitignored${NC}"
else
    echo -e "${RED}✗ WARNING: .env may not be gitignored!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if .env is staged
if git status --porcelain 2>/dev/null | grep -q "\.env$"; then
    echo -e "${RED}✗ CRITICAL: .env is staged for commit!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ .env is not staged${NC}"
fi

# 4. Check for placeholder secrets in staged files
echo ""
echo "4. Checking for placeholder secrets in code..."
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || echo "")
if [ -n "$STAGED_FILES" ]; then
    # Look for common secret patterns (excluding .env.example which should have placeholders)
    SECRET_PATTERNS="your_.*_key_here|your_.*_secret|CHANGE_ME|sk-[a-zA-Z0-9]|password123"
    FOUND_SECRETS=$(echo "$STAGED_FILES" | grep -v ".env.example" | xargs grep -l -E "$SECRET_PATTERNS" 2>/dev/null || echo "")
    if [ -n "$FOUND_SECRETS" ]; then
        echo -e "${YELLOW}⚠ Possible secrets found in:${NC}"
        echo "$FOUND_SECRETS"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓ No secrets found in staged files${NC}"
    fi
else
    echo -e "${GREEN}✓ No staged files to check${NC}"
fi

# 5. Check for large files
echo ""
echo "5. Checking for large files (>1MB)..."
LARGE_FILES=$(find . -type f -size +1M \
    -not -path "./.git/*" \
    -not -path "./node_modules/*" \
    -not -path "./postgres-data/*" \
    -not -path "./n8n-data/*" \
    -not -path "./.claude/*" \
    2>/dev/null || echo "")
if [ -z "$LARGE_FILES" ]; then
    echo -e "${GREEN}✓ No large files found${NC}"
else
    echo -e "${YELLOW}⚠ Large files found (review if needed):${NC}"
    echo "$LARGE_FILES" | head -10
    WARNINGS=$((WARNINGS + 1))
fi

# 6. Validate SQL files syntax (basic check)
echo ""
echo "6. Checking SQL files..."
SQL_FILES=$(find . -name "*.sql" -not -path "./.git/*" 2>/dev/null || echo "")
if [ -n "$SQL_FILES" ]; then
    SQL_ERRORS=0
    for f in $SQL_FILES; do
        # Basic syntax check - look for common issues
        if grep -q ";;$" "$f" 2>/dev/null; then
            echo -e "${YELLOW}⚠ Double semicolon in $f${NC}"
            SQL_ERRORS=$((SQL_ERRORS + 1))
        fi
    done
    if [ $SQL_ERRORS -eq 0 ]; then
        echo -e "${GREEN}✓ SQL files look OK${NC}"
    fi
else
    echo -e "${GREEN}✓ No SQL files to check${NC}"
fi

# 7. Check Docker containers (if available)
echo ""
echo "7. Checking Docker status..."
if command -v docker &> /dev/null; then
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Docker is running${NC}"

        # Check if our containers are up
        if docker-compose ps 2>/dev/null | grep -q "trading_"; then
            echo -e "${GREEN}✓ Project containers found:${NC}"
            docker-compose ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null | grep "trading_" || true
        else
            echo -e "${YELLOW}⚠ Project containers not running (OK if testing locally)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Docker daemon not accessible${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ Docker not installed${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 8. Check required documentation exists
echo ""
echo "8. Checking documentation..."
REQUIRED_DOCS=("README.md" "CLAUDE.md" ".env.example" "docker-compose.yml")
DOC_ERRORS=0
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓ $doc exists${NC}"
    else
        echo -e "${RED}✗ $doc missing${NC}"
        DOC_ERRORS=$((DOC_ERRORS + 1))
    fi
done
ERRORS=$((ERRORS + DOC_ERRORS))

# 9. Git status summary
echo ""
echo "9. Git status summary..."
MODIFIED=$(git status --porcelain 2>/dev/null | grep "^ M" | wc -l)
STAGED=$(git status --porcelain 2>/dev/null | grep "^M\|^A" | wc -l)
UNTRACKED=$(git status --porcelain 2>/dev/null | grep "^??" | wc -l)
echo "   Modified: $MODIFIED | Staged: $STAGED | Untracked: $UNTRACKED"

BRANCH=$(git branch --show-current 2>/dev/null)
echo "   Current branch: $BRANCH"

# Summary
echo ""
echo "==========================================="
echo "         QUALITY CHECK SUMMARY"
echo "==========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}"
    echo "  ✓ All checks passed!"
    echo -e "${NC}"
    echo "  Ready to commit and push."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}"
    echo "  ⚠ Passed with $WARNINGS warning(s)"
    echo -e "${NC}"
    echo "  Review warnings above before pushing."
    exit 0
else
    echo -e "${RED}"
    echo "  ✗ $ERRORS error(s) and $WARNINGS warning(s) found"
    echo -e "${NC}"
    echo "  Please fix errors before pushing."
    exit 1
fi
