import React from 'react'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link'

export default function TemporaryDrawer() {
  const [state, setState] = React.useState({
    'menu': false,
  });

  const toggleDrawer =
    (open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }

        setState({ ...state, 'menu': open });
      };

  const getRedirection = (text: string) => {
    switch (text) {
      case 'Nosotros':
        return <Link href="/aboutus"> <ListItemText primary={text} />  </Link>
      case 'Ránking histórico':
        return <Link href="/textbox"> <ListItemText primary={text} />  </Link>
      default:
        return <Link href="/"> <ListItemText primary={text} />  </Link>
    }
  }


  const list = () => (
    <Box
      sx={{ width: 'auto'}}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {['Nosotros', 'Ránking histórico'].map((text) => (
          <ListItem key={text} disablePadding>
            {getRedirection(text)}
          </ListItem>
        ))}
      </List>

    </Box>
  );

  return (
    <div style={{ marginLeft: "20%" }}>
      <IconButton size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                  onClick={toggleDrawer(true)}>
        <MenuIcon sx={{ fontSize: 40 }}/>
      </IconButton>

      <Drawer
        anchor={'left'}
        open={state.menu}
        onClose={toggleDrawer(false)}
      >
        {list()}
      </Drawer>

    </div>
  );
}
