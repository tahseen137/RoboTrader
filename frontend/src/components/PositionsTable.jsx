import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, Chip } from '@mui/material';
import { Close } from '@mui/icons-material';

export default function PositionsTable({ positions }) {
  const handleClose = (posId) => {
    console.log('Close position:', posId);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Open Positions</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Entry</TableCell>
              <TableCell align="right">Current</TableCell>
              <TableCell align="right">P&L</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((pos) => (
              <TableRow key={pos.position_id}>
                <TableCell><Chip label={pos.symbol} color="primary" size="small" /></TableCell>
                <TableCell align="right">{pos.quantity}</TableCell>
                <TableCell align="right">${pos.entry_price.toFixed(2)}</TableCell>
                <TableCell align="right">${pos.current_price.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ color: pos.unrealized_pnl >= 0 ? 'success.main' : 'error.main' }}>
                  ${pos.unrealized_pnl.toFixed(2)} ({pos.unrealized_pnl_percent.toFixed(2)}%)
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="error" onClick={() => handleClose(pos.position_id)}>
                    <Close />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
