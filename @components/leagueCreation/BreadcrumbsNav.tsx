import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";

interface BreadcrumbsProps {
  step: number;
  setStep: (step: number) => void;
}

const BreadcrumbsNav: React.FC<BreadcrumbsProps> = ({ step, setStep }) => {
  return (
    <Breadcrumbs separator="›" sx={{ mb: 2 }}>
      <Link
        component="button"
        onClick={() => setStep(2)}
        color={step > 2 ? "primary" : "text.disabled"}
      >
        Select Option
      </Link>
      <Typography color="text.primary">Form</Typography>
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
