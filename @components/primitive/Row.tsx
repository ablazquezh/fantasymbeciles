import React, { useEffect, useState, useRef } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot} from "@hello-pangea/dnd";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import styled from "styled-components";
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material'; // 👈 Import this from MUI
import { RowData } from '../types/RowData';
import getRowColor from '../utils/getRowColor';
import { leagues, team_budget } from '@prisma/client';

const globalDetailColnames = {
    age: "Edad",
    height: "Altura(cm)",
    best_foot: "Pie",
    weak_foot_5stars: "Pie malo",
    heading: "Cabeceo",
    jump: "Salto",
    long_pass: "Pase largo",
    short_pass: "Pase corto",
    dribbling: "Regate",
    acceleration: "Aceleración",
    speed: "Velocidad",
    shot_power: "Potencia de disparo",
    long_shot: "Disparo largo",
    stamina: "Aguante",
    defense: "Defensa",
    interception: "Intercepción"
  };
  
  
  // Custom column names
  const globalColnames = {
    nickname: "Jugador",
    average: "Pt. Global",
    positions: "Posiciones",
    team_name: "Equipo de origen"
  };
  

const Item = styled.div<{ isdragging?: boolean }>`
  display: flex;
  user-select: none;
  padding: 0.5rem;
  margin: 0 0 0.5rem 0;
  align-items: flex-start;
  align-content: flex-start;
  line-height: 1.5;
  border-radius: 3px;
  background: #fff;
  border: 1px ${(props) => (props.isdragging ? "dashed #000" : "solid #ddd")};
  opacity: ${(props) => (props.isdragging ? "0" : "1")};
`;

const Clone = styled(Item)`
  ~ div {
    transform: none !important;
  }
`;

