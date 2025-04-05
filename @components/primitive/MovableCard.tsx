import { useState, useEffect } from "react";
import { Card, CardContent, IconButton } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable, DropResult} from "@hello-pangea/dnd";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper } from "@mui/material";
import { players } from "@prisma/client";
import React from "react";
import ReactDOM from 'react-dom';
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import styled from "styled-components";

type PortalAwareItemProps = {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  children: React.ReactNode;
  row: RowData
};
const PortalAwareItem: React.FC<PortalAwareItemProps> = ({
  provided,
  snapshot,
  children,
  row
}) =>  {
  const child = (
    <TableRow sx={{ bgcolor: getRowColor(row.global_position) }} ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={provided.draggableProps.style}>

      {children}
        
    </TableRow>
  );

  // If dragging, render in portal
  return snapshot.isDragging
    ? ReactDOM.createPortal(child, document.body)
    : child;
};

const HoverBox = styled.div<{ isHovered: boolean, isDragging: boolean }>`
  position: relative;
  background: white;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(128, 128, 128, 0.4);
    opacity: ${(props) => (props.isHovered && props.isDragging ? 1 : 0)};
    transition: opacity 0.2s ease;
    pointer-events: none;    
    transition: opacity 0.2s ease;
    pointer-events: none;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

`;

const getRowColor = (status: string | null) => {
  switch (status) {
    case "Delantero": return "#80ccff"; 
    case "Centrocampista": return "#83ff80"; 
    case "Defensa": return  "#ffee80" ; 
    case "Portero": return "#ff9380 "; 
    default: return "#fafafa";
  }
};

type RowData = {
  ID: number;
  nickname: string | null;
  positions: string[] | null;
  country_code: string | null;
  value: number | null;
  wage: number | null;
  average: number | null;
  global_position: string | null;
  team_name: string | null;
  detail: {
    age: number | null;
    height: number | null;
    best_foot: string | null;
    weak_foot_5stars: number | null;
    heading: number | null;
    jump: number | null;
    long_pass: number | null;
    short_pass: number | null;
    dribbling: number | null;
    acceleration: number | null;
    speed: number | null;
    shot_power: number | null;
    long_shot: number | null;
    stamina: number | null;
    defense: number | null;
    interception: number | null;
  };
};


interface Participants {
  user_name: string;
  team_name: string;
  players: RowData[];
}

interface ParticipantsFull {
  groupedPlayers: {
    [key: string]: RowData[];
  };
  user_name: string;
  team_name: string;
  players: RowData[];
}

interface MovableCardProps {
  participants: Participants[]; 
  gamekey: string| null; 
}

// Custom column names
const globalColnames = {
  nickname: "Jugador",
  average: "Pt. Global",
  positions: "Posiciones",
};


const positionList = ["Delantero", "Centrocampista", "Defensa", "Portero"];

const groupPlayerData = (playerData: RowData[]) => {
  
  const groupedData: { [key: string]: RowData[] } = positionList.reduce((acc, pos) => {
    acc[pos] = [];
    return acc;
  }, {} as { [key: string]: RowData[] });

  playerData.forEach((player) => {
    const key = player.global_position;
    if (key) {
      if (!groupedData[key]) groupedData[key] = []; // If key not predefined
      groupedData[key].push(player);
    }
  });

  return groupedData;
};

const MovableCard: React.FC<MovableCardProps> = ({gamekey, participants}) => {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [participantData, setParticipantData] = useState<ParticipantsFull[]>([])

  useEffect(() => {
    if (participants.length > 0) {
      const transformed = participants.map((participant) => ({
        ...participant,
        groupedPlayers: groupPlayerData(participant.players),
      }));
      setParticipantData(transformed);
    }
  }, [participants]);
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
              alignItems: "stretch",
              gap: 2, // Espaciado entre imágenes
              width: "100%", // Usa todo el ancho disponible
              padding: 2
            }}
          >
            {participantData.map((participant, index) => (
              <Droppable droppableId={participant.team_name} key={participant.team_name}>
                {(provided, snapshot) => ( 
                <HoverBox key={index} ref={provided.innerRef}
                  {...provided.droppableProps}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  isHovered={isHovered} isDragging={snapshot.isDraggingOver}>

                  <img
                    key={index}
                    src={`/static/teams/${gamekey}/${String(participant["team_name"]).replace("/", "_")}.png`} // Ruta basada en team_name
                    alt={participant.team_name}
                    style={{
                      width: "100%", // Ocupa todo el espacio disponible en su celda
                      maxWidth: "45px", // Evita que sean demasiado grandes
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: "8px",
                      padding: "5px",
                      boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
                    }}
                  />

                        <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", maxWidth: "310px", minWidth: "310px", overflowY: "auto" }} >

                          <Table stickyHeader>

                            {/*<TableHead>
                              <TableRow>
                                {Object.keys(globalColnames).map((col) => (
                                  <TableCell
                                    key={col}
                                    sx={{
                                      fontWeight: "bold",
                                      textAlign: "center"
                                    }}
                                  >
                                    {globalColnames[col as keyof typeof globalColnames]}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>*/}


                            <TableBody sx={{backgroundColor: '#fafafa'}}>

                              {Object.keys(participant.groupedPlayers).map((category) => (
                                <React.Fragment key={category}>
                                  {/* Render category header */}
                                  <TableRow>
                                    <TableCell colSpan={3} style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                                      {category}
                                    </TableCell>
                                  </TableRow>
                    
                                  {/* Render rows for this category */}
                                  {participant.groupedPlayers[category].map((row, index) => (
                                    <Draggable key={row.ID} draggableId={"moved"+String(row.ID)} index={index}>
                                    {(provided, snapshot) => {
                                
                                      return(

                                        <PortalAwareItem provided={provided} snapshot={snapshot} row={row} >
                                          { Object.keys(globalColnames).map((col) => (

                                            <TableCell key={col} >
                                              {row[col as keyof typeof globalColnames] !== null &&
                                                row[col as keyof typeof globalColnames] !== undefined ? (
                                                  Array.isArray(row[col as keyof typeof globalColnames]) ? (
                                                    (row[col as keyof typeof globalColnames] as string[]).map((item, index) => (
                                                      <Chip key={index} label={item} sx={{ margin: "2px" }} />
                                                    ))
                                                  ) : (
                                                    row[col as keyof typeof globalColnames]
                                                  )
                                                ) : (
                                                  "-"
                                              )}
                                            </ TableCell>
                                  
                                          ))}
                                        </PortalAwareItem>

                                      )}}
                                  </Draggable>
                                  ))}
                                </React.Fragment>
                              ))}
                                
                            </TableBody>
                            
                          </Table>

                        </TableContainer>
                    
                    
                        {provided.placeholder}
                </HoverBox>
                )}
                            
               </Droppable>
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