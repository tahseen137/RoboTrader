import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Grid, Typography } from '@mui/material';
import AccountOverview from './components/AccountOverview';
import PositionsTable from './components/PositionsTable';
import TradeHistory from './components/TradeHistory';
import FundSlider from './components/FundSlider';
import AlertPanel from './components/AlertPanel';
import axios from 'axios';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ff88' },
    secondary: { main: '#ff4444' },
    background: { default: '#0a0e1a', paper: '#161b2e' }
  }
});

const API_BASE = 'http://localhost:5678/webhook';

function App() {
  const [accountData, setAccountData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fundAllocation, setFundAllocation] = useState(5000);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [account, pos, trade, alert] = await Promise.all([
        axios.get(`${API_BASE}/account-data`),
        axios.get(`${API_BASE}/positions`),
        axios.get(`${API_BASE}/trades`),
        axios.get(`${API_BASE}/alerts`)
      ]);
      setAccountData(account.data);
      setPositions(pos.data);
      setTrades(trade.data);
      setAlerts(alert.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          RoboTrader Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AccountOverview data={accountData} />
          </Grid>

          <Grid item xs={12} md={8}>
            <PositionsTable positions={positions} />
          </Grid>

          <Grid item xs={12} md={4}>
            <AlertPanel alerts={alerts} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FundSlider value={fundAllocation} onChange={setFundAllocation} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TradeHistory trades={trades} />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
