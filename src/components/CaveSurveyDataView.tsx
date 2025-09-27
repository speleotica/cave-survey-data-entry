import * as React from 'react'
import Box from '@mui/material/Box'
import { OutputField } from './OutputField'
import { Values } from '../types'
import throttle from 'lodash/throttle'
import {
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { SplitPane } from './SplitPane'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createIdb, Idb } from '@/idb/idb'
import { IdbProvider } from './IdbContext'
import { form } from '../form'
import { FormSwitchField } from './FormSwitchField'
import { SurveySheetsField } from './SurveySheetsField'
import { FormTextField } from './FormTextField'
import { ArrowDropDown } from '@mui/icons-material'
import { UseField } from './UseField'

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
        tripHeader: {
          name: '',
          team: '',
          angleUnit: 'degrees',
          distanceUnit: 'feet',
          backsightAzimuthCorrected: true,
          backsightInclinationCorrected: true,
          frontsightBacksightTolerance: 2,
        },
        pages: [],
      }
    }
  }, [])

  useInitialize({ parsedValues: initialValues }, [])

  const { value: hideHeader, setValue: setHideHeader } =
    form.useField('hideHeader')

  const toggleHeader = React.useCallback(
    () => setHideHeader(!hideHeader),
    [hideHeader, setHideHeader]
  )

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
            gap: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
            }}
          >
            <ClearDataButton />
            <ClearAllButton />
            <FormSwitchField
              field={form.get('hideOverlay')}
              label="Hide Overlay (Alt/⌥)"
            />
            <Box sx={{ flex: 1 }} />
            <Tooltip
              title={hideHeader ? 'Show Trip Header' : 'Hide Trip Header'}
            >
              <IconButton onClick={toggleHeader}>
                <ArrowDropDown
                  sx={{
                    transition: 'transform',
                    transform: hideHeader ? 'scaleY(1)' : 'scaleY(-1)',
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={!hideHeader} sx={{ flexShrink: 0 }}>
            <Box
              sx={{
                p: 1,
                flexGrow: 1,
                flexShrink: 1,
                gap: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                overflow: 'hidden',
              }}
            >
              <FormTextField
                type="text"
                label="Cave Name"
                field={form.get('tripHeader.cave')}
                fullWidth
              />
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                <FormTextField
                  type="text"
                  label="Trip Name"
                  field={form.get('tripHeader.name')}
                  sx={{ flex: '1 1 auto' }}
                  fullWidth
                />
                <FormTextField
                  type="text"
                  label="Trip Date"
                  field={form.get('tripHeader.date')}
                  sx={{ flex: '1 1 auto' }}
                  fullWidth
                />
              </Box>
              <FormTextField
                type="text"
                label="Survey Team"
                field={form.get('tripHeader.team')}
                fullWidth
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  mb: 2,
                  alignSelf: 'stretch',
                }}
              >
                <FormTextField
                  type="text"
                  field={form.get('tripHeader.distanceUnit')}
                  label="Distance Unit"
                  select
                  fullWidth
                >
                  <MenuItem value="meters">Meters</MenuItem>
                  <MenuItem value="feet">Feet</MenuItem>
                </FormTextField>
                <FormTextField
                  type="text"
                  field={form.get('tripHeader.angleUnit')}
                  label="Angle Unit"
                  select
                  fullWidth
                >
                  <MenuItem value="degrees">Degrees</MenuItem>
                  <MenuItem value="gradians">Gradians</MenuItem>
                  <MenuItem value="mils">Mils</MenuItem>
                </FormTextField>
                <FormTextField
                  type="text"
                  field={form.get('tripHeader.frontsightBacksightTolerance')}
                  label="Backsight Tolerance"
                  fullWidth
                  inputProps={{
                    sx: { textAlign: 'right' },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <UseField field={form.get('tripHeader.angleUnit')}>
                          {({ value }) => value ?? null}
                        </UseField>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box
                sx={{ display: 'flex', flexDirection: 'row', gap: 4, mb: 2 }}
              >
                <FormSwitchField
                  field={form.get('tripHeader.backsightAzimuthCorrected')}
                  label="Corrected Backsight Azimuths"
                />
                <FormSwitchField
                  field={form.get('tripHeader.backsightInclinationCorrected')}
                  label="Corrected Backsight Inclinations"
                />
              </Box>
            </Box>
          </Collapse>
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
