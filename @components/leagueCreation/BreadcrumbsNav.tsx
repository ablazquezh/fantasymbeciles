import React from "react";
import { Stepper, Step, StepLabel } from "@mui/material";

interface StepperNavProps {
  step: number;
  setStep: (step: number) => void;
}

const steps = ["FIFA", "Tipo de liga", "Configuración", "Equipos"];

const StepperNav: React.FC<StepperNavProps> = ({ step, setStep }) => {
  return (
    <Stepper style={{ position: "absolute", width: "60%", marginTop: "15px" }} activeStep={step - 2} alternativeLabel>
      {steps.map((label, index) => (
        <Step key={label} >
          <StepLabel  
            onClick={() => setStep(index+2)} 
            sx={{ cursor: index < step - 1 ? "pointer" : "default"}} // Make past steps clickable
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default StepperNav;
