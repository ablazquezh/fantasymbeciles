// components/ProgressBar.tsx
import { Box, LinearProgress, Typography } from "@mui/material";

interface ProgressBarProps {
  value: number; // value between 0 and 100
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => {
  return (
    <Box sx={{widht:310}}>
      {label && (
        <Typography variant="body2" mb={0.5}>
          {label}
        </Typography>
      )}
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" value={value}  sx={{
              height: 12,
              borderRadius: 6,
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#1976d2', // nice blue
              },
              backgroundColor: '#e3f2fd', // light blue background
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};



// pages/index.tsx (or any component)
import { useState, useEffect } from "react";
import {  Button } from "@mui/material";

export default function Home() {
  const [progress, setProgress] = useState(100);

  const increase = () => setProgress((prev) => Math.min(prev + 10, 100));
  const decrease = () => setProgress((prev) => Math.max(prev - 10, 0));

  return (
    <Box p={4} sx={{width:310}}>
      <ProgressBar value={progress} label="Completion" />
      <Box mt={2} display="flex" gap={2}>
        <Button variant="contained" onClick={decrease}>
          - Decrease
        </Button>
        <Button variant="contained" onClick={increase}>
          + Increase
        </Button>
      </Box>
    </Box>
  );
}
