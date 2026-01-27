import { Paper, Grid, Typography, Box, LinearProgress } from '@mui/material';
import { TrendingUp, AccountBalance, ShowChart } from '@mui/icons-material';

export default function AccountOverview({ data }) {
  if (!data) return <Paper sx={{ p: 3 }}><Typography>Loading...</Typography></Paper>;

  // Provide default values for all properties
  const equity = data.equity ?? 0;
  const buyingPower = data.buying_power ?? 0;
  const marginHealth = data.margin_health ?? 150;
  const dailyPnl = data.daily_pnl ?? 0;

  const marginColor = marginHealth > 150 ? 'success' : marginHealth > 125 ? 'warning' : 'error';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Account Overview</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance color="primary" />
            <Box>
              <Typography variant="caption">Total Equity</Typography>
              <Typography variant="h6">${equity.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="success" />
            <Box>
              <Typography variant="caption">Buying Power</Typography>
              <Typography variant="h6">${buyingPower.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChart color={marginColor} />
            <Box>
              <Typography variant="caption">Margin Health</Typography>
              <Typography variant="h6">{marginHealth.toFixed(0)}%</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="caption">Daily P&L</Typography>
            <Typography variant="h6" color={dailyPnl >= 0 ? 'success.main' : 'error.main'}>
              ${dailyPnl.toFixed(2)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption">Margin Health</Typography>
          <LinearProgress variant="determinate" value={Math.min(marginHealth, 200)} color={marginColor} sx={{ height: 8, borderRadius: 1 }} />
        </Grid>
      </Grid>
    </Paper>
  );
}
