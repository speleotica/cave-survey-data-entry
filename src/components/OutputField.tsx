import * as React from 'react'
import { TextField } from '@mui/material'
import asyncThrottle from '@jcoreio/async-throttle'
import { generateFrcsOutput } from '../util/generateFrcsOutput'
import { Values } from '../types'
import {
  invalidLrudPath,
  invalidMeasurementPath,
  invalidTripHeaderFieldPath,
} from '../errorPaths'
import { form } from '../form'
import { generateCompassOutput } from '@/util/generateCompassOutput'
import { generateWallsOutput } from '@/util/generateWallsOutput'
import { z } from 'zod'
import { DeepPartial } from '@jcoreio/zod-forms/util/DeepPartial'
import startCase from 'lodash/startCase'
import get from 'lodash/get'

export function OutputField(props: React.ComponentProps<typeof TextField>) {
  const { value: values } = form.useField([])
  const [value, setValue] = React.useState('')
  const [error, setError] = React.useState<unknown>(undefined)

  const handleChange = React.useMemo(
    () =>
      asyncThrottle(async (raw: typeof values) => {
        const parsed = Values.safeParse(raw)
        if (!parsed.success) {
          setError(parsed.error)
          return
        }
        const values = parsed.data
        try {
          const output =
            values.outputFormat === 'FRCS'
              ? await generateFrcsOutput(values)
              : values.outputFormat === 'Compass'
              ? await generateCompassOutput(values)
              : values.outputFormat === 'Walls'
              ? await generateWallsOutput(values)
              : ''

          setTimeout(() => {
            setValue(output)
            setError(undefined)
          }, 0)
        } catch (error) {
          setError(error)
        }
      }, 500),
    []
  )

  React.useEffect(() => {
    handleChange(values)
  }, [values])

  return (
    <>
      <TextField
        multiline
        value={error != null ? formatError(error, values) : value}
        InputProps={{ readOnly: true, sx: { fontFamily: 'monospace' } }}
        error={error != null}
        {...props}
      />
    </>
  )
}

function formatError(
  error: unknown,
  values?: DeepPartial<z.input<typeof Values>>
): string {
  if (error instanceof z.ZodError) {
    return (
      'The following fields are invalid:\n' +
      error.issues
        .map((issue) => {
          {
            const parsed = invalidTripHeaderFieldPath.safeParse(issue.path)
            if (parsed.success) {
              const { field } = parsed.data
              return `Invalid ${startCase(field)}`
            }
          }
          {
            const parsed = invalidLrudPath.safeParse(issue.path)
            if (parsed.success) {
              const { pageIndex, shotIndex, lrud, stationNamePath } =
                parsed.data
              const stationName = get(values, stationNamePath)
              return `Invalid ${startCase(lrud)}${
                typeof stationName === 'string'
                  ? ` at station ${stationName}`
                  : ` at station ${shotIndex + 1}`
              } (Page ${pageIndex + 1})`
            }
          }
          {
            const parsed = invalidMeasurementPath.safeParse(issue.path)
            if (parsed.success) {
              const { pageIndex, shotIndex, measurement, paths } = parsed.data
              const fromStationName = get(values, paths.fromStationName)
              const toStationName =
                get(values, paths.isSplit) === true
                  ? get(values, paths.splitToStationName)
                  : get(values, paths.toStationName)
              return `Invalid ${startCase(measurement)}${
                typeof fromStationName === 'string' ||
                typeof toStationName === 'string'
                  ? ` from station ${fromStationName || '<blank>'} to ${
                      toStationName || '<blank>'
                    }`
                  : ` in shot ${shotIndex + 1}`
              } (Page ${pageIndex + 1})`
            }
          }
          return `${issue.message} (at ${issue.path.join(', ')})`
        })
        .map((issue) => `- ${issue}`)
        .join('\n')
    )
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
