import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';

type EquiposDropdownProps = {
  equipos: string[];
  onEquipoSeleccionado: (equipo: string) => void;
};

const TeamSelectDropdown: React.FC<EquiposDropdownProps> = ({ equipos, onEquipoSeleccionado }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSeleccion = (equipo: string) => {
    onEquipoSeleccionado(equipo);
    handleClose();
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        sx={{ width: 150, position: 'absolute', top: '20px', right: 'calc(0% + 180px)' }}
        onClick={handleButtonClick}
      >
        Ver equipos
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {equipos.map((equipo, index) => (
          <MenuItem key={index} onClick={() => handleSeleccion(equipo)}>
            {equipo}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TeamSelectDropdown;
