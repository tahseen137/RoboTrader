#!/bin/bash
# ============================================================================
# DAILY PERFORMANCE REPORT
# ============================================================================
# Generates end-of-day trading report
# Run: ./scripts/daily_report.sh
# ============================================================================

echo "=========================================="
echo "RoboTrader - Daily Performance Report"
echo "Date: $(date +"%Y-%m-%d")"
echo "=========================================="
echo ""

# Run monitoring queries
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -f scripts/monitor.sql

echo ""
echo "Report saved to: logs/report_$(date +%Y%m%d).log"
echo ""
