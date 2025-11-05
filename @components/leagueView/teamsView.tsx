
import React, { useEffect, useState, useRef } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, IconButton, Divider, Paper, Button } from "@mui/material";
import { RowData } from '../types/RowData';
import { ParticipantsFull } from '../types/ParticipantsFull';
import { TeamWithPlayers } from '../types/TeamWithPlayers';
import groupPlayerData from '../utils/groupPlayerData';
import getRowColor from '../utils/getRowColor';
import ColoredCircle from '../primitive/coloredCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { PlayerTuple } from '../types/PlayerTuple';

interface TeamsViewProps {
  participantData: ParticipantsFull; 
  game: string| null; 
  setDiagramPlayers: React.Dispatch<React.SetStateAction<{ [key: string]: PlayerTuple } >>;
  diagramPlayers: { [key: string]: PlayerTuple };
}

const globalColnames = {
    nickname: "Jugador",
    average: "Pt. Global",
    positions: "Posiciones",
  };

//type PlayerTuple = [number, number, string, number];

const TeamsView: React.FC<TeamsViewProps> = ({participantData, game, diagramPlayers, setDiagramPlayers}) => {

    const ref = useRef<HTMLDivElement | null>(null)

    //const [diagramPlayers, setDiagramPlayers] = useState< { [key: string]: PlayerTuple } >({})

    const [showTrash, setShowTrash] = useState(false)

    const handleClickTrash = () => {
        setShowTrash(!showTrash)
    };

    const handleClickRemove = (nickname: string) => () => {

        setDiagramPlayers((prevPlayers) => {
            const updatedPlayers = { ...prevPlayers }; // Create a shallow copy of the object
            delete updatedPlayers[nickname]; // Delete the player with the given key
            return updatedPlayers; // Return the updated object
        });
    };

    const handleDeleteDrop = (event: React.DragEvent<HTMLElement>) => {
        //console.log(event.dataTransfer.getData("text"))
        const [nickname, position, teamId, playerId] = event.dataTransfer.getData("text").split(",")
        setDiagramPlayers((prevPlayers) => {
            const updatedPlayers = { ...prevPlayers }; // Create a shallow copy of the object
            delete updatedPlayers[nickname]; // Delete the player with the given key
            return updatedPlayers; // Return the updated object
        });
    };

    const handleDragStart = (nickname: string, playerId: number, position: string, defaultMode=true) => (event: React.DragEvent<HTMLElement>) => {
        event.dataTransfer.setData("text/plain", `${nickname},${position},${participantData.team_id},${playerId}`)

        const target = event.target;
        if (target instanceof HTMLElement && !defaultMode) {
            setTimeout(() => {
                target.style.display = 'none';
            }, 0)

            // Add dragend listener to restore the element visibility
            const restoreDisplay = () => {
                target.style.display = ''; // This restores the element's default display value
                target.removeEventListener('dragend', restoreDisplay); // Clean up the event listener
            };

            target.addEventListener('dragend', restoreDisplay);
        }

    };

    const handleDrop = (event: React.DragEvent<HTMLElement>) => {
        //console.log(event.dataTransfer.getData("text"))
        const [nickname, position, teamId, playerId] = event.dataTransfer.getData("text").split(",")
        if(ref.current && (Object.keys(diagramPlayers).length < 44 || nickname in diagramPlayers)){
            const {width, height, left, top} = ref.current.getBoundingClientRect()
            let x = event.clientX - left
            let y = event.clientY - top

            if(x < 15){ x = 15}else if(x>width-15){ x = width-15}
            if(y < 15){ y = 15}else if(y>height-15-24){ y = height-15-24}
                       
            setDiagramPlayers(prev => ({
                ...prev,
                [nickname]: [x, y, position, Number(teamId), Number(playerId)],  // update or add this key
            }));
        }
    };

    console.log(diagramPlayers)
    console.log(participantData.team_name)

    return (
    <Box sx={{display:"flex", padding: 2, mt: 10,
                alignItems: 'center',   // Vertical alignment
                justifyContent: 'center', // Horizontal alignment
                position: "relative"
    }}>
        <Paper
            sx={{
                gap: 2, // Espaciado entre imágenes
                width: "fit-content", // Usa todo el ancho disponible
                padding: 2,
                ml: -40
            }} 
        >
        
            <Box>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
                    <img
                    src={`/static/teams/${game}/${String(participantData["team_name"]).replace("/", "_")}.png`} // Ruta basada en team_name
                    alt={participantData.team_name}
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
                        N. jugadores: {participantData.players.length}
                    </Typography>
                </div>

                <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", maxWidth: "410px", minWidth: "410px", overflowY: "auto" }} >

                    <Table stickyHeader>
                    <TableBody sx={{backgroundColor: '#fafafa'}}>

                        {Object.keys(participantData.groupedPlayers).map((category) => (
                        <React.Fragment key={category}>
                            {/* Render category header */}
                            <TableRow>
                            <TableCell colSpan={3} style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                                {category}
                            </TableCell>
                            </TableRow>
            
                            {/* Render rows for this category */}
                            {participantData.groupedPlayers[category].map((row, index) => (
                                                
                                <TableRow draggable  key={row.nickname}
                                    onDragStart={handleDragStart(row.nickname!, row.ID!, row.global_position!)}
                                    sx={{ bgcolor: getRowColor(row.global_position), position:"relative"}}  
                                    style={{ cursor: 'grab' }}>
                            
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
                                            
                                </TableRow>
                                        
                            ))}
                        </React.Fragment>
                        ))}
                        
                    </TableBody>
                    
                    </Table>

                </TableContainer>
                
            </Box>
                        
        </Paper>

        <Box 
            ref={ref}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',   // Vertical alignment
                justifyContent: 'center', // Horizontal alignment
                ml: 20}}
        >
            <img src="/static/field.png" alt="Logo" style={{ height: 672, minHeight: 672, pointerEvents: "none" }} />
            
            {Object.entries(diagramPlayers).map(([id, [x, y, position, teamId, playerId]]) => teamId === participantData.team_id ?  (

                
                <ColoredCircle key={id} x={x} y={y} playerName={id} playerId={playerId} position={position} handleDragStart={handleDragStart} 
                    handleClickRemove={handleClickRemove} showTrash={showTrash}/>
                    
                
            ) : null
            )}
            
        </Box>

        <Box sx={{ alignSelf: '' }}
            onDrop={handleDeleteDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <IconButton sx={{ color: 'white', ml: 2, zIndex: 1000}} onClick={handleClickTrash} >                           
                <DeleteForeverIcon fontSize='large' sx={{ color: showTrash ? "darkred" : "darkgray", fontSize: 60 }} />
            </IconButton>
        </Box>

    </Box>
    )
}

export default TeamsView