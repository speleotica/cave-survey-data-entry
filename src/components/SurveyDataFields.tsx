import { Box, Fab, SxProps, TextField, Tooltip } from '@mui/material'
import * as React from 'react'
import { LayoutVariant } from '../types'
import { ViewStream } from '@mui/icons-material'
import {
  UseFieldProps as _UseFieldProps,
  FieldPathForValue,
} from '@jcoreio/zod-forms'
import { SurveyDataTextField } from './SurveyDataTextField'
import { SurveyPageLayoutDefs } from './SurveyPageLayoutDefs'

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

export const SurveyDataFields = React.memo(function SurveyDataFields({
  useFieldProps,
  layoutVariant = 'IMO',
}: {
  useFieldProps?: UseFieldPropsMap
  layoutVariant?: LayoutVariant
}) {
  const numRows = SurveyPageLayoutDefs[layoutVariant].numRows
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
  const def = SurveyPageLayoutDefs[layoutVariant]
  const { staggered } = def
  const isSplit = staggered ? isSplitProps?.value === true : false
  const stationIndex = def.staggered || def.station !== 'to' ? index : index + 1

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
    flexBasis: def.stationWidth,
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
          <SurveyDataTextField
            x={xs.toStation}
            y={y}
            index={index}
            useFieldProps={useFieldProps?.to?.station}
          />
          <SurveyDataTextField
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
          <SurveyDataTextField
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
          flexBasis: def.shotWidth,
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
            <SurveyDataTextField
              x={xs.distance}
              y={fsY}
              h={staggered ? 2 : 1}
              index={index}
              useFieldProps={useFieldProps?.distance}
              sx={{
                flexBasis: def.distanceWidth ?? 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            />
            <Split
              sx={{
                flexBasis: def.azimuthWidth ?? 0,
                flexGrow: 1,
                flexShrink: 1,
                flexDirection: staggered ? 'column' : 'row',
              }}
            >
              <SurveyDataTextField
                x={xs.frontsightAzimuth}
                y={fsY}
                index={index}
                useFieldProps={useFieldProps?.frontsightAzimuth}
              />
              <SurveyDataTextField
                x={xs.backsightAzimuth}
                y={bsY}
                index={index}
                useFieldProps={useFieldProps?.backsightAzimuth}
              />
            </Split>
            <Split
              sx={{
                flexBasis: def.inclinationWidth ?? 0,
                flexGrow: 1,
                flexShrink: 1,
                flexDirection: staggered ? 'column' : 'row',
              }}
            >
              <SurveyDataTextField
                x={xs.frontsightInclination}
                y={fsY}
                index={index}
                useFieldProps={useFieldProps?.frontsightInclination}
              />
              <SurveyDataTextField
                x={xs.backsightInclination}
                y={bsY}
                index={index}
                useFieldProps={useFieldProps?.backsightInclination}
              />
            </Split>
          </Box>
        )}
      </Box>
      {def.notes === 'afterInclination' ? (
        <SurveyDataTextField
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
          flexBasis: def.lrudWidth ?? 0,
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
              <SurveyDataTextField
                x={xs[lrudDirs[lrudIndex]]}
                y={y}
                index={index}
                useFieldProps={useFieldProps?.to?.[dir]}
                sx={{
                  flexBasis: def.lrudWidths?.[dir] ?? 0,
                }}
              />
              <SurveyDataTextField
                x={xs[lrudDirs[lrudIndex]]}
                y={y + 1}
                index={index}
                useFieldProps={useFieldProps?.from?.[dir]}
                sx={{
                  flexBasis: def.lrudWidths?.[dir] ?? 0,
                }}
              />
            </Split>
          ) : (
            <SurveyDataTextField
              x={xs[lrudDirs[lrudIndex]]}
              y={y}
              h={staggered ? 2 : 1}
              key={dir}
              index={stationIndex}
              useFieldProps={useFieldProps?.from?.[dir]}
              sx={{
                flexBasis: def.lrudWidths?.[dir] ?? 0,
              }}
            />
          )
        )}
        {def.notes === 'afterLrud' ? (
          <SurveyDataTextField
            x={xs.notes}
            y={y}
            h={staggered ? 2 : 1}
            index={index}
            useFieldProps={useFieldProps?.notes}
            sx={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: def.notesWidth,
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
