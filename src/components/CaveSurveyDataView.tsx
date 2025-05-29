import * as React from 'react'
import Box from '@mui/material/Box'
import { OutputField } from './OutputField'
import { Values } from '../types'
import throttle from 'lodash/throttle'
import { Button, MenuItem } from '@mui/material'
import { SplitPane } from './SplitPane'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createIdb, Idb } from '@/idb/idb'
import { IdbProvider } from './IdbContext'
import { form } from '../form'
import { FormSwitchField } from './FormSwitchField'
import { SurveySheetsField } from './SurveySheetsField'
import { FormTextField } from './FormTextField'

const queryClient = new QueryClient()

const { FormProvider, useInitialize } = form

export default function Home() {
  const [idb, setIdb] = React.useState<Idb>()
  createIdb().then(setIdb)

  if (!idb) {
    return 'Loading...'
  }

  return (
    <IdbProvider idb={idb}>
      <QueryClientProvider client={queryClient}>
        <FormProvider>
          <Home2 />
        </FormProvider>
      </QueryClientProvider>
    </IdbProvider>
  )
}

function Home2() {
  const initialValues = React.useMemo((): Values | undefined => {
    try {
      return Values.parse({
        ...JSON.parse(localStorage.getItem('caveSurveyDataValues') || ''),
      })
    } catch (error) {
      return {
        outputFormat: 'FRCS',
        backsightAzimuthCorrected: true,
        backsightInclinationCorrected: true,
        pages: [],
      }
    }
  }, [])

  useInitialize({ values: initialValues }, [])

  return (
    <>
      <PersistData />
      <HideOverlayHotkey />
      <SplitPane
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        slotProps={{
          right: {
            sx: {
              pt: 2,
            },
          },
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <ClearDataButton />
            <ClearAllButton />
            <FormSwitchField
              field={form.get('hideOverlay')}
              label="Hide Overlay (Alt/⌥)"
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, mb: 2 }}>
            <FormSwitchField
              field={form.get('backsightAzimuthCorrected')}
              label="Corrected Backsight Azimuths"
            />
            <FormSwitchField
              field={form.get('backsightInclinationCorrected')}
              label="Corrected Backsight Inclinations"
            />
          </Box>
          <SurveySheetsField />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <FormTextField
            field={form.get('outputFormat')}
            type="text"
            label="Format"
            select
            fullWidth
          >
            <MenuItem value="FRCS">FRCS</MenuItem>
            <MenuItem value="Compass">Compass</MenuItem>
            <MenuItem value="Walls">Walls</MenuItem>
          </FormTextField>
          <OutputField
            fullWidth
            sx={{ flexGrow: 1, flexShrink: 1, minHeight: 0, mt: 2 }}
          />
        </Box>
      </SplitPane>
    </>
  )
}

function ClearDataButton() {
  const { value, setValue } = form.useField('pages')
  return (
    <Button
      onClick={() => {
        setValue(
          (value || []).map((page) => ({
            ...page,
            tables: page?.tables?.map((table) => ({
              ...table,
              shots: [],
            })),
          }))
        )
      }}
    >
      Clear Data
    </Button>
  )
}

function ClearAllButton() {
  const { setValue } = form.useField('pages')
  return (
    <Button
      onClick={() => {
        setValue([])
      }}
    >
      Clear All
    </Button>
  )
}

function PersistData() {
  const { value } = form.useField([])

  const handleChange = React.useMemo(
    () =>
      throttle((values: any) => {
        localStorage.setItem('caveSurveyDataValues', JSON.stringify(values))
      }, 500),
    []
  )

  React.useEffect(() => {
    if (value) handleChange(value)
  }, [value])

  return null
}

function HideOverlayHotkey() {
  const { setValue } = form.useField('hideOverlay')

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Alt') setValue(true)
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Alt') setValue(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return null
}
