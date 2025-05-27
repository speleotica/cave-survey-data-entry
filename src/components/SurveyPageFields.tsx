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
  const nextSplit = useFieldProps?.isSplit?.(index + 1)?.value === true
  const stationIndex = layoutVariant === 'ToStaDisAzIncLrUd' ? index + 1 : index

  const stationSx = {
    position: 'relative',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: layoutVariant === 'Lech' ? '19%' : '16%',
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
            index={index}
            useFieldProps={useFieldProps?.to?.station}
            field="to.station"
            above={{
              field: 'from.station',
              index: index - 1,
            }}
            below={{ field: 'from.station', index }}
            right="distance"
          />
          <SurveyTextField
            index={index}
            useFieldProps={useFieldProps?.from?.station}
            field="from.station"
            below={{
              field: nextSplit ? 'to.station' : 'from.station',
              index: index + 1,
            }}
            above={{ field: 'to.station', index }}
            right="distance"
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
            index={stationIndex}
            useFieldProps={useFieldProps?.from?.station}
            field="from.station"
            above={{
              field: 'from.station',
              index: stationIndex - 1,
            }}
            below={{
              field: nextSplit ? 'to.station' : 'from.station',
              index: stationIndex + 1,
            }}
            right="distance"
          />
        </Box>
      )}
      <Box
        sx={{
          position: 'relative',
          flexGrow: 0,
          flexShrink: 0,
          flexBasis:
            layoutVariant === 'Lech' ? '37.5%' : isSimpleGrid ? '50%' : '40%',
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
              index={index}
              useFieldProps={useFieldProps?.distance}
              field="distance"
              left="from.station"
              right="frontsightAzimuth"
              sx={{
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            />
            <Split
              sx={{
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
                flexDirection: isSimpleGrid ? 'row' : 'column',
              }}
            >
              <AngleField
                index={index}
                field="frontsightAzimuth"
                useFieldProps={useFieldProps?.frontsightAzimuth}
                above={{ field: 'backsightAzimuth', index: index - 1 }}
                below={{ field: 'backsightAzimuth', index }}
                left="distance"
                right="frontsightInclination"
              />
              <AngleField
                index={index}
                field="backsightAzimuth"
                useFieldProps={useFieldProps?.backsightAzimuth}
                above={{ field: 'frontsightAzimuth', index }}
                below={{ field: 'frontsightAzimuth', index: index + 1 }}
                left="distance"
                right="backsightInclination"
              />
            </Split>
            <Split
              sx={{
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
                flexDirection: isSimpleGrid ? 'row' : 'column',
              }}
            >
              <AngleField
                index={index}
                field="frontsightInclination"
                useFieldProps={useFieldProps?.frontsightInclination}
                above={{ field: 'backsightInclination', index: index - 1 }}
                below={{ field: 'backsightInclination', index }}
                left="frontsightAzimuth"
                right="from.left"
              />
              <AngleField
                index={index}
                field="backsightInclination"
                useFieldProps={useFieldProps?.backsightInclination}
                above={{ field: 'frontsightInclination', index }}
                below={{ field: 'frontsightInclination', index: index + 1 }}
                left="backsightAzimuth"
                right={{
                  field: nextSplit ? 'to.left' : 'from.left',
                  index: index + 1,
                }}
              />
            </Split>
          </Box>
        )}
      </Box>
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
                index={index}
                field={`to.${dir}`}
                useFieldProps={useFieldProps?.to?.[dir]}
                above={{ field: `from.${dir}`, index: stationIndex - 1 }}
                below={{ field: `from.${dir}`, index: stationIndex }}
                left={
                  lrudIndex > 0
                    ? `to.${lrudDirs[lrudIndex - 1]}`
                    : { field: 'backsightInclination', index: stationIndex - 1 }
                }
                right={
                  lrudIndex < 3 ? `to.${lrudDirs[lrudIndex + 1]}` : 'notes'
                }
              />
              <SurveyTextField
                index={index}
                field={`from.${dir}`}
                useFieldProps={useFieldProps?.from?.[dir]}
                above={{ field: `to.${dir}`, index: stationIndex }}
                below={{
                  field: nextSplit ? `to.${dir}` : `from.${dir}`,
                  index: stationIndex + 1,
                }}
                left={
                  lrudIndex > 0
                    ? `from.${lrudDirs[lrudIndex - 1]}`
                    : 'frontsightInclination'
                }
                right={
                  lrudIndex < 3 ? `from.${lrudDirs[lrudIndex + 1]}` : 'notes'
                }
              />
            </Split>
          ) : (
            <SurveyTextField
              key={dir}
              index={stationIndex}
              field={`from.${dir}`}
              useFieldProps={useFieldProps?.from?.[dir]}
              above={{
                field: `from.${dir}`,
                index: stationIndex - 1,
              }}
              below={{
                field: nextSplit ? `to.${dir}` : `from.${dir}`,
                index: stationIndex + 1,
              }}
              left={
                lrudIndex > 0
                  ? `from.${lrudDirs[lrudIndex - 1]}`
                  : 'frontsightInclination'
              }
              right={
                lrudIndex < 3 ? `from.${lrudDirs[lrudIndex + 1]}` : 'notes'
              }
            />
          )
        )}
        {isSimpleGrid ? undefined : (
          <SurveyTextField
            index={index}
            field="notes"
            useFieldProps={useFieldProps?.notes}
            sx={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: layoutVariant === 'Lech' ? '43%' : '30%',
            }}
            left="from.down"
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

type FieldType =
  | 'from.station'
  | 'from.left'
  | 'from.right'
  | 'from.up'
  | 'from.down'
  | 'distance'
  | 'frontsightAzimuth'
  | 'backsightAzimuth'
  | 'frontsightInclination'
  | 'backsightInclination'
  | 'to.station'
  | 'to.left'
  | 'to.right'
  | 'to.up'
  | 'to.down'
  | 'notes'

type FieldReference =
  | FieldType
  | {
      field: FieldType
      index: number
    }

const SurveyTextField = ({
  field,
  index,
  above = { field, index: index - 1 },
  below = { field, index: index + 1 },
  left,
  right,
  useFieldProps,
  sx,
  inputProps,
  InputProps,
  ...props
}: React.ComponentProps<typeof TextField> & {
  field: FieldType
  above?: FieldReference
  below?: FieldReference
  left?: FieldReference
  right?: FieldReference
  index: number
  useFieldProps?: UseHtmlFieldProps
}) => {
  const { validationError, ...fieldProps } = useFieldProps?.(index) || {}

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      let ref: FieldReference | undefined
      const input =
        event.target instanceof HTMLInputElement ? event.target : undefined
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          ref = above
          break
        case 'ArrowDown':
          event.preventDefault()
          ref = below
          break
        case 'ArrowLeft':
          if (input?.selectionStart === 0) {
            ref = left
          }
          break
        case 'ArrowRight':
          if (input && input.selectionEnd === input.value?.length) {
            ref = right
          }
          break
      }
      const page = input?.closest(`[data-component="SurveyPageFields"]`)
      const otherInput =
        typeof ref === 'string'
          ? page?.querySelector(`[data-field="${ref}"][data-index="${index}"]`)
          : ref
          ? page?.querySelector(
              `[data-field="${ref.field}"][data-index="${ref.index}"]`
            )
          : undefined
      if (otherInput instanceof HTMLInputElement) {
        event.preventDefault()
        otherInput.focus()
        otherInput.select()
      }
    },
    [field, index]
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
        'data-field': field,
        'data-index': index,
        ...inputProps,
      }}
      InputProps={{
        ...InputProps,
        disableInjectingGlobalStyles: true,
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
