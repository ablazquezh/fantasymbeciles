import React, { useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
import TemporaryDrawer from './Drawer'
import UserMenu from './UserMenu'
//import { useAuth0 } from '@auth0/auth0-react'
import { request } from 'graphql-request'
//import { creatUser } from '../../gql_queries'


export default function ButtonAppBar() {

  // const {loginWithPopup, isAuthenticated, logout, user} = useAuth0();
  //const {loginWithPopup, isAuthenticated, user} = useAuth0();

  /*useEffect(() => {
    const sendUserInfo = async () => {
      if((user?.email) != null) {
        return await request('http://127.0.0.1:5001/graphql', creatUser, { uuid: user?.email })
      }
    }

    if(isAuthenticated) {
      void sendUserInfo()
    }

  }, [isAuthenticated, user?.email]);*/

  return (
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="static" sx={{ height: 80 }}>
        <Toolbar  sx={{ height: "100%", position: "relative"}}>
          <TemporaryDrawer/>
          <img src="/static/weblogo.png" alt="Logo" style={{
            height: 50,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }} />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
