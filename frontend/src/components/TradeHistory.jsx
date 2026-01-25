import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip } from '@mui/material';

export default function TradeHistory({ trades }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Recent Trades</Typography>
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Side</TableCell>
              <TableCell align="right">P&L</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.slice(0, 10).map((trade) => (
              <TableRow key={trade.trade_id}>
                <TableCell>{trade.symbol}</TableCell>
                <TableCell>
                  <Chip label={trade.side.toUpperCase()} color={trade.side === 'buy' ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell align="right" sx={{ color: trade.profit_loss >= 0 ? 'success.main' : 'error.main' }}>
                  ${trade.profit_loss?.toFixed(2) || '0.00'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
