import React, { useState } from 'react'
import type { GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'

import { TextField} from '@mui/material'
// import VerticalLayout from '../@components/layout/VerticalLayout'
// import Row from '../@components/layout/Row'
import Button from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea'
import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'

import HomeSelection from "../@components/leagueCreation/HomeSelection"
import GameSelectionStep from "../@components/leagueCreation/GameSelectionStep";
import LeagueTypeSelectionStep from "../@components/leagueCreation/LeagueTypeSelectionStep";
import SettingsStep from '../@components/leagueCreation/SettingsStep'

import BreadcrumbsNav from "../@components/leagueCreation/BreadcrumbsNav";
import { Fade, Container, Paper } from "@mui/material";


type FormData = {
  selection: string;
  options?: Record<string, any>;
};


const FantasyHomePage: NextPage = ({}) => {
 
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({ selection: "" });
  const [showBreadcrumbs, setShowBreadcrumbs] = useState<boolean>(false);

  const handleStepChange = (newStep: number) => {
    if (newStep > 1) setShowBreadcrumbs(true); // Show breadcrumbs after Step 1
    setStep(newStep);
  };

  return (

    <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>

      
        {showBreadcrumbs && <BreadcrumbsNav step={step} setStep={handleStepChange} />}

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
          <div>
            {step === 4 && <SettingsStep formData={formData} setStep={handleStepChange} />}
          </div>
        </Fade>

    </VerticalLayoutTextboxSearch>
  )
}

export default FantasyHomePage
