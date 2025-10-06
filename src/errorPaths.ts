import { z } from 'zod'

export const invalidTripHeaderFieldPath = z
  .tuple([z.literal('tripHeader'), z.string()])
  .transform(([, field]) => ({ field }))

export const invalidMeasurementPath = z
  .tuple([
    z.literal('pages'),
    z.number(),
    z.literal('tables'),
    z.number(),
    z.literal('shots'),
    z.number(),
    z.enum([
      'distance',
      'frontsightAzimuth',
      'backsightAzimuth',
      'frontsightInclination',
      'backsightInclination',
    ]),
  ])
  .transform(
    ([
      pages,
      pageIndex,
      tables,
      tableIndex,
      shots,
      shotIndex,
      measurement,
    ]) => ({
      pageIndex,
      tableIndex,
      shotIndex,
      measurement,
      shotPath: [pages, pageIndex, tables, tableIndex, shots, shotIndex],
      paths: {
        fromStationName: [
          pages,
          pageIndex,
          tables,
          tableIndex,
          shots,
          shotIndex,
          'from',
          'station',
        ],
        toStationName: [
          pages,
          pageIndex,
          tables,
          tableIndex,
          shots,
          shotIndex + 1,
          'from',
          'station',
        ],
        isSplit: [
          pages,
          pageIndex,
          tables,
          tableIndex,
          shots,
          shotIndex + 1,
          'isSplit',
        ],
        splitToStationName: [
          pages,
          pageIndex,
          tables,
          tableIndex,
          shots,
          shotIndex + 1,
          'to',
          'station',
        ],
      },
    })
  )

export const invalidLrudPath = z
  .tuple([
    z.literal('pages'),
    z.number(),
    z.literal('tables'),
    z.number(),
    z.literal('shots'),
    z.number(),
    z.enum(['from', 'to']),
    z.enum(['left', 'right', 'up', 'down']),
  ])
  .transform(
    ([
      pages,
      pageIndex,
      tables,
      tableIndex,
      shots,
      shotIndex,
      station,
      lrud,
    ]) => ({
      pageIndex,
      tableIndex,
      shotIndex,
      station,
      lrud,
      stationNamePath: [
        pages,
        pageIndex,
        tables,
        tableIndex,
        shots,
        shotIndex,
        station,
        'station',
      ],
    })
  )
