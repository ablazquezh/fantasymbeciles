import React, { useState, useEffect } from 'react';import {
    FormControl,
    FormControlLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Button,
    Paper,
  } from "@mui/material";
import { Card, CardContent, IconButton, Modal, Box, Typography, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { users, leagues } from "@prisma/client";
import TeamStatsTable from "../primitive/TeamStatsTable";
import { Height } from '@mui/icons-material';
import CardMedia from '@mui/material/CardMedia';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from "next/router";

  interface StepFiveProps {
    setStep: (step: number) => void;
    setFormData: React.Dispatch<React.SetStateAction<{ options?: Record<string, any> }>>;
    formData: { options?: Record<string, any> };
    users: users[];
    leagues: leagues[];
  }
  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  const TeamSelectStep: React.FC<StepFiveProps> = ({ setStep, setFormData, formData, users, leagues }) => {

    const [error, setError] = useState(false); 
    const [helperText, setHelperText] = useState('');

    const router = useRouter();

    const [localOptions, setLocalOptions] = useState<Record<string, (string | number)[] | null>>(
      users
        ? users.reduce((acc, item) => {
            if (item.user_name) {
              acc[item.user_name] = formData.options?.[item.user_name] 
                ? Array.isArray(formData.options[item.user_name])
                  ? formData.options[item.user_name]
                  : null
                : null; // Si no existe el valor, asignamos null
            }
            return acc;
          }, {} as Record<string, (string | number)[] | null>) 
        : {}
    );

    const validValuesCount = Object.values(localOptions).filter((value) => value !== null).length;

    const [teams, setTeams] = useState([]);
    const [currentUser, setCurrentUser] = useState<string>('');

    useEffect(() => {
        const fetchTeams = async () => {
            const res = await fetch(`/api/teams?game=${formData.options?.["game"]}`);
            const data = await res.json();
            setTeams(data.teams);
        };

        fetchTeams();
    }, [formData.options?.["game"]]);

     // Update formData as user interacts
     useEffect(() => {
      setFormData((prev) => ({
        options: { ...prev.options, ...localOptions },
      }));
    }, [localOptions, setFormData]);
  

    const [openModal, setOpenModal] = useState(false);

    const handleOpenModal = (user:string|null) => {
        setOpenModal(true); // Opens the modal
        setCurrentUser(user || '');
    };

    const handleCloseModal = () => {
        setOpenModal(false); // Closes the modal
    };

    const handleRemoveTeam = (userName: string|null) => {

      if (userName !== null) {

        setLocalOptions((prev) => ({
          ...prev, // Preserve existing keys
          [userName]: null, // Update or add a new key-value pair
        }));
    }
  };

    const handleSetLocalOption = (value: string, valueFK: number) => {
      setLocalOptions((prev) => ({
        ...prev, // Preserve existing keys
        [currentUser]: [value, valueFK], // Update or add a new key-value pair
      }));
    };


    const [openLeagueNameModal, setOpenLeagueNameModal] = useState(false);

    const handleOpenLeagueNameModal = () => {
      setOpenLeagueNameModal(true); // Opens the modal
    };

    const handleCloseLeagueNameModal = () => {
      setOpenLeagueNameModal(false); // Closes the modal
      setError(false);
      setHelperText("");
    };

    const [leagueName, setLeagueName] = useState('');

    const leagueIdx = leagues.length > 0 ? leagues[leagues.length - 1].ID +1 : 1;

    const handleCreateLeague = () => {

      const hasMatch = leagues.some((obj) => obj.league_name === leagueName);
      if (hasMatch) {
        setLeagueName("")
        setError(true); // Show error
        setHelperText('Nombre de liga ya existente. Por favor, asigna uno distinto.');
        return;
      }

      const leagueParticipantRecords = users
      .filter((user): user is { user_name: string; ID: number } => user.user_name !== null)
      .map((user) => ({
        user_ID_fk: user.ID,
        team_ID_fk: localOptions[user.user_name as string]?.[1],
        league_ID_fk: leagueIdx
      }));


      const postLeague = async () => {
        try {
          const response = await fetch("/api/createleague", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leagueName: leagueName, leagueType: formData.options?.leaguetype,
              winterMarket: formData.options?.winterMarket, yellowCards: formData.options?.cardSuspension,
              playerAvgLimit: formData.options?.averageLimit, budgetCalc: formData.options?.budgetCalculation,
              game: formData.options?.game
            }),
          });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log("Success:", data);
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
    }
    postLeague();
    const postLeagueParticipants = async () => {
      try {
        const response = await fetch("/api/createleagueparticipants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: leagueParticipantRecords }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          console.log("Success:", data);
        } else {
          console.error("Error:", data.error);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    }
    postLeagueParticipants();

    router.push(`/playerSelection?leagueId=${leagueIdx}`);
/*
      try {
        const [response1, response2] = await Promise.all([
          fetch("/api/createleague", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leagueName: leagueName, leagueType: formData.options?.leaguetype,
              winterMarket: formData.options?.winterMarket, yellowCards: formData.options?.cardSuspension,
              playerAvgLimit: formData.options?.averageLimit, budgetCalc: formData.options?.budgetCalculation,
              game: formData.options?.game
            }),
          }),
          fetch("/api/createleagueparticipants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ records: leagueParticipantRecords }),
          }),
        ]);
    
        const data1 = await response1.json();
        const data2 = await response2.json();
    
        if (response1.ok && response2.ok) {
          console.log("Success:", data1, data2);
          router.push(`/playerSelection?leagueId=${leagueIdx}`);
        } else {
          console.error("Error:", data1.error || data2.error);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }*/
    };

    const handleTextBoxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLeagueName(e.target.value); setError(false); setHelperText("");
    };

    return (
      <Paper sx={{ paddingTop: 4, paddingBottom: 4, marginTop: 11 }}>
  
        <Box
            sx={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: 20, // spacing between items
            rowGap: '40px',
            justifyContent: 'center'
            }}
        >
          {users && users.length > 0 ? (
              users.map((item) => (
                  <Box key={item.ID} sx={{ display: 'flex', justifyContent: 'center', height: '200px' }}>
                      <Card sx={{ position: 'relative', width: '200px' }}>
                          <CardContent>
                              <Typography variant="h6" fontWeight="bold" sx={{textAlign: 'center'}}>{item.user_name}</Typography>
                          </CardContent>
                            {item.user_name === null ? (
                              <p>The key is null</p> // Handle the case when the key is null
                            ) : localOptions[item.user_name] === null ? (
                              <IconButton
                                  sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      backgroundColor: '#1976d2',
                                      color: 'white',
                                  }}
                                  onClick={() => handleOpenModal(item.user_name)}
                              >
                                  <AddIcon />
                              </IconButton>
                            ) : (
                              <>
                                {localOptions[item.user_name] !== null ? (
                                  
                                  <img 
                                    src={`/static/teams/${formData.options?.["game"]}/${String(localOptions[item.user_name]![0]).replace("/", "_")}.png`}
                                    alt={localOptions[item.user_name]![0] as string}
                                    style={{
                                      width: "45px", 
                                      height: "45px", 
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      cursor: "pointer",
                                      transition: "1s",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.filter = "grayscale(100%)")}
                                    onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
                                    onClick={() => handleOpenModal(item.user_name)}
                                  />
                                ) : (
                                  <div>No image available</div> // O cualquier otra alternativa que quieras mostrar
                                )}
                                <Typography variant="body1"  sx={{marginTop: '40%', textAlign: 'center'}}>{localOptions[item.user_name]![0]}
                                </Typography>

                                <IconButton
                                  sx={{
                                      position: "absolute",
                                      top: 0, // Espaciado desde arriba
                                      right: 0, // Espaciado desde la derecha
                                      color: 'white',
                                  }}
                                  onClick={() => handleRemoveTeam(item.user_name)}
                              >
                                
                                <CloseIcon fontSize='small' sx={{ color: "red" }} />
                                
                              </IconButton>
                              </>
                            )}
                          
                      </Card>
                  </Box>
              ))
          ) : (
              <Typography variant="body1">No users available</Typography>
          )}
        </Box>

        {/* ✅ Navigation Buttons */}
        <Button variant="contained" color="primary" disabled={validValuesCount < 3}
        onClick={() => handleOpenLeagueNameModal()} sx={{ width: 100, mt: 5, ml: "calc(100% - 120px)" }}>
          hecho
        </Button>

        {/* Modal Popup with an Empty Material UI Card inside */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <TeamStatsTable data={teams} game={formData.options?.["game"]} localOptions={localOptions} onSelect={(value, valueFK) => { handleSetLocalOption(value, valueFK); setOpenModal(false); }} />
        </Modal>

        <Modal open={openLeagueNameModal} onClose={handleCloseLeagueNameModal}>
          <Box sx={modalStyle}>
            <TextField
                label="Dale un nombre a la liga"
                variant="outlined"
                fullWidth
                value={leagueName}
                onChange={handleTextBoxChange}
                sx={{ width: '100%' }}
                error={error} // Show error state
                helperText={helperText} // Show helper text on error
            />
            <Button variant="contained" color="primary" disabled={leagueName.length < 3}
              onClick={() => handleCreateLeague()} sx={{ width: 150, mt: 2, ml: "calc(100% - 150px)" }}>
                crear liga
            </Button>
          </Box>
        </Modal>
        
      </Paper>
    );
  };
  
  export default TeamSelectStep;
  