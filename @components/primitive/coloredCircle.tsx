import { Typography, IconButton} from "@mui/material";
import getRowColor from "../utils/getRowColor";
import CloseIcon from '@mui/icons-material/Close';
import React from 'react'

type ColoredCircleProps = {
  color?: string;
  size?: number;
  x: number;
  y: number;
  playerName: string;
  playerId: number;
  position: string;
  handleDragStart: (nickname: string, playerId: number, position: string, defaultMode: boolean) => (event: React.DragEvent<HTMLElement>) => void;
  handleClickRemove: (nickname: string) => () => void;
  showTrash: boolean;
};


const ColoredCircle = ({ size = 30, x, y, playerName, playerId, position, handleDragStart, handleClickRemove, showTrash}: ColoredCircleProps) => (
    <div draggable key={playerName} onDragStart={handleDragStart(playerName, playerId, position, false)} style={{ cursor: 'grab' }} >

        <IconButton 
            sx={{
                display: showTrash ? "" : "none",
                position: "absolute",
                color: 'white',
                left: x-(size/3),
                top: y-(size/1.2),
                transform: "translateX(-100%)", zIndex: 1000
            }}
            onClick={handleClickRemove(playerName)}
        >                           
            <CloseIcon fontSize='small' sx={{ color: "red" }} 
            />
        </IconButton>
        <div
        style={{
            backgroundColor: getRowColor(position),
            width: size,
            height: size,
            borderRadius: "50%",
            border: "2px solid black",
            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
            position: "absolute",
            left: x-(size/2),
            top: y-(size/2),
        }}
        />
        <Typography
            style={{
                color: "white",
                position: "absolute",
                left: x,
                top: y-(size/2)+25,
                transform: "translateX(-50%)",
        }}>{playerName}</Typography>
    </div>
);

export default ColoredCircle;