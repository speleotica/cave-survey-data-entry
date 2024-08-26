import React from 'react'
import theme from '@/theme'
import { CssBaseline, ThemeProvider } from '@mui/material'
import CaveSurveyDataView from './CaveSurveyDataView'

export function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <CaveSurveyDataView />
    </ThemeProvider>
  )
}
