import { Paper, Grid, Typography, Box, LinearProgress } from '@mui/material';
import { TrendingUp, AccountBalance, ShowChart } from '@mui/icons-material';

export default function AccountOverview({ data }) {
  if (!data) return <Paper sx={{ p: 3 }}><Typography>Loading...</Typography></Paper>;

  const marginColor = data.margin_health > 150 ? 'success' : data.margin_health > 125 ? 'warning' : 'error';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Account Overview</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance color="primary" />
            <Box>
              <Typography variant="caption">Total Equity</Typography>
              <Typography variant="h6">${data.equity.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="success" />
            <Box>
              <Typography variant="caption">Buying Power</Typography>
              <Typography variant="h6">${data.buying_power.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChart color={marginColor} />
            <Box>
              <Typography variant="caption">Margin Health</Typography>
              <Typography variant="h6">{data.margin_health.toFixed(0)}%</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="caption">Daily P&L</Typography>
            <Typography variant="h6" color={data.daily_pnl >= 0 ? 'success.main' : 'error.main'}>
              ${data.daily_pnl.toFixed(2)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption">Margin Health</Typography>
          <LinearProgress variant="determinate" value={Math.min(data.margin_health, 200)} color={marginColor} sx={{ height: 8, borderRadius: 1 }} />
        </Grid>
      </Grid>
    </Paper>
  );
}
