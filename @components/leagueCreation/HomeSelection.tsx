import React from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';

interface StepOneProps {
  setStep: (step: number) => void;
}

const HomeSelection: React.FC<StepOneProps> = ({ setStep }) => {
  return (
    <Box justifyContent="space-evenly" sx={{ display: "flex", marginTop: 10, flexDirection: "column", gap: 5, alignItems: "center"}}>

      <Box display="flex" gap={10}>
        <Card sx={{ maxWidth: 345, width: 345}}>
            <CardActionArea 
              onClick={() => setStep(2)}>
              <CardMedia
                component="img"
                height="200"
                image="/static/drogba_tity_1.jpg"
                alt="nueva liga"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Nueva liga
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea
              onClick={() => setStep(1000)}>
              <CardMedia
                component="img"
                height="200"
                image="/static/floren_1.png"
                alt="salon de trofeos"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Salón de trofeos (checkkeeqwe22k)
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        <Card sx={{ maxWidth: 345, }}>
          <CardActionArea
              onClick={() => setStep(999)}>
            <CardMedia
              component="img"
              height="200"
              image="/static/loadleague.png"
              alt="cargar liga"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Cargar liga
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

    </Box>
  );
};

export default HomeSelection;
