import React from 'react'
import theme from '@/theme'
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material'
import CaveSurveyDataView from './CaveSurveyDataView'

export function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <GlobalStyles
        styles={{
          '@keyframes mui-auto-fill': { from: { display: 'block' } },
          '@keyframes mui-auto-fill-cancel': { from: { display: 'block' } },
        }}
      />
      <CaveSurveyDataView />
    </ThemeProvider>
  )
}
