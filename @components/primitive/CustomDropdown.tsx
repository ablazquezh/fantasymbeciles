import React, { useState, useRef } from 'react';
import {
  Button,
  Popper,
  Paper,
  Checkbox,
  Box,
  ClickAwayListener,
  FormControlLabel,
} from '@mui/material';

// Ensure positionCheckboxes has specific types for keys and values
const positionCheckboxes: Record<string, string[]> = {
  "Delantero": ["DC", "SD", "EI", "ED"],
  "Centrocampista": ["MC", "MCD", "MCO", "MD", "MI"],
  "Defensa": ["DFC", "LD", "LI", "CAR", "CAD", "CAI"],
  "Portero": ["POR"],
} as const; // `as const` ensures keys and values are literal types

type Position = keyof typeof positionCheckboxes; // This ensures the keys are one of the valid positions.

interface NumberRangeFieldsProps {
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  }


export default function CustomDropdownSelect ({ selected, setSelected }: NumberRangeFieldsProps) {

//const CustomDropdownSelect = () => {
  // Explicitly typing selected as string[] so TypeScript knows it's an array of strings
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  // To store the checked state of the parent checkboxes (positions)
  const [parentsChecked, setParentsChecked] = useState<Record<Position, boolean>>({
    "Delantero": false,
    "Centrocampista": false,
    "Defensa": false,
    "Portero": false,
  });

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = () => setOpen(false);

  // Toggle for individual child checkboxes
  const handleChange = (code: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, code] : prev.filter((c) => c !== code)
    );
  };

  // Toggle for parent checkboxes
  const handleParentChange = (parent: Position, checked: boolean) => {
    setParentsChecked((prev) => {
      const newParentsChecked = { ...prev, [parent]: checked };

      // Update child checkboxes based on the parent's checked state
      const updatedSelected = checked
      ? [...new Set([...selected, ...positionCheckboxes[parent]])] // Add all child values
      : selected.reduce((acc: string[], item: string) => {
          // If the item is not a child of the parent, keep it in the array
          if (!positionCheckboxes[parent].includes(item)) {
            acc.push(item);
          }
          return acc;
        }, []); // Return the updated array without the child values


      setSelected(updatedSelected);
      return newParentsChecked;
    });
  };

  // Display selected checkboxes as labels (excluding parents)
  const label = selected.length ? selected.join(', ') : 'Posiciones';

  return (
    <>
      <Button
        ref={anchorRef}
        onClick={handleToggle}
        variant="outlined"
        sx={{
          color: 'gray', // Text color inside the button
          borderColor: 'gray', // Border color
          '&:hover': {
            backgroundColor: 'lightgray', // Background color on hover
            borderColor: 'black', // Change border color on hover
          },
          justifyContent: 'space-between',
          overflow: 'hidden', // Hide overflowing text
          textOverflow: 'ellipsis', // Add ellipsis for overflowing text
          whiteSpace: 'nowrap', // Prevent text from wrapping
          fontSize:12,
          height: "20%",
          width: "10%", // Set a fixed width
        }}
      >
        {label}
      </Button>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom" // Dropdown appears above the button
        disablePortal={false}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8], // Space between button and dropdown
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {Object.keys(positionCheckboxes).map((parent) => (
              <>
              <Box key={parent} sx={{ display: 'flex', flexDirection: 'row' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={parentsChecked[parent as Position]} // Typecast to Position for correct typing
                      onChange={(e) => handleParentChange(parent as Position, e.target.checked)}
                    />
                  }
                  label={parent}
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontWeight: "bold",
                      fontSize: 13  // Make the label bold
                    }, 
                  }}
                />
              </Box>
              <Box key={parent+"children"} sx={{ display: 'flex', flexDirection: 'row' }}>

                {positionCheckboxes[parent as Position].map((child) => (
                  <FormControlLabel
                    key={child}
                    control={
                      <Checkbox
                        checked={selected.includes(child)} // Child checkbox checked state
                        onChange={(e) => handleChange(child, e.target.checked)}
                      />
                    }
                    label={child}
                    sx={{ml:2, "& .MuiFormControlLabel-label": {
                        fontSize: 13  // Make the label bold
                        },  
                    }}
                  />
                ))}
              </Box>

              </>
            ))}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

