import z from 'zod'

export const StationAndLruds = z.object({
  station: z.string().trim().optional(),
  left: z.number().nonnegative().finite().optional(),
  right: z.number().nonnegative().finite().optional(),
  up: z.number().nonnegative().finite().optional(),
  down: z.number().nonnegative().finite().optional(),
})

const Azimuth = z.number().min(0).lt(360).finite()
const Inclination = z.number().gte(-90).lte(90).finite()

export type Shot = z.output<typeof Shot>
export const Shot = z.object({
  from: StationAndLruds.optional(),
  to: StationAndLruds.optional(),
  isSplit: z.boolean().optional(),
  distance: z.number().positive().nonnegative().finite().optional(),
  frontsightAzimuth: Azimuth.optional(),
  backsightAzimuth: Azimuth.optional(),
  frontsightInclination: Inclination.optional(),
  backsightInclination: Inclination.optional(),
  notes: z.string().trim().optional(),
})

export type LayoutVariant = z.output<typeof LayoutVariant>
export const LayoutVariant = z.enum([
  'IMO',
  'Lech',
  'FromStaDisAzIncLrUd',
  'ToStaDisAzIncLrUd',
])

export type Point = z.output<typeof Point>
export const Point = z.object({
  x: z.number(),
  y: z.number(),
})

export type TableBounds = z.output<typeof TableBounds>

export const TableBounds = z.object({
  topLeft: Point,
  topRight: Point,
  bottomLeft: Point,
  bottomRight: Point,
})

export type Rect = {
  top: number
  left: number
  width: number
  height: number
}

export function rectToTableBounds({
  top,
  left,
  width,
  height,
}: Rect): TableBounds {
  return {
    topLeft: { x: left, y: top },
    topRight: { x: left + width, y: top },
    bottomLeft: { x: left, y: top + height },
    bottomRight: { x: left + width, y: top + height },
  }
}

export type Table = z.output<typeof Table>
export const Table = z.object({
  layoutVariant: LayoutVariant.optional(),
  bounds: TableBounds.optional(),
  shots: z.array(Shot.optional()).default([]),
})

export type Page = z.output<typeof Page>
export const Page = z.object({
  imageId: z.string().uuid(),
  tables: z.array(Table).default([]),
})

export type Values = z.output<typeof Values>
export const Values = z
  .object({
    outputFormat: z.enum(['FRCS', 'Compass', 'Walls']).optional(),
    backsightAzimuthCorrected: z.boolean().default(true).optional(),
    backsightInclinationCorrected: z.boolean().default(true).optional(),
    hideOverlay: z.boolean().optional(),
    pages: z.array(Page).default([]),
  })
  .superRefine((values, ctx) => {
    const { backsightAzimuthCorrected, backsightInclinationCorrected, pages } =
      values
    for (let p = 0; p < pages.length; p++) {
      const { tables } = pages[p]
      for (let t = 0; t < tables.length; t++) {
        const { shots } = tables[t]
        for (let s = 0; s < shots.length; s++) {
          const shot = shots[s]
          if (!shot) continue
          const { frontsightAzimuth, frontsightInclination } = shot
          let { backsightAzimuth, backsightInclination } = shot

          if (frontsightAzimuth != null && backsightAzimuth != null) {
            if (!backsightAzimuthCorrected)
              backsightAzimuth = (backsightAzimuth + 180) % 360
            let diff = Math.abs(frontsightAzimuth - backsightAzimuth)
            if (diff >= 180) diff = 360 - diff
            if (diff > 2) {
              const path = [...ctx.path, 'pages', p, 'tables', t, 'shots', s]

              ctx.addIssue({
                path: [...path, 'frontsightAzimuth'],
                code: z.ZodIssueCode.custom,
                message: 'must be within 2 degrees of backsight',
              })
              ctx.addIssue({
                path: [...path, 'backsightAzimuth'],
                code: z.ZodIssueCode.custom,
                message: 'must be within 2 degrees of frontsight',
              })
            }
          }
          if (frontsightInclination != null && backsightInclination != null) {
            if (!backsightInclinationCorrected)
              backsightInclination = -backsightInclination
            const diff = Math.abs(frontsightInclination - backsightInclination)
            if (diff > 2) {
              const path = [...ctx.path, 'pages', p, 'tables', t, 'shots', s]

              ctx.addIssue({
                path: [...path, 'frontsightInclination'],
                code: z.ZodIssueCode.custom,
                message: 'must be within 2 degrees of backsight',
              })
              ctx.addIssue({
                path: [...path, 'backsightInclination'],
                code: z.ZodIssueCode.custom,
                message: 'must be within 2 degrees of frontsight',
              })
            }
          }
        }
      }
    }
  })
