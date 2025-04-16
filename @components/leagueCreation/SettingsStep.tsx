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
    cardResetInjury: formData.options?.cardResetInjury ?? true,
    cardResetRed: formData.options?.cardResetRed ?? true,

    bigTeamMultiplier: formData.options?.bigTeamMultiplier ?? 3,
    mediumTeamMultiplier: formData.options?.mediumTeamMultiplier ?? 3.5,
    smallTeamMultiplier: formData.options?.smallTeamMultiplier ?? 4.5,
    
    winBonus: formData.options?.winBonus ?? 4,
    drawBonus: formData.options?.drawBonus ?? 2,
  });

   // Update formData as user interacts
   useEffect(() => {
    setFormData((prev) => ({
      options: { ...prev.options, ...localOptions },
    }));
  }, [localOptions, setFormData]);

  // MARKET STUFF
  const [open, setOpen] = useState(false);
  // MARKET RADIO GROUP + RADIO GROUP VALUE
  const [value, setValue] = useState("season");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setLocalOptions((prev) => ({ ...prev, transferMarketSlot: event.target.value }))
  }
  // MARKET ENABLED
  const handleMarketSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpen(event.target.checked);
    setLocalOptions((prev) => ({ ...prev, transferMarket: event.target.checked }))
  };

  // YCARD STUFF
  const [yCardOpen, setYCardOpen] = useState(false);
  // YCAR CLEANING
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const handleYCardSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYCardOpen(event.target.checked);
    setLocalOptions((prev) => ({ ...prev, cardSuspension: event.target.checked }))
  };

  const handleInjuryCleanCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowA((prev) => !prev)
    setLocalOptions((prev) => ({ ...prev, cardResetInjury: event.target.checked }))
  }

  const handleRedCleanCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowB((prev) => !prev)
    setLocalOptions((prev) => ({ ...prev, cardResetRed: event.target.checked }))
  }

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
                        value={localOptions.cardSuspensionAmount}
                        onChange={(e) =>
                          setLocalOptions((prev) => ({ ...prev, cardSuspensionAmount: Math.min(10, Math.max(1, Number(e.target.value))) }))
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
                        value={localOptions.cardResetAmount}
                        onChange={(e) =>
                          setLocalOptions((prev) => ({ ...prev, cardResetAmount: Math.min(10, Math.max(1, Number(e.target.value))) }))
                        }
                        sx={{ width: "70%" }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{display: "flex"}}>
                    <FormControlLabel
                      control={<Checkbox checked={showA} onChange={handleInjuryCleanCheck} />}//() => //setShowA((prev) => !prev)} />}
                      label="Limpia tras lesión"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={showB} onChange={handleRedCleanCheck} />}//() => setShowB((prev) => !prev)} />}
                      label="Limpia tras roja"
                    />
                  </Box>
                </Box>
                
              </FormControl>
            </Collapse>
          </Box>
        </Box>
        
        {formData.options?.leaguetype === "pro" &&  (
          <Box sx={{display:"flex", mt:3}}>
          <FormControl fullWidth sx={{ mt: 5, width: "fit-content", mr: 0}}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb:2 }}>Multiplicadores de presupuesto de los equipos</Typography>
              <Box sx={{display: "flex", flexDirection:"row", gap:5, width: "60%"}} border={1} borderRadius={2} borderColor="grey.300" p={2} >
                <Box >
                  <Typography variant="body1">Grande</Typography>
                  <TextField
                    type="number"
                    label=""
                    inputProps={{ min: 1, step: 0.1 }}
                    value={localOptions.bigTeamMultiplier}
                    onChange={(e) =>
                      setLocalOptions((prev) => ({ ...prev, bigTeamMultiplier: Math.max(1, Number(e.target.value)) }))
                    }
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Box >
                  <Typography variant="body1">Medio</Typography>
                  <TextField
                    type="number"
                    label=""
                    inputProps={{ min: 1, step: 0.1 }}
                    value={localOptions.mediumTeamMultiplier}
                    onChange={(e) =>
                      setLocalOptions((prev) => ({ ...prev, mediumTeamMultiplier: Math.max(1, Number(e.target.value)) }))
                    }
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Box >
                  <Typography variant="body1">Pequeño</Typography>
                  <TextField
                    type="number"
                    label=""
                    inputProps={{ min: 1, step: 0.1 }}
                    value={localOptions.smallTeamMultiplier}
                    onChange={(e) =>
                      setLocalOptions((prev) => ({ ...prev, smallTeamMultiplier: Math.max(1, Number(e.target.value)) }))
                    }
                    sx={{ width: "100%" }}
                  />
                </Box>
              </Box>
          </FormControl>

          <FormControl sx={{ mt: 5, width: "fit-content"}}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb:2 }}>Bonificaciones (M€)</Typography>
            <Box sx={{display: "flex", flexDirection:"row", gap:5, width: "60%"}} border={1} borderRadius={2} borderColor="grey.300" p={2} >
            <Box >
                <Typography variant="body1">Victoria</Typography>
                <TextField
                  type="number"
                  label=""
                  inputProps={{ min: 1, step: 1 }}
                  value={localOptions.winBonus}
                  onChange={(e) =>
                    setLocalOptions((prev) => ({ ...prev, winBonus: Math.max(1, Number(e.target.value)) }))
                  }
                  sx={{ width: "100%" }}
                />
              </Box>
              <Box >
                <Typography variant="body1">Empate</Typography>
                <TextField
                  type="number"
                  label=""
                  inputProps={{ min: 1, step: 1 }}
                  value={localOptions.drawBonus}
                  onChange={(e) =>
                    setLocalOptions((prev) => ({ ...prev, drawBonus: Math.max(1, Number(e.target.value)) }))
                  }
                  sx={{ width: "100%" }}
                />
              </Box>
              
            </Box>
          </FormControl>
          </ Box>
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
