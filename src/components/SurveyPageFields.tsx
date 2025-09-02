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
import { ViewStream, Error } from '@mui/icons-material'
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
  const numRows =
    layoutVariant === 'FromStaDisAzIncLrUd' ||
    layoutVariant === 'ToStaDisAzIncLrUd'
      ? 26
      : layoutVariant === 'X-39'
      ? 10
      : 11
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
  const isSimpleGrid =
    layoutVariant === 'FromStaDisAzIncLrUd' ||
    layoutVariant === 'ToStaDisAzIncLrUd'
  const isSplit = isSimpleGrid ? false : isSplitProps?.value === true
  const stationIndex = layoutVariant === 'ToStaDisAzIncLrUd' ? index + 1 : index

  let x = 0
  const y = isSimpleGrid ? index : index * 2
  const fsY = isSimpleGrid ? y : y + 1
  const bsY = isSimpleGrid ? y : y + 2
  const xs = {
    fromStation: x,
    toStation: x,
    distance: ++x,
    frontsightAzimuth: ++x,
    backsightAzimuth: isSimpleGrid ? ++x : x,
    frontsightInclination: ++x,
    backsightInclination: isSimpleGrid ? ++x : x,
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
    flexBasis:
      layoutVariant === 'Lech'
        ? '19%'
        : layoutVariant === 'X-39'
        ? '18%'
        : '16%',
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
          <Tooltip title="Unsplit row" placement="right">
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
          {isSimpleGrid ? (
            <span />
          ) : (
            <Tooltip title="Split row" placement="right">
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
          )}
          <SurveyTextField
            x={xs.fromStation}
            y={y}
            h={isSimpleGrid ? 1 : 2}
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
          flexBasis:
            layoutVariant === 'Lech'
              ? '37.5%'
              : layoutVariant === 'X-39'
              ? '39%'
              : isSimpleGrid
              ? '50%'
              : '40%',
          pointerEvents: 'none',
        }}
      >
        {includeShotFields && (
          <Box
            sx={{
              position: 'absolute',
              top: isSimpleGrid ? '0%' : '50%',
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
              h={isSimpleGrid ? 1 : 2}
              index={index}
              useFieldProps={useFieldProps?.distance}
              sx={{
                flexBasis: layoutVariant === 'X-39' ? '40%' : 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            />
            <Split
              sx={{
                flexBasis: layoutVariant === 'X-39' ? '30%' : 0,
                flexGrow: 1,
                flexShrink: 1,
                flexDirection: isSimpleGrid ? 'row' : 'column',
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
                flexBasis: layoutVariant === 'X-39' ? '30%' : 0,
                flexGrow: 1,
                flexShrink: 1,
                flexDirection: isSimpleGrid ? 'row' : 'column',
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
      {layoutVariant === 'X-39' ? (
        <SurveyTextField
          x={xs.notes}
          y={y}
          h={isSimpleGrid ? 1 : 2}
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
          flexBasis: 0,
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
              />
              <SurveyTextField
                x={xs[lrudDirs[lrudIndex]]}
                y={y + 1}
                index={index}
                useFieldProps={useFieldProps?.from?.[dir]}
              />
            </Split>
          ) : (
            <SurveyTextField
              x={xs[lrudDirs[lrudIndex]]}
              y={y}
              h={isSimpleGrid ? 1 : 2}
              key={dir}
              index={stationIndex}
              useFieldProps={useFieldProps?.from?.[dir]}
            />
          )
        )}
        {isSimpleGrid || layoutVariant === 'X-39' ? undefined : (
          <SurveyTextField
            x={xs.notes}
            y={y}
            h={isSimpleGrid ? 1 : 2}
            index={index}
            useFieldProps={useFieldProps?.notes}
            sx={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: layoutVariant === 'Lech' ? '43%' : '30%',
            }}
          />
        )}
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
          <InputAdornment position="end" sx={{ mr: -1.5 }}>
            <Tooltip title={validationError}>
              <Error sx={{ color: 'red', height: 16, width: 16 }} />
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