export default function Row(props: { dbleague: leagues, row: RowData, gamekey: string | null, provided: DraggableProvided, snapshot: DraggableStateSnapshot, 
  teams: string[], onSelect: (team_name: string, player: RowData, prev?: string, newSellerBudget?: number|null, result?:number|null, newBudget?: number|null) => void, 
  selectedTeam: string, team_budgets?: team_budget[], }) {
        
    const { dbleague, row, gamekey, provided, snapshot, teams, onSelect, selectedTeam, team_budgets, } = props;

    const [open, setOpen] = React.useState(false);

    const [selectedValue, setSelectedValue] = React.useState(selectedTeam);

    useEffect(() => {
      setSelectedValue(selectedTeam);
    }, [selectedTeam]);

    const handleChange = async(event: SelectChangeEvent) => {


      if(team_budgets) {
        // WE ARE IN PRO MODE 
        
        if(selectedValue !== "Sin traspaso" && event.target.value === "Sin traspaso"){
          setSelectedValue(event.target.value as string);
          onSelect(event.target.value, row, selectedValue)

        }else if(team_budgets.find(item => item.team_name === event.target.value)?.budget! >= row.value!){
          // IF THE BUDGET WAS ENOUGH -> SEE HOW TO ASSIGN 
          if(selectedValue === "Sin traspaso"){
            // IF THE VALUE BEFORE CHANGING WAS NOT A LEAGUE TEAM -> ASSIGN THE TRANSFER
            onSelect(event.target.value, row, selectedValue);
          }else{
            // TRIGGER A NEGOTIATION WINDOW
            onSelect(event.target.value, row, selectedValue)
          }
       }else{
          // IF THE BUDGET IS NOT ENOUGH BETWEEN TWO LEAGUE TEAMS -> TRIGGER A NEGOTIATION WINDOW
            onSelect(event.target.value, row, selectedValue)
       }
      }else{
        // IF NOT IN PRO MODE -> ALWAYS ASSIGN WHATEVER YOU DO
        setSelectedValue(event.target.value as string);
        onSelect(event.target.value, row)
      }
    };
    return (
      <React.Fragment>
  
        <TableRow sx={{ bgcolor: getRowColor(row.global_position) }} >
                                
          <TableCell sx={{width: 0, paddingRight:0}}>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          { Object.keys(globalColnames).map((col) => (
            <TableCell key={col} 
            sx={{
              width: col === 'average' ? '100px' : col === 'team_name' ? '150px' : 'auto',
              paddingLeft: 0
            }}>
              {col === "nickname" ? (
                <Box
                  display="flex"
                  justifyContent="center" // Center the image horizontally
                  alignItems="center" // Center the image vertically
                  sx={{
                      height: "100%", // Make sure the Box takes the full height of the cell
                      padding: 0 // Optional: Remove any padding
                  }}
                >
                  <img
                    src={`/static/players/${gamekey}/${row["ID"]-1}.png`} // Load the image based on team_name
                    alt={row[col as keyof typeof globalColnames] as string}
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.src = `/static/players/${gamekey}/nophoto.png`; // Fallback path
                    }}
                    style={{ width: "45px", height: "45px", marginRight: "8px" }}
                  />
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
                </Box>
              ) : col === "team_name" ?(
                <Box
                  display="flex"
                  justifyContent="center" // Center the image horizontally
                  alignItems="center" // Center the image vertically
                  sx={{
                      height: "100%", // Make sure the Box takes the full height of the cell
                      padding: 0 // Optional: Remove any padding
                  }}
                  
                >
                  <img 
                    src={`/static/teams/${gamekey}/${String(row["team_name"]).replace("/", "_")}.png`} // Load the image based on team_name
                    alt={row[col as keyof typeof globalColnames] as string}
                    style={{ width: "38px", height: "38px", marginRight: "8px" }}
                    title={row[col as keyof typeof globalColnames] as string}
                  />
                </Box>
              ) : (
                <Box
                  display="flex"
                  justifyContent="center" // Center the image horizontally
                  alignItems="center" // Center the image vertically
                  sx={{
                      height: "100%", // Make sure the Box takes the full height of the cell
                      padding: 0 // Optional: Remove any padding
                  }}
                >
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
                </Box>
              )}
            </TableCell>
          ))}
          {dbleague?.type === "pro" &&
            <TableCell>
                {Intl.NumberFormat('de-DE').format(Number(row.value))}
            </TableCell>
          } 
          <TableCell sx={{ borderLeft: '1px solid rgba(0, 0, 0, 0.12)'}}>
           <FormControl fullWidth sx={{ alignItems: 'center' }}>
              <Select
                labelId="select-label"
                value={selectedValue}
                onChange={handleChange}
                label="Selecciona una opción"
                sx={{backgroundColor: "white",width: 150,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  height:30,
                  fontSize:12,
                  padding: 0
                }}
              >
                <MenuItem key={"None"} value={"Sin traspaso"} sx={{ fontSize: '10px' }}>
                    {"Sin traspaso"}
                  </MenuItem>
                {teams.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: '10px' }}>
                    {option}
                  </MenuItem>
                ))}
                
              </Select>
            </FormControl>
          </TableCell>
          <TableCell sx={{width: 0}}>
            <Item
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                isdragging={snapshot.isDragging}
                style={provided.draggableProps.style}
            >
                <DragIndicatorIcon />
            </Item>
            {snapshot.isDragging && <Clone> <DragIndicatorIcon /> </Clone> }
          </TableCell>
        </TableRow>
  
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ height: 200, overflow: 'hidden'}}> {/* Set a fixed height */}
                  <List
                    sx={{
                      display: 'grid', // Using grid layout
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Automatically create columns
                      gridGap: '3px', // Space between items
                      maxHeight: '100%', // Make sure it doesn't exceed the container height
                      overflow: 'auto', // Scroll if the list exceeds the container
                    }}
                  >
                    {Object.entries(row.detail).map(([key, value]) => (
                      <ListItem key={key} >
                        {globalDetailColnames[key as keyof typeof globalDetailColnames]}: {row.detail[key as keyof RowData['detail']] ?? '-'}
                      </ListItem>
                    ))}
                  </List>
                </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }