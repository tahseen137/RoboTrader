import { Paper, Typography, List, ListItem, ListItemText, Chip, Box } from '@mui/material';
import { Warning, Info, Error } from '@mui/icons-material';

export default function AlertPanel({ alerts }) {
  const getIcon = (severity) => {
    switch(severity) {
      case 'critical': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      default: return <Info color="info" />;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Alerts</Typography>
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {alerts.filter(a => !a.acknowledged).slice(0, 5).map((alert) => (
          <ListItem key={alert.alert_id} sx={{ borderLeft: 3, borderColor: alert.severity === 'critical' ? 'error.main' : 'warning.main', mb: 1 }}>
            <Box sx={{ mr: 2 }}>{getIcon(alert.severity)}</Box>
            <ListItemText
              primary={alert.alert_type.replace(/_/g, ' ').toUpperCase()}
              secondary={alert.message}
            />
            <Chip label={alert.severity} size="small" color={alert.severity === 'critical' ? 'error' : 'warning'} />
          </ListItem>
        ))}
        {alerts.filter(a => !a.acknowledged).length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No active alerts
          </Typography>
        )}
      </List>
    </Paper>
  );
}
