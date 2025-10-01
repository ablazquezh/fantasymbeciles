import React from "react";
import { Button, Stack } from "@mui/material";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';

interface StepTwoProps {
  setStep: (step: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<{ options?: Record<string, any> }>>;
}

const GameSelectionStep: React.FC<StepTwoProps> = ({ setStep, setFormData }) => {

  const handleSelect = (game: string) => {
    setFormData((prev) => ({
      options: { ...prev.options, game }, // Store inside options
    }));    
    
    setStep(3);
  };

  return (
    <Box justifyContent="space-evenly" sx={{ display: "flex", marginTop: 10, flexDirection: "column", gap: 5, alignItems: "center"  }}>

      <Box display="flex" gap={10}>

        <Card sx={{ maxWidth: 345 }}>
            <CardActionArea sx={{ height: "100%" }}
              onClick={() => handleSelect("fifa10")}>
              <CardMedia
                component="img"
                image="/static/fifa10.png"
                alt="FIFA 10"
                sx={{
                  height: "100%", // Take full height
                  width: "100%", // Take full width
                  objectFit: "cover", // Ensure it covers the area without distortion
                }}
              />
              <CardContent>
              </CardContent>
            </CardActionArea>
          </Card>

        <Card sx={{ maxWidth: 345, width: 345}}>
            <CardActionArea sx={{ height: "100%" }}
              onClick={() => handleSelect("fifa13")}>
              <CardMedia
                component="img"
                image="/static/fifa13.png"
                alt="FIFA 13"
                sx={{
                  height: "100%", // Take full height
                  width: "100%", // Take full width
                  objectFit: "cover", // Ensure it covers the area without distortion
                }}
              />
            </CardActionArea>
          </Card>

      </Box>

      <Box display="flex" gap={10}>
        <Card sx={{ maxWidth: 345, width: 345}}>
            <CardActionArea sx={{ height: "100%" }}
              onClick={() => handleSelect("fifa19")}>
              <CardMedia
                component="img"
                image="/static/fifa19.png"
                alt="FIFA 19"
                sx={{
                  height: "100%", // Take full height
                  width: "100%", // Take full width
                  objectFit: "cover", // Ensure it covers the area without distortion
                }}
              />
            </CardActionArea>
          </Card>

          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea sx={{ height: "100%" }}
              onClick={() => handleSelect("fc25")}>
              <CardMedia
                component="img"
                image="/static/fc25.png"
                alt="FC25"
                sx={{
                  height: "100%", // Take full height
                  width: "100%", // Take full width
                  objectFit: "cover", // Ensure it covers the area without distortion
                }}
              />
            </CardActionArea>
          </Card>

      </Box>

    </Box>
  );
};

export default GameSelectionStep;
