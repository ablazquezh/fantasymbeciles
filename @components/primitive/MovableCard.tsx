import { useState } from "react";
import { Card, CardContent, IconButton, Box, Typography } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";

interface Participants {
  user_name: string;
  team_name: string;
}

interface MovableCardProps {
  participants: Participants[]; 
  gamekey: string| null; 
}

const MovableCard: React.FC<MovableCardProps> = ({gamekey, participants}) => {
  const [expanded, setExpanded] = useState(false);
  console.log(participants)
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: expanded ? "5%" : "-600px", // Se mueve hacia arriba y abajo
        left: "50%",
        transform: "translateX(-50%)",
        transition: "bottom 0.5s ease-in-out",
        width: "75%",
        display: "flex",
        alignItems: "center",
        zIndex: 100 // Asegura que el botón y la tarjeta se alineen
      }}
    >
      {/* Tarjeta expandible */}
      <Card
        elevation={6}
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          height: 700,
          transition: "all 0.5s ease-in-out",
          flexGrow: 1,
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sección de imágenes de los equipos */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${participants.length}, 1fr)`, // Distribuye uniformemente
              justifyItems: "center",
              alignItems: "center",
              gap: 2, // Espaciado entre imágenes
              width: "100%", // Usa todo el ancho disponible
              padding: 2,
            }}
          >
            {participants.map((participant, index) => (
              <Box>
                <img
                  key={index}
                  src={`/static/teams/${gamekey}/${String(participant["team_name"]).replace("/", "_")}.png`} // Ruta basada en team_name
                  alt={participant.team_name}
                  style={{
                    width: "100%", // Ocupa todo el espacio disponible en su celda
                    maxWidth: "120px", // Evita que sean demasiado grandes
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "8px",
                    padding: "5px",
                    boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
                  }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Botón flotante que se mueve con la tarjeta */}
      <IconButton
        onClick={() => setExpanded(!expanded)}
        sx={{
          position: "relative", // Se mantiene al lado del Card
          marginLeft: "10px", // Espaciado entre el Card y el botón
          bgcolor: "white",
          color: "black",
          width: 60,
          height: 60,
          borderRadius: "50%",
          boxShadow: 3,
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "lightgray",
          },
          mt: -75
        }}
      >
        {expanded ? <KeyboardArrowDown fontSize="large" /> : <KeyboardArrowUp fontSize="large" />}
      </IconButton>
    </Box>
  );
};

export default MovableCard;
