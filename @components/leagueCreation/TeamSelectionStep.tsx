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
  
  interface StepFiveProps {
    setStep: (step: number) => void;
    setFormData: React.Dispatch<React.SetStateAction<{ options?: Record<string, any> }>>;
    formData: { options?: Record<string, any> };
    users: users[];
  }
  
  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const TeamSelectStep: React.FC<StepFiveProps> = ({ setStep, setFormData, formData, users }) => {

    console.log(formData.options?.["game"])
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
  

    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            const res = await fetch(`/api/teams?game=${formData.options?.["game"]}`);
            const data = await res.json();
            setTeams(data.teams);
        };

        fetchTeams();
    }, [formData.options?.["game"]]);
    console.log(teams)

     // Update formData as user interacts
     useEffect(() => {
      setFormData((prev) => ({
        options: { ...prev.options, ...localOptions },
      }));
    }, [localOptions, setFormData]);
  

    const [openModal, setOpenModal] = useState(false);

    const handleOpenModal = () => {
        setOpenModal(true); // Opens the modal
    };

    const handleCloseModal = () => {
        setOpenModal(false); // Closes the modal
    };


    return (
      <Paper sx={{ paddingTop: 4, paddingBottom: 4, marginTop: 11 }}>
  
        <Box
            sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2, // spacing between items
            }}
        >
          {users && users.length > 0 ? (
              users.map((item) => (
                  <Box key={item.ID} sx={{ flex: '1 0 calc(33.333% - 16px)', marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
                      <Card sx={{ position: 'relative', width: '100%' }}>
                          <CardContent>
                              <Typography variant="h6">{item.user_name}</Typography>
                              <Typography variant="body2" color="textSecondary">CHECK</Typography>
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
                              onClick={handleOpenModal}
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
        <Box sx={modalStyle}>
          <Card>
            <CardContent>
              {/* This is an empty card */}
              <Typography variant="h6">This is an empty card inside the modal.</Typography>
              <Typography variant="body2" color="textSecondary">
                You can add more content here if needed.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Modal>
        
      </Paper>
    );
  };
  
  export default TeamSelectStep;
  