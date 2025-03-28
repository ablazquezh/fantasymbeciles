import React from "react";
import { Button, Stack } from "@mui/material";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';

interface StepThreeProps {
  setStep: (step: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<{ options?: Record<string, any> }>>;
}

const LeagueTypeSelectionStep: React.FC<StepThreeProps> = ({ setStep, setFormData }) => {

  const handleSelect = (leaguetype: string) => {
    setFormData((prev) => ({
      options: { ...prev.options, leaguetype }, // Store inside options
    }));    
    
    setStep(4);
  };

  return (
    <Box justifyContent="space-evenly" sx={{ display: "flex", marginTop: 10  }}>

      <Card sx={{ maxWidth: 345, width: 345}}>
          <CardActionArea onClick={() => handleSelect("raw")}>
            <CardMedia
              component="img"
              image="/static/rawmode3.png"
              height={200}
              alt="fantasy raw"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Fantasy RAW
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card sx={{ maxWidth: 345 }}>
          <CardActionArea onClick={() => handleSelect("pro")}>
            <CardMedia
              component="img"
              image="/static/promode.png"
              height={200}
              alt="fantasy pro"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Fantasy PRO
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

    </Box>
  );
};

export default LeagueTypeSelectionStep;
