import { Box } from '@mui/material'
import React from 'react'
import { SurveySheet } from './SurveySheet'
import { form } from '../form'
import { useIdb } from './IdbContext'
import { rectToTableBounds } from '../types'
import * as uuid from 'uuid'

export function SurveySheetsField() {
  const { elements, push, remove } = form.useArrayField('pages')

  const idb = useIdb()
  const handleDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])
  const handleDrop = React.useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault()
      const { files } = event.dataTransfer
      for (const file of files) {
        const imageId = uuid.v1()
        await idb.add('pageImages', file, imageId)
        push({
          imageId,
          tables: [
            {
              layoutVariant: 'IMO',
              bounds: rectToTableBounds({
                top: 113,
                left: 15,
                width: 520,
                height: 632,
              }),
            },
          ],
        })
      }
    },
    [push]
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        overflow: 'scroll',
        flexGrow: 1,
        flexShrink: 1,
        alignSelf: 'stretch',
        minHeight: 0,
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {elements.map((field, index) => (
        <SurveySheet key={index} field={field} onDelete={() => remove(index)} />
      ))}
      {!elements.length ? (
        <Box
          sx={{
            height: 200,
            textAlign: 'center',
            my: 10,
            alignSelf: 'stretch',
            color: 'gray',
          }}
        >
          Drop images here
        </Box>
      ) : undefined}
    </Box>
  )
}
