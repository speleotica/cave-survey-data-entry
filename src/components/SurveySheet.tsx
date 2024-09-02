import * as React from 'react'
import Box from '@mui/material/Box'
import { SurveyPageFields } from './SurveyPageFields'
import { Page, Shot } from '../types'
import { Fab, MenuItem } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { HomographyBox } from './HomographyBox'
import { HomographyControlPoints } from './HomographyControlPoints'
import { FieldPath, useField, useHtmlField } from '@jcoreio/zod-forms'
import { FormTextField } from './FormTextField'
import { useQuery } from '@tanstack/react-query'
import { createIdb } from '@/idb/idb'

export function SurveySheet({ field }: { field: FieldPath<typeof Page> }) {
  const tableField = field.get('tables[0]')

  const { value: imageId } = useField(field.get('imageId'))

  const imgQuery = useQuery({
    queryKey: ['pageImages', imageId],
    queryFn: async () => {
      if (!imageId) return null
      const img = await (await createIdb()).get('pageImages', imageId)
      if (!img) return null
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(img)
        reader.onload = () => {
          if (typeof reader.result === 'string') resolve(reader.result)
        }
        reader.onerror = reject
      })
    },
  })

  const { value: bounds, setValue: setBounds } = useField(
    tableField.get('bounds')
  )

  const { value: layoutVariant = 'IMO' } = useField(
    tableField.get('layoutVariant')
  )

  const useFieldPropsMap = React.useMemo(() => {
    const useFieldProps =
      (
        subfield: (
          field: FieldPath<typeof Shot>
        ) => React.ComponentProps<typeof FormTextField>['field']
      ) =>
      (index: number) => {
        const {
          input,
          meta: { error },
        } = useHtmlField({
          field: subfield(tableField.get(['shots', index])),
          type: 'text',
        })
        return {
          ...input,
          ...(error ? { validationError: error } : {}),
        }
      }

    return {
      from: {
        station: useFieldProps((field) => field.get('from.station')),
        left: useFieldProps((field) => field.get('from.left')),
        right: useFieldProps((field) => field.get('from.right')),
        up: useFieldProps((field) => field.get('from.up')),
        down: useFieldProps((field) => field.get('from.down')),
      },
      to: {
        station: useFieldProps((field) => field.get('to.station')),
        left: useFieldProps((field) => field.get('to.left')),
        right: useFieldProps((field) => field.get('to.right')),
        up: useFieldProps((field) => field.get('to.up')),
        down: useFieldProps((field) => field.get('to.down')),
      },
      isSplit: useFieldProps((field) => field.get('isSplit')),
      distance: useFieldProps((field) => field.get('distance')),
      frontsightAzimuth: useFieldProps((field) =>
        field.get('frontsightAzimuth')
      ),
      backsightAzimuth: useFieldProps((field) => field.get('backsightAzimuth')),
      frontsightInclination: useFieldProps((field) =>
        field.get('frontsightInclination')
      ),
      backsightInclination: useFieldProps((field) =>
        field.get('backsightInclination')
      ),
      notes: useFieldProps((field) => field.get('notes')),
    }
  }, [tableField])

  if (!bounds) return null

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ userSelect: 'none' }}>
        <img src={imgQuery.data ?? undefined} alt="survey sheet" height={800} />
      </Box>
      <HomographyBox
        width={420}
        height={600}
        bounds={bounds}
        sx={{ border: '1px solid red' }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -64,
            left: 0,
            display: 'flex',
            gap: 2,
          }}
        >
          <FormTextField
            variant="filled"
            type="text"
            field={tableField.get('layoutVariant')}
            select
            label="Layout"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <MenuItem value="IMO">Inner Mountain Outfitters</MenuItem>
            <MenuItem value="Lech">Lechuguilla</MenuItem>
            <MenuItem value="FromStaDisAzIncLrUd">
              From Sta | Dist | Az F/B | Inc F/B | L R | U D
            </MenuItem>
            <MenuItem value="ToStaDisAzIncLrUd">
              To Sta | Dist | Az F/B | Inc F/B | L R | U D
            </MenuItem>
          </FormTextField>
          <Fab>
            <Delete />
          </Fab>
        </Box>
        <SurveyPageFields
          layoutVariant={layoutVariant}
          useFieldProps={useFieldPropsMap}
        />
      </HomographyBox>
      <HomographyControlPoints bounds={bounds} onResize={setBounds} />
    </Box>
  )
}
