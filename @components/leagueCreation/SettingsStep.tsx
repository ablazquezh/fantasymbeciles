import React, { useState, useEffect } from 'react';import {
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Button,
  Paper,
  Box
} from "@mui/material";


interface StepFourProps {
  setStep: (step: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<{ options?: Record<string, any> }>>;
  formData: { options?: Record<string, any> };
}

const SettingsStep: React.FC<StepFourProps> = ({ setStep, setFormData, formData }) => {

  const [localOptions, setLocalOptions] = useState<Record<string, any>>({
    winterMarket: formData.options?.winterMarket ?? false,
    cardSuspension: formData.options?.cardSuspension ?? 1,
    averageLimit: formData.options?.averageLimit ?? 85,
    budgetCalculation: formData.options?.budgetCalculation ?? "default",
  });

   // Update formData as user interacts
   useEffect(() => {
    setFormData((prev) => ({
      options: { ...prev.options, ...localOptions },
    }));
  }, [localOptions, setFormData]);

  return (
    <Paper sx={{ paddingTop: 4, paddingBottom: 4, marginTop: 11 }}>

      <Box sx={{marginRight: 6, marginLeft: 6}}>
        {/* ✅ Toggle Switch */}
        <FormControlLabel
          control={
            <Switch
              checked={localOptions.winterMarket}
              onChange={(e) => setLocalOptions((prev) => ({ ...prev, winterMarket: e.target.checked }))}
            />
          }
          label="Mercado de invierno"
        />

        {/* ✅ Number Input (1-10) */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography>Amonestación por amarillas</Typography>
          <TextField
            type="number"
            label=""
            inputProps={{ min: 1, max: 10, step: 1 }}
            value={localOptions.cardSuspension}
            onChange={(e) =>
              setLocalOptions((prev) => ({ ...prev, cardSuspension: Math.min(10, Math.max(1, Number(e.target.value))) }))
            }
            sx={{ mt: 0, width: "100%" }}
          />
        </FormControl>

        {/* ✅ Dropdown (60-100, increment 5) */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography>Limitación media de jugadores (&lt;=)</Typography>
          <Select
            value={localOptions.averageLimit}
            onChange={(e) => setLocalOptions((prev) => ({ ...prev, averageLimit: e.target.value }))}
          >
            {[60, 65, 70, 75, 80, 85, 90, 95, 100].map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ✅ String Dropdown (Two Options) */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography>Cálculo de presupuesto de los equipos</Typography>
          <Select
            value={localOptions.budgetCalculation}
            onChange={(e) => setLocalOptions((prev) => ({ ...prev, budgetCalculation: e.target.value }))}
          >
            <MenuItem value="default">Por defecto</MenuItem>
            <MenuItem value="restrictive">Restrictivo</MenuItem>
          </Select>
        </FormControl>

        {/* ✅ Navigation Buttons */}
        <Button variant="contained" color="primary" onClick={() => setStep(5)} sx={{ mt: 2, mr: 1 }}>
          hecho
        </Button>
      </Box>
    </Paper>
  );
};

export default SettingsStep;
