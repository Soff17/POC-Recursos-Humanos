"use client";

import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import CesticTalentHub from "@/components/CesticRH/CesticTalentHub";

export default function Home() {
    return (
        <ThemeProvider theme={theme}>
              <CesticTalentHub />
        </ThemeProvider>
    );
}
