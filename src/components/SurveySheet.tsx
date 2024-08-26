import * as React from 'react'
import Box from '@mui/material/Box'
import { SurveyPageFields } from './SurveyPageFields'
import { Values, rectToTableBounds, tableBoundsToRect } from './types'
import { UseFieldConfig, useField } from 'react-final-form'
import { ResizableRect } from './ResizableRect'
import { Fab, MenuItem, TextField } from '@mui/material'
import { parseNumber } from './parseNumber'
import { Delete } from '@mui/icons-material'

const useFieldProps =
  (
    subfield: string,
    config?: UseFieldConfig<any> | ((index: number) => UseFieldConfig<any>)
  ) =>
  (index: number) => {
    const {
      input,
      meta: { error },
    } = useField(
      `shots[${index}].${subfield}`,
      React.useMemo(
        () => (typeof config === 'function' ? config(index) : config),
        [index]
      )
    )
    return {
      ...input,
      ...(error ? { validationError: error } : {}),
    }
  }

function validateNonnegativeNumber(value: any): string | undefined {
  const parsed = parseNumber(value)
  if (parsed == null) {
    return /\S/.test(value || '') ? 'invalid number' : undefined
  }
  if (parsed < 0) return 'must be >= 0'
}

function validateDistance(value: any): string | undefined {
  if (typeof value === 'string') value = value.replace(/\s*\*\s*$/, '')
  const parsed = parseNumber(value)
  if (parsed == null) {
    return /\S/.test(value || '') ? 'invalid distance' : undefined
  }
  if (parsed < 0) return 'must be >= 0'
}

function validateAzimuth(value: any): string | undefined {
  const parsed = parseNumber(value)
  if (parsed == null) {
    return /\S/.test(value || '') ? 'invalid azimuth' : undefined
  }
  if (parsed < 0 || parsed >= 360) return 'must be >= 0 and < 360'
}
function validateInclination(value: any): string | undefined {
  const parsed = parseNumber(value)
  if (parsed == null) {
    return /\S/.test(value || '') ? 'invalid inclination' : undefined
  }
  if (parsed < -90 || parsed > 90) return 'must be >= 90 and <= 90'
}

const useLrudFieldProps = (name: string) =>
  useFieldProps(name, {
    validateFields: [],
    validate: (value) => {
      return validateNonnegativeNumber(value)
    },
  })

