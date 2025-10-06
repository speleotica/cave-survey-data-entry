import * as React from 'react'
import Box from '@mui/material/Box'
import { SurveyDataFields } from './SurveyDataFields'
import { Page, Shot } from '../types'
import { Fab } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { HomographyBox } from './HomographyBox'
import { HomographyControlPoints } from './HomographyControlPoints'
import { FieldPath, useField, useHtmlField } from '@jcoreio/zod-forms'
import { FormTextField } from './FormTextField'
import { useQuery } from '@tanstack/react-query'
import { createIdb } from '@/idb/idb'
import z from 'zod'
import { form } from '@/form'
import { SurveyPageLayoutField } from './SurveyPageLayoutField'

export function SurveyPage({
  field,
  onDelete,
}: {
  field: FieldPath<typeof Page>
  onDelete?: () => unknown
}) {
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

  const { parsedValue: bounds, setValue: setBounds } = useField(
    tableField.get('bounds')
  )

  const { value: layoutVariant = 'IMO' } = useField(
    tableField.get('layoutVariant')
  )

  const useFieldPropsMap = React.useMemo(() => {
    const useHtmlFieldProps =
      (
        subfield: (
          field: FieldPath<z.ZodOptional<typeof Shot>>
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

    const useFieldProps =
      <V extends FieldPath>(
        subfield: (field: FieldPath<z.ZodOptional<typeof Shot>>) => V
      ) =>
      (index: number) => {
        return useField(subfield(tableField.get(['shots', index])))
      }

    return {
      from: {
        station: useHtmlFieldProps((field) => field.get('from.station')),
        left: useHtmlFieldProps((field) => field.get('from.left')),
        right: useHtmlFieldProps((field) => field.get('from.right')),
        up: useHtmlFieldProps((field) => field.get('from.up')),
        down: useHtmlFieldProps((field) => field.get('from.down')),
      },
      to: {
        station: useHtmlFieldProps((field) => field.get('to.station')),
        left: useHtmlFieldProps((field) => field.get('to.left')),
        right: useHtmlFieldProps((field) => field.get('to.right')),
        up: useHtmlFieldProps((field) => field.get('to.up')),
        down: useHtmlFieldProps((field) => field.get('to.down')),
      },
      isSplit: useFieldProps((field) => field.get('isSplit')),
      distance: useHtmlFieldProps((field) => field.get('distance')),
      frontsightAzimuth: useHtmlFieldProps((field) =>
        field.get('frontsightAzimuth')
      ),
      backsightAzimuth: useHtmlFieldProps((field) =>
        field.get('backsightAzimuth')
      ),
      frontsightInclination: useHtmlFieldProps((field) =>
        field.get('frontsightInclination')
      ),
      backsightInclination: useHtmlFieldProps((field) =>
        field.get('backsightInclination')
      ),
      notes: useHtmlFieldProps((field) => field.get('notes')),
    }
  }, [tableField])

  if (!bounds) return null

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ userSelect: 'none' }}>
        <img src={imgQuery.data ?? undefined} alt="survey sheet" height={800} />
      </Box>
      <HideOverlay>
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
            <SurveyPageLayoutField field={tableField.get('layoutVariant')} />
            <Fab onClick={onDelete}>
              <Delete />
            </Fab>
          </Box>
          <SurveyDataFields
            layoutVariant={layoutVariant}
            useFieldProps={useFieldPropsMap}
          />
        </HomographyBox>
        <HomographyControlPoints bounds={bounds} onResize={setBounds} />
      </HideOverlay>
    </Box>
  )
}

function HideOverlay({ children }: { children: React.ReactNode }) {
  const { value: hideOverlay } = form.useField('hideOverlay')

  return <div style={{ opacity: hideOverlay ? 0 : 1 }}>{children}</div>
}
