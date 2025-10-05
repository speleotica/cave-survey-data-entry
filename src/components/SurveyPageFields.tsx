import {
  Box,
  Fab,
  InputAdornment,
  SxProps,
  TextField,
  Tooltip,
} from '@mui/material'
import * as React from 'react'
import { LayoutVariant } from '../types'
import { ViewStream, Error, Warning } from '@mui/icons-material'
import {
  UseFieldProps as _UseFieldProps,
  FieldPathForValue,
} from '@jcoreio/zod-forms'

type UseHtmlFieldProps = (index: number) => React.ComponentProps<
  typeof TextField
> & {
  validationError?: React.ReactNode
}

type UseFieldProps<V> = (index: number) => _UseFieldProps<FieldPathForValue<V>>

type UseStationAndLrudFieldProps = {
  station?: UseHtmlFieldProps
  left?: UseHtmlFieldProps
  right?: UseHtmlFieldProps
  up?: UseHtmlFieldProps
  down?: UseHtmlFieldProps
}

type UseFieldPropsMap = {
  from?: UseStationAndLrudFieldProps
  to?: UseStationAndLrudFieldProps
  isSplit?: UseFieldProps<boolean | undefined>
  distance?: UseHtmlFieldProps
  frontsightAzimuth?: UseHtmlFieldProps
  backsightAzimuth?: UseHtmlFieldProps
  frontsightInclination?: UseHtmlFieldProps
  backsightInclination?: UseHtmlFieldProps
  notes?: UseHtmlFieldProps
}

export const SurveyPageFields = React.memo(function SurveyPageFields({
  useFieldProps,
  layoutVariant = 'IMO',
}: {
  useFieldProps?: UseFieldPropsMap
  layoutVariant?: LayoutVariant
}) {
  const numRows = layoutSpecs[layoutVariant].numRows
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%',
        height: '100%',
      }}
      data-component="SurveyPageFields"
    >
      {[...Array(numRows).keys()].map((index) => (
        <SurveyRow
          sx={{
            flexBasis: `${100 / numRows}%`,
          }}
          key={index}
          index={index}
          layoutVariant={layoutVariant}
          useFieldProps={useFieldProps}
          includeShotFields={index < numRows - 1}
        />
      ))}
    </Box>
  )
})

const lrudDirs = ['left', 'right', 'up', 'down'] as const

type StaggeredLayoutSpec = {
  staggered: true
  numRows: number
  stationWidth: string
  shotWidth: string
  distanceWidth?: string
  azimuthWidth?: string
  inclinationWidth?: string
  lrudWidth?: string
  lrudWidths?: { [K in (typeof lrudDirs)[number]]?: string }
  downWidth?: string
  notes?: 'afterLrud' | 'afterInclination'
  notesWidth?: string
}

type UnstaggeredLayoutSpec = {
  staggered: false
  numRows: number
  station: 'from' | 'to'
  stationWidth: string
  shotWidth: string
  distanceWidth?: string
  azimuthWidth?: undefined
  inclinationWidth?: undefined
  lrudWidth?: string
  lrudWidths?: { [K in (typeof lrudDirs)[number]]?: string }
  notes?: undefined
  notesWidth?: undefined
}

type LayoutSpec = StaggeredLayoutSpec | UnstaggeredLayoutSpec

const layoutSpecs: Record<LayoutVariant, LayoutSpec> = {
  Lech: {
    staggered: true,
    numRows: 11,
    stationWidth: '19%',
    shotWidth: '37.5%',
    notes: 'afterLrud',
    notesWidth: '43%',
  },
  IMO: {
    staggered: true,
    numRows: 11,
    stationWidth: '16%',
    shotWidth: '40%',
    notes: 'afterLrud',
    notesWidth: '30%',
  },
  'X-38': {
    staggered: true,
    numRows: 10,
    stationWidth: '18%',
    shotWidth: '38%',
    distanceWidth: '38%',
    azimuthWidth: '30%',
    inclinationWidth: '30%',
    notes: 'afterInclination',
    notesWidth: '12%',
  },
  'X-39': {
    staggered: true,
    numRows: 10,
    stationWidth: '18%',
    shotWidth: '38.5%',
    distanceWidth: '38%',
    azimuthWidth: '30%',
    inclinationWidth: '30%',
    lrudWidths: {
      left: '23%',
      right: '23%',
      up: '25%',
      down: '28%',
    },
    notes: 'afterInclination',
    notesWidth: '12%',
  },
  FromStaDisAzIncLrUd: {
    staggered: false,
    numRows: 26,
    station: 'from',
    stationWidth: '16%',
    shotWidth: '50%',
  },
  ToStaDisAzIncLrUd: {
    staggered: false,
    numRows: 26,
    station: 'to',
    stationWidth: '16%',
    shotWidth: '50%',
  },
}

