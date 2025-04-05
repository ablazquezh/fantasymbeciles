import React from 'react'
import type { NextPage } from 'next'

import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'

import HomeSelection from "../@components/leagueCreation/HomeSelection"
import GameSelectionStep from "../@components/leagueCreation/GameSelectionStep";
import LeagueTypeSelectionStep from "../@components/leagueCreation/LeagueTypeSelectionStep";
import SettingsStep from '../@components/leagueCreation/SettingsStep'
import TeamSelectStep from '../@components/leagueCreation/TeamSelectionStep'

import StepperNav from "../@components/leagueCreation/BreadcrumbsNav";
import { Fade, Container, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { PrismaClient, Prisma, users, leagues } from "@prisma/client";
  
const prisma = new PrismaClient();

interface HomeProps {
  users: users[];
  leagues: leagues[];
}

type FormData = {
  options?: Record<string, any>;
};

const FantasyHomePage: NextPage = () => {
 
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({ options: {} });
  const [showBreadcrumbs, setShowBreadcrumbs] = useState<boolean>(false);

  const [users, setUsers] = useState<users[]>([]);
  const [leagues, setLeagues] = useState<leagues[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
        const res = await fetch(`/api/leagueusers`);
        const data = await res.json();
        setUsers(data.users);
    };
    const fetchLeagues = async () => {
      const res = await fetch(`/api/leagues`);
      const data = await res.json();
      setLeagues(data.leagues);
  };

    fetchUsers();
    fetchLeagues();
    setMounted(true)
  }, []);

  if (!mounted) return null

  const handleStepChange = (newStep: number) => {
    if (newStep > 1) setShowBreadcrumbs(true); // Show breadcrumbs after Step 1
    setStep(newStep);
  };
  console.log(formData)
  console.log(users)
  console.log(leagues)
  return (

    <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>

      
        {step > 1 && <StepperNav step={step} setStep={handleStepChange} />}

        <Fade in={step === 1} timeout={500} unmountOnExit>
          <div>{step === 1 ? <HomeSelection setStep={handleStepChange} /> : <span />}</div>
        </Fade>     

        <Fade in={step === 2} timeout={500} unmountOnExit>
          <div>
            {step === 2 && <GameSelectionStep setStep={handleStepChange} setFormData={setFormData} />}
          </div>
        </Fade>

        <Fade in={step === 3} timeout={500} unmountOnExit>
          <div>
            {step === 3 && <LeagueTypeSelectionStep setStep={handleStepChange} setFormData={setFormData} />}
          </div>
        </Fade>

        <Fade in={step === 4} timeout={500} unmountOnExit>
          <div>{step === 4 && <SettingsStep formData={formData} setStep={handleStepChange} setFormData={setFormData} />}</div>
        </Fade>

        <Fade in={step === 5} timeout={500} unmountOnExit>
          <div>{step === 5 && <TeamSelectStep formData={formData} setStep={handleStepChange} setFormData={setFormData} users={users} leagues={leagues} />}</div>
        </Fade>

      
    </VerticalLayoutTextboxSearch>
  )
}

export default FantasyHomePage
