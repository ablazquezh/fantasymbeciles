import React, { useState, ChangeEvent, FocusEvent } from 'react';
import { TextField, Button, Box } from '@mui/material';

interface NumberRangeFieldsProps {
    minValue: string;
    maxValue: string;
    setMinValue: React.Dispatch<React.SetStateAction<string>>;
    setMaxValue: React.Dispatch<React.SetStateAction<string>>;
  }

export default function MinMax ({ minValue, maxValue, setMinValue, setMaxValue }: NumberRangeFieldsProps) {

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


  return (
      <>
        <TextField
          label="Min"
          variant="outlined"
          value={minValue}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          error={isInvalidRange}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 2, // also helpful
          }}
          sx={{width: "6%", '& .MuiInputBase-root': { height: '40px', fontSize: 14  } }}
        />
        <TextField
          label="Max"
          variant="outlined"
          value={maxValue}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          error={isInvalidRange}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 2,
          }}
          sx={{width: "6%", '& .MuiInputBase-root': { height: '40px', fontSize: 14 }, marginRight: 5 }}
        />
      </>
      
  );
}