const SurveyRow = ({
  sx,
  index,
  useFieldProps,
  includeShotFields = true,
  layoutVariant,
}: {
  sx?: SxProps
  index: number
  layoutVariant: LayoutVariant
  useFieldProps?: UseFieldPropsMap
  includeShotFields?: boolean
}) => {
  const isSplitProps = useFieldProps?.isSplit?.(index)
  const spec = layoutSpecs[layoutVariant]
  const { staggered } = spec
  const isSplit = staggered ? isSplitProps?.value === true : false
  const stationIndex =
    spec.staggered || spec.station !== 'to' ? index : index + 1

  let x = 0
  const y = staggered ? index * 2 : index
  const fsY = staggered ? y + 1 : y
  const bsY = staggered ? y + 2 : y
  const xs = {
    fromStation: x,
    toStation: x,
    distance: ++x,
    frontsightAzimuth: ++x,
    backsightAzimuth: staggered ? x : ++x,
    frontsightInclination: ++x,
    backsightInclination: staggered ? x : ++x,
    left: ++x,
    right: ++x,
    up: ++x,
    down: ++x,
    notes: ++x,
  }

  const stationSx = {
    position: 'relative',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: spec.stationWidth,
    '&:not(:hover) > :nth-child(1)': {
      visibility: 'hidden',
    },
  } as const
  return (
    <Box
      sx={{
        ...sx,
        flexGrow: 1,
        flexShrink: 1,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'stretch',
      }}
    >
      {isSplit ? (
        <Split sx={stationSx}>
          <Tooltip title="Unsplit row" placement="right" disableInteractive>
            <Fab
              size="small"
              tabIndex={-1}
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                mt: -2,
                ml: -2,
                height: 32,
                width: 32,
                minHeight: 32,
              }}
              onClick={() => isSplitProps?.setValue(false)}
            >
              <ViewStream />
            </Fab>
          </Tooltip>
          <SurveyTextField
            x={xs.toStation}
            y={y}
            index={index}
            useFieldProps={useFieldProps?.to?.station}
          />
          <SurveyTextField
            x={xs.fromStation}
            y={y + 1}
            index={index}
            useFieldProps={useFieldProps?.from?.station}
          />
        </Split>
      ) : (
        <Box
          sx={{
            ...stationSx,
            display: 'flex',
          }}
        >
          {staggered ? (
            <Tooltip title="Split row" placement="right" disableInteractive>
              <Fab
                size="small"
                tabIndex={-1}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  mt: -2,
                  ml: -2,
                  height: 32,
                  width: 32,
                  minHeight: 32,
                }}
                onClick={() => isSplitProps?.setValue(true)}
              >
                <ViewStream />
              </Fab>
            </Tooltip>
          ) : (
            <span />
          )}
          <SurveyTextField
            x={xs.fromStation}
            y={y}
            h={staggered ? 2 : 1}
            index={stationIndex}
            useFieldProps={useFieldProps?.from?.station}
          />
        </Box>
      )}
      <Box
        sx={{
          position: 'relative',
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: spec.shotWidth,
          pointerEvents: 'none',
        }}
      >
        {includeShotFields && (
          <Box
            sx={{
              position: 'absolute',
              top: staggered ? '50%' : '0%',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'stretch',
              pointerEvents: 'all',
            }}
          >
            <SurveyTextField
              x={xs.distance}
              y={fsY}
              h={staggered ? 2 : 1}
              index={index}
              useFieldProps={useFieldProps?.distance}
              sx={{
                flexBasis: spec.distanceWidth ?? 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            />
            <Split
              sx={{
                flexBasis: spec.azimuthWidth ?? 0,
                flexGrow: 1,
                flexShrink: 1,
                flexDirection: staggered ? 'column' : 'row',
              }}
            >
              <AngleField
                x={xs.frontsightAzimuth}
                y={fsY}
                index={index}
                useFieldProps={useFieldProps?.frontsightAzimuth}
              />
              <AngleField
                x={xs.backsightAzimuth}
                y={bsY}
                index={index}
                useFieldProps={useFieldProps?.backsightAzimuth}
              />
            </Split>
            <Split
              sx={{
                flexBasis: spec.inclinationWidth ?? 0,
                flexGrow: 1,
                flexShrink: 1,
                flexDirection: staggered ? 'column' : 'row',
              }}
            >
              <AngleField
                x={xs.frontsightInclination}
                y={fsY}
                index={index}
                useFieldProps={useFieldProps?.frontsightInclination}
              />
              <AngleField
                x={xs.backsightInclination}
                y={bsY}
                index={index}
                useFieldProps={useFieldProps?.backsightInclination}
              />
            </Split>
          </Box>
        )}
      </Box>
      {spec.notes === 'afterInclination' ? (
        <SurveyTextField
          x={xs.notes}
          y={y}
          h={staggered ? 2 : 1}
          index={index}
          useFieldProps={useFieldProps?.notes}
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: '12%',
          }}
        />
      ) : undefined}
      <Box
        sx={{
          flexBasis: spec.lrudWidth ?? 0,
          flexGrow: 1,
          flexShrink: 1,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'stretch',
        }}
      >
        {lrudDirs.map((dir, lrudIndex) =>
          isSplit ? (
            <Split key={dir}>
              <SurveyTextField
                x={xs[lrudDirs[lrudIndex]]}
                y={y}
                index={index}
                useFieldProps={useFieldProps?.to?.[dir]}
                sx={{
                  flexBasis: spec.lrudWidths?.[dir] ?? 0,
                }}
              />
              <SurveyTextField
                x={xs[lrudDirs[lrudIndex]]}
                y={y + 1}
                index={index}
                useFieldProps={useFieldProps?.from?.[dir]}
                sx={{
                  flexBasis: spec.lrudWidths?.[dir] ?? 0,
                }}
              />
            </Split>
          ) : (
            <SurveyTextField
              x={xs[lrudDirs[lrudIndex]]}
              y={y}
              h={staggered ? 2 : 1}
              key={dir}
              index={stationIndex}
              useFieldProps={useFieldProps?.from?.[dir]}
              sx={{
                flexBasis: spec.lrudWidths?.[dir] ?? 0,
              }}
            />
          )
        )}
        {spec.notes === 'afterLrud' ? (
          <SurveyTextField
            x={xs.notes}
            y={y}
            h={staggered ? 2 : 1}
            index={index}
            useFieldProps={useFieldProps?.notes}
            sx={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: spec.notesWidth,
            }}
          />
        ) : undefined}
      </Box>
    </Box>
  )
}

