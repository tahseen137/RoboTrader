# Contributing to RoboTrader

## Development Workflow

This project follows a structured branch-based development workflow to ensure code quality and traceability.

---

## Branch Strategy

### Branch Naming Convention

```
feature/phase{N}-{description}
```

Examples:
- `feature/phase1-docker-setup`
- `feature/phase2-market-scanner`
- `feature/phase3-risk-management`
- `feature/phase4-react-dashboard`
- `bugfix/phase2-indicator-calculation`
- `hotfix/critical-margin-bug`

### Main Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only |
| `feature/phase{N}-*` | Active development for each phase |

---

## Phase Development Workflow

### Before Starting a New Phase

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Create a new feature branch for the phase
git checkout -b feature/phase{N}-{description}

# 3. Push the branch to remote (creates tracking)
git push -u origin feature/phase{N}-{description}
```

### During Development

```bash
# Commit frequently with descriptive messages
git add .
git commit -m "feat(phase{N}): description of changes"

# Push periodically to backup work
git push
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(phase1): Add Docker configuration and setup documentation
feat(phase2): Implement market scanner workflow with Finnhub API
fix(phase2): Correct RSI calculation for edge cases
docs(phase1): Update API integration documentation
```

---

## Pre-Push Checklist

Before pushing code at the end of a phase, run these checks:

### 1. Build Check

```bash
# For Docker-based components
docker-compose config    # Validate docker-compose.yml
docker-compose build     # Build images (if applicable)

# For React frontend (Phase 4+)
cd frontend
npm install
npm run build
npm run lint
```

### 2. Quality Checks

```bash
# Validate YAML files
docker-compose config

# Check for secrets in code (never commit .env)
git diff --cached --name-only | xargs grep -l "API_KEY\|PASSWORD\|SECRET" || echo "No secrets found"

# Verify .env is not staged
git status | grep -q "\.env$" && echo "WARNING: .env is staged!" || echo "OK: .env not staged"

# Check for large files
find . -type f -size +1M -not -path "./.git/*" -not -path "./node_modules/*"
```

### 3. Documentation Check

- [ ] README.md updated (if needed)
- [ ] CLAUDE.md updated (if architecture changed)
- [ ] PHASE{N}_PROGRESS.md updated with completion status
- [ ] New environment variables documented in .env.example

### 4. Security Check

- [ ] No API keys or secrets in code
- [ ] .env file is in .gitignore
- [ ] No hardcoded credentials
- [ ] Sensitive data masked in logs

---

## End of Phase Workflow

### Complete Checklist

Run this checklist before marking a phase complete:

```bash
# 1. Run all quality checks
./scripts/quality-check.sh  # (if available)

# Or manually:
docker-compose config
git status  # Ensure no unwanted files

# 2. Stage and commit final changes
git add .
git commit -m "feat(phase{N}): Complete Phase {N} - {description}"

# 3. Push to remote
git push origin feature/phase{N}-{description}

# 4. Create Pull Request (optional, for review)
gh pr create --title "Phase {N}: {Description}" --body "## Summary
- Completed task 1
- Completed task 2

## Checklist
- [x] Build passes
- [x] Quality checks pass
- [x] Documentation updated
- [x] No secrets in code"

# 5. After PR approval (or self-review), merge to main
git checkout main
git pull origin main
git merge feature/phase{N}-{description}
git push origin main

# 6. Tag the release (optional)
git tag -a v0.{N}.0 -m "Phase {N} complete"
git push origin v0.{N}.0
```

---

## Quality Check Script

Create this script at `scripts/quality-check.sh`:

```bash
#!/bin/bash
set -e

echo "=== RoboTrader Quality Check ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Docker Compose Validation
echo "1. Validating docker-compose.yml..."
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.yml is valid${NC}"
else
    echo -e "${RED}✗ docker-compose.yml has errors${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check for secrets
echo ""
echo "2. Checking for exposed secrets..."
if git diff --cached --name-only 2>/dev/null | xargs grep -l "CHANGE_ME\|your_.*_here\|API_KEY=sk-" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Found placeholder secrets (OK if in .env.example)${NC}"
else
    echo -e "${GREEN}✓ No exposed secrets found${NC}"
fi

# 3. Check .env not staged
echo ""
echo "3. Verifying .env is not staged..."
if git status --porcelain 2>/dev/null | grep -q "^A.*\.env$"; then
    echo -e "${RED}✗ WARNING: .env is staged for commit!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ .env is not staged${NC}"
fi

# 4. Check for large files
echo ""
echo "4. Checking for large files (>1MB)..."
LARGE_FILES=$(find . -type f -size +1M -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./postgres-data/*" -not -path "./n8n-data/*" 2>/dev/null)
if [ -z "$LARGE_FILES" ]; then
    echo -e "${GREEN}✓ No large files found${NC}"
else
    echo -e "${YELLOW}⚠ Large files found:${NC}"
    echo "$LARGE_FILES"
fi

# 5. Validate JSON files
echo ""
echo "5. Validating JSON files..."
JSON_ERRORS=0
for f in $(find . -name "*.json" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null); do
    if ! python -m json.tool "$f" > /dev/null 2>&1; then
        echo -e "${RED}✗ Invalid JSON: $f${NC}"
        JSON_ERRORS=$((JSON_ERRORS + 1))
    fi
done
if [ $JSON_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All JSON files valid${NC}"
else
    ERRORS=$((ERRORS + JSON_ERRORS))
fi

# 6. Check containers (if running)
echo ""
echo "6. Checking Docker containers..."
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    echo -e "${GREEN}✓ Containers are running${NC}"
    docker-compose ps
else
    echo -e "${YELLOW}⚠ No containers running (OK if not started yet)${NC}"
fi

# Summary
echo ""
echo "=== Quality Check Complete ==="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}$ERRORS error(s) found. Please fix before pushing.${NC}"
    exit 1
fi
```

---

## Phase Overview

| Phase | Branch | Description | Status |
|-------|--------|-------------|--------|
| 1 | `feature/phase1-docker-setup` | Docker + Database Setup | In Progress |
| 2 | `feature/phase2-core-workflows` | Market Scanner, Trade Execution, Position Monitor | Not Started |
| 3 | `feature/phase3-risk-tax` | Risk Management, Tax Tracking | Not Started |
| 4 | `feature/phase4-dashboard` | React Dashboard | Not Started |
| 5 | `feature/phase5-testing` | Paper Trading, Backtesting | Not Started |
| 6 | `feature/phase6-production` | Go Live | Not Started |

---

## Getting Help

- Review `CLAUDE.md` for project context
- Check `implementation_tasks_n8n.md` for detailed task breakdown
- See `QUICKSTART.md` for setup instructions

---

**Last Updated**: January 20, 2026
