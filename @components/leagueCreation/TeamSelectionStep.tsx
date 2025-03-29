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
import { users } from "@prisma/client";
import TeamStatsTable from "../primitive/TeamStatsTable";
import { Height } from '@mui/icons-material';

  interface StepFiveProps {
    setStep: (step: number) => void;
    setFormData: React.Dispatch<React.SetStateAction<{ options?: Record<string, any> }>>;
    formData: { options?: Record<string, any> };
    users: users[];
  }
  

  const TeamSelectStep: React.FC<StepFiveProps> = ({ setStep, setFormData, formData, users }) => {

    const [localOptions, setLocalOptions] = useState<Record<string, any>>(
      users 
      ? users.reduce((acc, item) => {
          if (item.user_name) {
              acc[item.user_name] = formData.options?.[item.user_name] ?? null;
          }
          return acc;
      }, {} as Record<string, any>) 
      : {}
    );
    console.log(localOptions)
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

    const handleSetLocalOption = (value: string) => {
      setLocalOptions((prev) => ({
        ...prev, // Preserve existing keys
        [currentUser]: value, // Update or add a new key-value pair
      }));
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
                              <Typography variant="h6">{item.user_name}</Typography>
                          </CardContent>
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
                      </Card>
                  </Box>
              ))
          ) : (
              <Typography variant="body1">No users available</Typography>
          )}
        </Box>

      {/* Modal Popup with an Empty Material UI Card inside */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <TeamStatsTable data={teams} game={formData.options?.["game"]} onSelect={(value) => { handleSetLocalOption(value); setOpenModal(false); }} />
      </Modal>
        
      </Paper>
    );
  };
  
  export default TeamSelectStep;
  