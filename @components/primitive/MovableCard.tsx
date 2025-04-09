import { useState, useEffect } from "react";
import { Card, CardContent, IconButton } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable, DropResult} from "@hello-pangea/dnd";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper } from "@mui/material";
import { players } from "@prisma/client";
import React from "react";
import CloseIcon from '@mui/icons-material/Close';
import ReactDOM from 'react-dom';
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import styled from "styled-components";
import { RowData } from '../types/RowData';
import groupPlayerData from "../utils/groupPlayerData";
import getRowColor from "../utils/getRowColor";

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
    <TableRow sx={{ bgcolor: getRowColor(row.global_position), position:"relative"}} ref={provided.innerRef}
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
  handleRemovePlayer: (
    participantIndex: number,
    playername: string,
  ) => void;
}

// Custom column names
const globalColnames = {
  nickname: "Jugador",
  average: "Pt. Global",
  positions: "Posiciones",
};


const MovableCard: React.FC<MovableCardProps> = ({gamekey, participants, handleRemovePlayer}) => {
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

  const handleClickRemove = (participantIndex: number, playername: string,) => {
    handleRemovePlayer(participantIndex, playername);
  };

  console.log(participants)
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: expanded ? "5%" : "-600px", // Se mueve hacia arriba y abajo
        left: "50%",
        transform: "translateX(-50%)",
        transition: "bottom 0.5s ease-in-out",
        width: "85%",
        display: "flex",
        alignItems: "center",
        zIndex: 100
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${participants.length}, 1fr)`, // Distribuye uniformemente
              justifyItems: "center",
              alignItems: "stretch",
              gap: 7, // Espaciado entre imágenes
              width: "100%", // Usa todo el ancho disponible
              padding: 2
            }}
          >
            {participantData.map((participant, pindex) => (
              <Droppable droppableId={participant.team_name} key={participant.team_name}>
                {(provided, snapshot) => ( 
                <HoverBox key={pindex} ref={provided.innerRef}
                  {...provided.droppableProps}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  isHovered={isHovered} isDragging={snapshot.isDraggingOver}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
                  <img
                    key={pindex}
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
                      marginRight: "auto"
                    }}
                  />
                  <Typography gutterBottom variant="body1" component="div" sx={{margin: "auto"}}>
                      N. jugadores: {participant.players.length}
                  </Typography>
                  </div>

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

                                      <IconButton
                                        sx={{
                                            position: "absolute",
                                            top: 0, // Espaciado desde arriba
                                            right: 0, // Espaciado desde la derecha
                                            color: 'white',
                                        }}
                                        onClick={() => handleClickRemove(pindex, row.nickname!)}
                                      >
                                        <CloseIcon fontSize='small' sx={{ color: "red" }} />
                                      </IconButton>

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