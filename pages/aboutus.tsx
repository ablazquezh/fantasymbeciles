import React, { useEffect, useState } from "react";

import type { NextPage } from 'next'

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea'
import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'

import { PrismaClient, users } from "@prisma/client";

const prisma = new PrismaClient();

export async function getServerSideProps() {
  const users: users[] = await prisma.users.findMany();
  return { props: { users } };
}

type Props = {
  users: users[];
};

const AboutUs: NextPage<Props> = ({users}: Props) => {
   
  console.log(users)
    
  return (

    <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>

      <div>
        <h1>Users</h1>
        <ul>
          {users.map((user) => (
            <li key={user.ID}>{user.user_name} </li>
          ))}
        </ul>
      </div>

    </VerticalLayoutTextboxSearch>
  )
}

export default AboutUs
