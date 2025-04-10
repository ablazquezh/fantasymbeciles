import React, { useState } from 'react';
import { TextField, Box, Typography } from '@mui/material';

const PositiveNumberInput = () => {
const [value, setValue] = useState<number>(0);

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = event.target.value;

  // Check if the value is a valid number and greater than or equal to 0
  if (inputValue === '' || Number(inputValue) >= 0) {
    setValue(Number(inputValue));
  }
};

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <TextField
        type="number"
        value={value}
        onChange={handleChange}
        inputProps={{ min: 0 }}
        variant="outlined"
      />
    </Box>
  );
};

export default PositiveNumberInput;
