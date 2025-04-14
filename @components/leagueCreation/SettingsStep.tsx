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
  Box,
  Collapse,
  RadioGroup,
  Radio,
  Checkbox
} from "@mui/material";


interface StepFourProps {
  setStep: (step: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<{ options?: Record<string, any> }>>;
  formData: { options?: Record<string, any> };
}

const SettingsStep: React.FC<StepFourProps> = ({ setStep, setFormData, formData }) => {

  const [localOptions, setLocalOptions] = useState<Record<string, any>>({
    transferMarket: formData.options?.transferMarket ?? false, // MAIN SETTING
    transferMarketSlot: formData.options?.transferMarketSlot ?? "season",

    cardSuspension: formData.options?.cardSuspension ?? false, // MAIN SETTING
    cardSuspensionAmount: formData.options?.cardSuspensionAmount ?? 3,
    cardResetAmount: formData.options?.cardResetAmount ?? 2,
    cardResetInjury: formData.options?.cardSuspensionAmount ?? true,
    cardResetRed: formData.options?.cardSuspensionAmount ?? true,

    bigTeamMultiplier: formData.options?.averageLimit ?? 2,
    mediumTeamMultiplier: formData.options?.averageLimit ?? 4,
    smallTeamMultiplier: formData.options?.averageLimit ?? 7,
  });

   // Update formData as user interacts
   useEffect(() => {
    setFormData((prev) => ({
      options: { ...prev.options, ...localOptions },
    }));
  }, [localOptions, setFormData]);


  const [open, setOpen] = useState(false);
  const [yCardOpen, setYCardOpen] = useState(false);
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const [value, setValue] = useState('a');

  const handleToggle = () => setOpen((prev) => !prev);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);

  const handleMarketSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpen(event.target.checked);
  };
  const handleYCardSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYCardOpen(event.target.checked);
  };
  console.log("******")
  console.log(formData.options?.leaguetype)
  return (
    <Paper sx={{ paddingTop: 4, paddingBottom: 4, marginTop: 11 }}>

      <Box sx={{marginRight: 6, marginLeft: 6, display: "flex", flexDirection: "column"}}>

        <Box sx={{display: "flex", gap: 10 }}>

          <Box sx={{width: "30%"}}>
            <FormControlLabel
              control={
                <Switch
                  checked={open}
                  onChange={handleMarketSwitch} //(e) => setLocalOptions((prev) => ({ ...prev, winterMarket: e.target.checked }))}
                />
              }
              label="Mercado"
              
            />
            <Collapse in={open}>
              <Box mt={2} p={2} border={1} borderRadius={2} borderColor="grey.300">
                <RadioGroup value={value} onChange={handleChange}>
                  <FormControlLabel value="season" control={<Radio />} label="Toda la temporada" />
                  <FormControlLabel value="winter" control={<Radio />} label="Al final de la ida" />
                </RadioGroup>
              </Box>
            </Collapse>
          </Box>

          <Box sx={{width: "30%"}}>
          <FormControlLabel
              control={
                <Switch
                  checked={yCardOpen}
                  onChange={handleYCardSwitch} //(e) => setLocalOptions((prev) => ({ ...prev, winterMarket: e.target.checked }))}
                />
              }
              label="Sanciones por amarillas"
              
            />
            <Collapse in={yCardOpen}>
              <FormControl sx={{ mt: 2,}}>
                <Box sx={{display: "flex", flexDirection: "column", gap: 5, }} border={1} borderRadius={2} borderColor="grey.300" p={2} >
                  <Box sx={{display: "flex", gap: 5}}>
                    <Box >
                      <Typography>Nº para sanción</Typography>
                      <TextField
                        type="number"
                        label=""
                        inputProps={{ min: 1, max: 10, step: 1 }}
                        value={localOptions.cardSuspension}
                        onChange={(e) =>
                          setLocalOptions((prev) => ({ ...prev, cardSuspension: Math.min(10, Math.max(1, Number(e.target.value))) }))
                        }
                        sx={{ width: "100%" }}
                      />
                    </Box>
                    <Box >
                      <Typography>Jornadas para limpiar</Typography>
                      <TextField
                        type="number"
                        label=""
                        inputProps={{ min: 1, max: 10, step: 1 }}
                        value={localOptions.cardSuspension}
                        onChange={(e) =>
                          setLocalOptions((prev) => ({ ...prev, cardSuspension: Math.min(10, Math.max(1, Number(e.target.value))) }))
                        }
                        sx={{ width: "70%" }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{display: "flex"}}>
                    <FormControlLabel
                      control={<Checkbox checked={showA} onChange={() => setShowA((prev) => !prev)} />}
                      label="Limpia tras lesión"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={showB} onChange={() => setShowB((prev) => !prev)} />}
                      label="Limpia tras roja"
                    />
                  </Box>
                </Box>
                
              </FormControl>
            </Collapse>
          </Box>
        </Box>
        
        {formData.options?.leaguetype === "pro" &&  (
          <FormControl fullWidth sx={{ mt: 5 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb:2 }}>Multiplicadores de presupuesto de los equipos</Typography>
              <Box sx={{display: "flex", flexDirection:"row", width: "fit-content", gap:5}} border={1} borderRadius={2} borderColor="grey.300" p={2} >
                <Box >
                  <Typography variant="body1">Grande</Typography>
                  <TextField
                    type="number"
                    label=""
                    inputProps={{ min: 1, max: 10, step: 1 }}
                    value={localOptions.cardSuspension}
                    onChange={(e) =>
                      setLocalOptions((prev) => ({ ...prev, cardSuspension: Math.min(10, Math.max(1, Number(e.target.value))) }))
                    }
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Box >
                  <Typography variant="body1">Medio</Typography>
                  <TextField
                    type="number"
                    label=""
                    inputProps={{ min: 1, max: 10, step: 1 }}
                    value={localOptions.cardSuspension}
                    onChange={(e) =>
                      setLocalOptions((prev) => ({ ...prev, cardSuspension: Math.min(10, Math.max(1, Number(e.target.value))) }))
                    }
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Box >
                  <Typography variant="body1">Pequeño</Typography>
                  <TextField
                    type="number"
                    label=""
                    inputProps={{ min: 1, max: 10, step: 1 }}
                    value={localOptions.cardSuspension}
                    onChange={(e) =>
                      setLocalOptions((prev) => ({ ...prev, cardSuspension: Math.min(10, Math.max(1, Number(e.target.value))) }))
                    }
                    sx={{ width: "100%" }}
                  />
                </Box>
              </Box>
          </FormControl>
        )}
        

        {/* ✅ Navigation Buttons */}
        <Button variant="contained" color="primary" onClick={() => setStep(5)} sx={{ mt: 5, mr: 1, width: "20%", ml: "40%" }}>
          hecho
        </Button>
      </Box>
    </Paper>
  );
};

export default SettingsStep;
