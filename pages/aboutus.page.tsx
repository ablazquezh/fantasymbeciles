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
   
  const [user_name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_name }),
    });

    if (res.ok) {
      alert("User created successfully!");
      setName("");
    } else {
      alert("Error creating user");
    }
  };



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

      <div>
      <h1>Create User</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={user_name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">Create</button>
      </form>
    </div>
      

    </VerticalLayoutTextboxSearch>
  )
}

export default AboutUs
