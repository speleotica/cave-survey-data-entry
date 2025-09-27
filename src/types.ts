import z from 'zod'
import { invertible } from 'zod-invertible'
import { tellMeWhen } from 'tell-me-when'
import { Angle, Unitize, UnitizedNumber } from '@speleotica/unitized'

export const StationAndLruds = z.object({
  station: z.string().trim().optional(),
  left: z.number().nonnegative().finite().optional(),
  right: z.number().nonnegative().finite().optional(),
  up: z.number().nonnegative().finite().optional(),
  down: z.number().nonnegative().finite().optional(),
})

const Azimuth = z.number().min(0).lt(360).finite()
const Inclination = z.number().gte(-90).lte(90).finite()

const Distance = invertible(
  z
    .string()
    .regex(
      /^\s*[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?\s*(\*\s*)?$/i,
      'invalid number'
    ),
  (s) =>
    /\s*\*\s*$/.test(s)
      ? ([
          parseFloat(s.replace(/\s*\*\s*$/, '')),
          { excluded: true },
        ] satisfies [number, { excluded: true }])
      : parseFloat(s),
  z.union([
    z.number().positive().finite(),
    z
      .tuple([z.number(), z.object({ excluded: z.literal(true) })])
      .refine((z) => z[0] > 0, 'Number must be greater than 0')
      .refine((z) => Number.isFinite(z[0]), 'Number must be finite'),
  ]),
  (d) => (typeof d === 'number' ? String(d) : `${d[0]} *`)
)

export function distanceValue(distance?: z.output<typeof Distance>) {
  return typeof distance === 'number' ? distance : distance?.[0]
}
export function isDistanceExcluded(distance?: z.output<typeof Distance>) {
  return Array.isArray(distance) ? distance[1].excluded : false
}

export type Shot = z.output<typeof Shot>
export const Shot = z.object({
  from: StationAndLruds.optional(),
  to: StationAndLruds.optional(),
  isSplit: z.boolean().optional(),
  distance: Distance.optional(),
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
  'X-38',
  'X-39',
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

export const LengthUnit = z.enum(['meters', 'feet'])

export const AngleUnit = z.enum(['degrees', 'gradians', 'mils'])

export const TellMeWhenDate = invertible(
  z.string().superRefine((s, ctx) => {
    try {
      tellMeWhen(s)
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }),
  (s) => {
    try {
      const parsed = tellMeWhen(s)
      if (Array.isArray(parsed)) return parsed[0]
      return parsed
    } catch (error) {
      return new Date(NaN)
    }
  },
  z.date(),
  (d) => d.toLocaleDateString()
)

export const TripHeader = z.object({
  cave: z.string().trim().optional(),
  name: z.string().trim().default(''),
  team: z.string().trim().default(''),
  date: TellMeWhenDate.optional(),
  distanceUnit: LengthUnit,
  angleUnit: AngleUnit,
  backsightAzimuthCorrected: z.boolean().default(true).optional(),
  backsightInclinationCorrected: z.boolean().default(true).optional(),
  frontsightBacksightTolerance: z.number().positive().default(2),
})

export type Values = z.output<typeof Values>
export const Values = z
  .object({
    outputFormat: z.enum(['FRCS', 'Compass', 'Walls']).optional(),
    tripHeader: TripHeader,
    hideHeader: z.boolean().optional(),
    hideOverlay: z.boolean().optional(),
    pages: z.array(Page).default([]),
  })
  .superRefine((values, ctx) => {
    const { tripHeader, pages } = values
    const {
      backsightAzimuthCorrected,
      backsightInclinationCorrected,
      frontsightBacksightTolerance,
    } = tripHeader
    const angleUnit =
      tripHeader.angleUnit === 'mils'
        ? Angle.milsNATO
        : Angle[tripHeader.angleUnit]
    const tolerance =
      frontsightBacksightTolerance != null
        ? new UnitizedNumber(frontsightBacksightTolerance, angleUnit)
        : Unitize.degrees(2)
    for (let p = 0; p < pages.length; p++) {
      const { tables } = pages[p]
      for (let t = 0; t < tables.length; t++) {
        const { shots } = tables[t]
        for (let s = 0; s < shots.length; s++) {
          const shot = shots[s]
          if (!shot) continue
          const { frontsightAzimuth, frontsightInclination } = shot
          const { backsightAzimuth, backsightInclination } = shot

          if (frontsightAzimuth != null && backsightAzimuth != null) {
            const fsUnits = new UnitizedNumber(frontsightAzimuth, angleUnit)
            let bsUnits = new UnitizedNumber(backsightAzimuth, angleUnit)
            if (!backsightAzimuthCorrected) bsUnits = Angle.opposite(bsUnits)
            let diff = fsUnits.sub(bsUnits).abs()
            if (diff.compare(Unitize.degrees(180)) >= 0)
              diff = Angle.opposite(diff)
            if (diff.compare(tolerance) > 0) {
              const path = [...ctx.path, 'pages', p, 'tables', t, 'shots', s]

              ctx.addIssue({
                path: [...path, 'frontsightAzimuth'],
                code: z.ZodIssueCode.custom,
                message: `must be within ${tolerance.toString()} of backsight`,
              })
              ctx.addIssue({
                path: [...path, 'backsightAzimuth'],
                code: z.ZodIssueCode.custom,
                message: `must be within ${tolerance.toString()} of frontsight`,
              })
            }
          }
          if (frontsightInclination != null && backsightInclination != null) {
            const fsUnits = new UnitizedNumber(frontsightInclination, angleUnit)
            let bsUnits = new UnitizedNumber(backsightInclination, angleUnit)
            if (!backsightInclinationCorrected) bsUnits = bsUnits.negate()
            const diff = fsUnits.sub(bsUnits).abs()
            if (diff.compare(tolerance) > 0) {
              const path = [...ctx.path, 'pages', p, 'tables', t, 'shots', s]

              ctx.addIssue({
                path: [...path, 'frontsightInclination'],
                code: z.ZodIssueCode.custom,
                message: `must be within ${tolerance.toString()} of backsight`,
              })
              ctx.addIssue({
                path: [...path, 'backsightInclination'],
                code: z.ZodIssueCode.custom,
                message: `must be within ${tolerance.toString()} of frontsight`,
              })
            }
          }
        }
      }
    }
  })