const useFieldPropsMap = {
  from: {
    station: useFieldProps('from.station'),
    left: useLrudFieldProps('from.left'),
    right: useLrudFieldProps('from.right'),
    up: useLrudFieldProps('from.up'),
    down: useLrudFieldProps('from.down'),
  },
  to: {
    station: useFieldProps('to.station'),
    left: useLrudFieldProps('to.left'),
    right: useLrudFieldProps('to.right'),
    up: useLrudFieldProps('to.up'),
    down: useLrudFieldProps('to.down'),
  },
  isSplit: useFieldProps('isSplit'),
  distance: useFieldProps('distance', {
    validateFields: [],
    validate: (value) => {
      return validateDistance(value)
    },
  }),
  frontsightAzimuth: useFieldProps('frontsightAzimuth', (index: number) => ({
    validateFields: [
      `shots[${index}].backsightAzimuth`,
      'backsightAzimuthCorrected',
    ],
    validate: (value, allValues: Values) => {
      const v1 = validateAzimuth(value)
      if (v1) return v1
      const fsValue = parseNumber(value)
      let bsValue = parseNumber(allValues.shots?.[index]?.backsightAzimuth)
      if (fsValue == null || bsValue == null) return
      if (!allValues.backsightAzimuthCorrected) {
        bsValue = (bsValue + 180) % 360
      }
      let diff = Math.abs(fsValue - bsValue)
      if (diff > 180) diff = 360 - diff
      if (diff > 2) {
        return `frontsight and backsight differ by ${diff.toFixed(1)} degrees`
      }
    },
  })),
  backsightAzimuth: useFieldProps('backsightAzimuth', (index: number) => ({
    validateFields: [
      `shots[${index}].frontsightAzimuth`,
      'backsightAzimuthCorrected',
    ],
    validate: (value, allValues: Values) => {
      const v1 = validateAzimuth(value)
      if (v1) return v1
      let bsValue = parseNumber(value)
      const fsValue = parseNumber(allValues.shots?.[index]?.frontsightAzimuth)
      if (fsValue == null || bsValue == null) return
      if (!allValues.backsightAzimuthCorrected) {
        bsValue = (bsValue + 180) % 360
      }
      let diff = Math.abs(fsValue - bsValue)
      if (diff > 180) diff = 360 - diff
      if (diff > 2) {
        return `frontsight and backsight differ by ${diff.toFixed(1)} degrees`
      }
    },
  })),
  frontsightInclination: useFieldProps(
    'frontsightInclination',
    (index: number) => ({
      validateFields: [
        `shots[${index}].backsightInclination`,
        'backsightInclinationCorrected',
      ],
      validate: (value, allValues: Values) => {
        const v1 = validateInclination(value)
        if (v1) return v1
        const fsValue = parseNumber(value)
        let bsValue = parseNumber(
          allValues.shots?.[index]?.backsightInclination
        )
        if (fsValue == null || bsValue == null) return
        if (!allValues.backsightInclinationCorrected) bsValue = -bsValue
        const diff = Math.abs(fsValue - bsValue)
        if (diff > 2) {
          return `frontsight and backsight differ by ${diff.toFixed(1)} degrees`
        }
      },
    })
  ),
  backsightInclination: useFieldProps(
    'backsightInclination',
    (index: number) => ({
      validateFields: [`shots[${index}].frontsightInclination`],
      validate: (value, allValues: Values) => {
        const v1 = validateInclination(value)
        if (v1) return v1
        let bsValue = parseNumber(value)
        const fsValue = parseNumber(
          allValues.shots?.[index]?.frontsightInclination
        )
        if (fsValue == null || bsValue == null) return
        if (!allValues.backsightInclinationCorrected) bsValue = -bsValue
        const diff = Math.abs(fsValue - bsValue)
        if (diff > 2) {
          return `frontsight and backsight differ by ${diff.toFixed(1)} degrees`
        }
      },
    })
  ),
  notes: useFieldProps('notes'),
}

const defaultTable = {
  layoutVariant: 'IMO',
  bounds: rectToTableBounds({
    top: 113,
    left: 15,
    width: 520,
    height: 632,
  }),
}

export function SurveySheet({ pageIndex = 0 }: { pageIndex?: number }) {
  const {
    input: { value: pageImage },
  } = useField(`pageImages[${pageIndex}]`)
  const {
    input: { value: table = defaultTable, onChange: setTable },
  } = useField(`tables[${pageIndex}]`)

  const {
    layoutVariant = defaultTable?.layoutVariant,
    bounds = defaultTable?.bounds,
  } = table

  const rectBounds = React.useMemo(() => tableBoundsToRect(bounds), [bounds])

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ userSelect: 'none' }}>
        <img src={pageImage.data} alt="survey sheet" height={800} />
      </Box>
      <Box
        sx={{
          ...rectBounds,
          position: 'absolute',
        }}
      >
        <SurveyPageFields
          layoutVariant={layoutVariant}
          useFieldProps={useFieldPropsMap}
          startIndex={pageIndex * 11}
        />
      </Box>
      <ResizableRect
        bounds={rectBounds}
        onResize={(bounds) =>
          setTable({ ...table, bounds: rectToTableBounds(bounds) })
        }
      />
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          position: 'absolute',
          top: rectBounds.top - 60,
          left: rectBounds.left,
          display: 'flex',
          gap: 2,
        }}
      >
        <TextField
          value={layoutVariant}
          variant="filled"
          onChange={(e) =>
            setTable({ ...table, layoutVariant: e.target.value as any })
          }
          select
          label="Layout"
        >
          <MenuItem value="IMO">Inner Mountain Outfitters</MenuItem>
          <MenuItem value="Lech">Lechuguilla</MenuItem>
        </TextField>
        <Fab>
          <Delete />
        </Fab>
      </Box>
    </Box>
  )
}
