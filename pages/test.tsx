import React, { useState, ChangeEvent, FocusEvent } from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function NumberRangeFields() {
  const [minValue, setMinValue] = useState('0');
  const [maxValue, setMaxValue] = useState('99');

  const clampValue = (val: string): string => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return '';
    if (num < 0) return '0';
    if (num > 99) return '99';
    return String(num);
  };

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 2) return; // hard stop at 2 digits
    setMinValue(raw);
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 2) return; // hard stop at 2 digits
    setMaxValue(raw);
  };

  const handleMinBlur = (e: FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    setMinValue(raw === '' ? '0' : clampValue(raw));
  };

  const handleMaxBlur = (e: FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    setMaxValue(raw === '' ? '99' : clampValue(raw));
  };

  const isInvalidRange =
    minValue === '' ||
    maxValue === '' ||
    +minValue > +maxValue;

  const handleSend = () => {
    alert(`Sent! Min: ${minValue}, Max: ${maxValue}`);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} width="300px">
      <Box display="flex" gap={2}>
        <TextField
          label="Min"
          variant="outlined"
          value={minValue}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          error={isInvalidRange}
          helperText={isInvalidRange ? 'Mínimo ≤ Máximo' : ''}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 2, // also helpful
          }}
        />
        <TextField
          label="Max"
          variant="outlined"
          value={maxValue}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          error={isInvalidRange}
          helperText={isInvalidRange ? 'Máximo ≥ Mínimo' : ''}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 2,
          }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        disabled={isInvalidRange}
        onClick={handleSend}
      >
        Send
      </Button>
    </Box>
  );
}
