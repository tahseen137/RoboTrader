import { Paper, Typography, Slider, TextField, Box } from '@mui/material';

export default function FundSlider({ value, onChange }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Fund Allocation</Typography>
      <Box sx={{ px: 2 }}>
        <Slider
          value={value}
          onChange={(e, v) => onChange(v)}
          min={500}
          max={10000}
          step={100}
          marks={[
            { value: 500, label: '$500' },
            { value: 5000, label: '$5K' },
            { value: 10000, label: '$10K' }
          ]}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `$${v.toLocaleString()}`}
        />
        <TextField
          fullWidth
          label="Trading Capital"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          type="number"
          inputProps={{ min: 500, max: 10000, step: 100 }}
          sx={{ mt: 2 }}
        />
      </Box>
    </Paper>
  );
}
