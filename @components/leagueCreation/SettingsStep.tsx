import React, { useState } from "react";
import { TextField, Button, Stack } from "@mui/material";

interface StepFourProps {
  formData: { selection: string };
  setStep: (step: number) => void;
}

const SettingsStep: React.FC<StepFourProps> = ({ formData, setStep }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleSubmit = () => {
    alert(`Selected: ${formData.selection}, Input: ${inputValue}`);
    //setStep(1); // Reset to Step 1 after submission
  };

  return (
    <Stack spacing={2} alignItems="center">
      <TextField
        label="Enter Details"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
    </Stack>
  );
};

export default SettingsStep;
