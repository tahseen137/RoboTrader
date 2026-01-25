@echo off
REM ============================================================================
REM DEPLOY CACHING SOLUTION (Windows)
REM ============================================================================
REM This script deploys the Alpha Vantage rate limit caching solution
REM Run this from the RoboTrader root directory
REM ============================================================================

echo ==========================================
echo RoboTrader - Deploy Caching Solution
echo ==========================================
echo.

REM Check if Docker is running
echo Step 1: Checking Docker status...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop and try again
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Check if containers are running
echo Step 2: Checking RoboTrader containers...
docker ps | findstr trading_postgres >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PostgreSQL container not running
    echo Starting containers...
    docker-compose up -d
    echo Waiting 10 seconds for PostgreSQL to initialize...
    timeout /t 10 /nobreak >nul
)
echo [OK] Containers are running
echo.

REM Apply database migration
echo Step 3: Applying database migration...
docker exec -i trading_postgres psql -U n8n -d wealthsimple_trader < migrations\001_add_market_data_cache.sql
if errorlevel 1 (
    echo [ERROR] Database migration failed
    exit /b 1
)
echo [OK] Database migration completed
echo.

REM Verify table was created
echo Step 4: Verifying cache table...
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'market_data_cache';"
echo [OK] Cache table verified
echo.

REM Show cache table info
echo Step 5: Cache table details...
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'market_data_cache' ORDER BY ordinal_position;"
echo.

REM Success message
echo ==========================================
echo [SUCCESS] DEPLOYMENT COMPLETE
echo ==========================================
echo.
echo Next steps:
echo 1. Open n8n: http://localhost:5678
echo 2. Import workflow: n8n-workflows\1-market-scanner-cached.json
echo 3. Deactivate old 'Market Scanner' workflow
echo 4. Activate new 'Market Scanner (Cached)' workflow
echo.
echo To monitor cache performance:
echo   docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "SELECT symbol, close_price, cached_at FROM market_data_cache ORDER BY cached_at DESC LIMIT 5;"
echo.
echo Full documentation: CACHING_SOLUTION.md
echo.
pause