function Split({ sx, children }: { sx?: SxProps; children?: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

const SurveyTextField = ({
  index,
  x,
  y,
  h = 1,
  useFieldProps,
  sx,
  inputProps,
  InputProps,
  ...props
}: React.ComponentProps<typeof TextField> & {
  index: number
  x: number
  y: number
  h?: number
  useFieldProps?: UseHtmlFieldProps
}) => {
  const { validationError, ...fieldProps } = useFieldProps?.(index) || {}

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      type Ref = [x: number, y: number, h?: number]
      let refs: Ref[] | undefined
      const input =
        event.target instanceof HTMLInputElement ? event.target : undefined
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          refs = [
            [x, y - 1, 1],
            [x, y - 2, 2],
          ]
          break
        case 'ArrowDown':
          event.preventDefault()
          refs = [[x, y + h]]
          break
        case 'ArrowLeft':
          refs =
            h === 2
              ? [
                  [x - 1, y + 1, 1],
                  [x - 1, y - 1, 2],
                  [x - 1, y],
                  [x - 1, y - 1],
                ]
              : [
                  [x - 1, y],
                  [x - 1, y - 1, 2],
                  [x - 1, y - 1],
                ]
          break
        case 'ArrowRight':
          if (input && input.selectionEnd === input.value?.length) {
            refs =
              h === 2
                ? [
                    [x + 1, y],
                    [x + 1, y + 1],
                    [x + 1, y - 1, 2],
                  ]
                : [
                    [x + 1, y],
                    [x + 1, y - 1, 2],
                  ]
          }
          break
      }
      const page = input?.closest(`[data-component="SurveyPageFields"]`)
      let otherInput: HTMLInputElement | undefined
      for (const [x, y, h] of refs || []) {
        const input = page?.querySelector(
          `[data-x="${x}"][data-y="${y}"]${h != null ? `[data-h="${h}"]` : ''}`
        )
        if (input instanceof HTMLInputElement) {
          otherInput = input
          break
        }
      }
      if (otherInput) {
        event.preventDefault()
        otherInput.focus()
        otherInput.select()
      }
    },
    [x, y, h]
  )

  return (
    <TextField
      {...fieldProps}
      {...props}
      error={validationError != null}
      onKeyDown={onKeyDown}
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '10%',
        backgroundColor: fieldProps?.value
          ? 'rgba(255, 255, 255, 0.8)'
          : 'none',
        '& input': {
          padding: '2px',
          textAlign: 'center',
        },
        ...sx,
      }}
      inputProps={{
        'data-x': x,
        'data-y': y,
        'data-h': h,
        ...inputProps,
      }}
      InputProps={{
        ...InputProps,
        sx: {
          borderRadius: 0,
          height: '100%',
          fontSize: '0.8rem',
          ...InputProps?.sx,
        },
        endAdornment: validationError ? (
          <InputAdornment
            position="end"
            sx={{
              ml: 0,
              mr: -1.5,
            }}
          >
            <Tooltip
              disableInteractive
              title={
                typeof validationError === 'string'
                  ? validationError.replace(/Warning:\s+/, '')
                  : validationError
              }
            >
              {typeof validationError === 'string' &&
              validationError.startsWith('Warning') ? (
                <Warning sx={{ color: 'orange', height: 16, width: 16 }} />
              ) : (
                <Error
                  sx={{
                    color: 'red',
                    height: 16,
                    width: 16,
                  }}
                />
              )}
            </Tooltip>
          </InputAdornment>
        ) : undefined,
      }}
    />
  )
}

const AngleField = ({
  sx,
  InputProps,
  ...props
}: React.ComponentProps<typeof SurveyTextField>) => {
  return (
    <SurveyTextField
      {...props}
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        ...sx,
      }}
      InputProps={{
        ...InputProps,
        sx: {
          height: '100%',
          ...InputProps?.sx,
        },
      }}
    />
  )
}
