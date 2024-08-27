import z from 'zod'

export const StationAndLruds = z.object({
  station: z.string().optional(),
  left: z.string().optional(),
  right: z.string().optional(),
  up: z.string().optional(),
  down: z.string().optional(),
})

export type Shot = z.output<typeof Shot>
export const Shot = z.object({
  from: StationAndLruds.optional(),
  to: StationAndLruds.optional(),
  isSplit: z.boolean().optional(),
  distance: z.string().optional(),
  frontsightAzimuth: z.string().optional(),
  backsightAzimuth: z.string().optional(),
  frontsightInclination: z.string().optional(),
  backsightInclination: z.string().optional(),
  notes: z.string().optional(),
})

export type LayoutVariant = z.output<typeof LayoutVariant>
export const LayoutVariant = z.enum([
  'IMO',
  'Lech',
  'FromStaDisAzIncLrUd',
  'ToStaDisAzIncLrUd',
])

export type PageImage = z.output<typeof PageImage>
export const PageImage = z.object({
  /**
   * The mime type
   */
  type: z.string(),
  /**
   * The base-64 encoded data
   */
  data: z.string(),
})

export const Point = z.object({
  x: z.number(),
  y: z.number(),
})

export type TableBounds = z.output<typeof TableBounds>
/**
 * The state is modeled as all four corners of the table in case
 * I decided to support perspective distortion in the future.
 * In practice the rectangle edges can only be vertical and horizontal
 * right now.
 */
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

export function tableBoundsToRect({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: TableBounds): Rect {
  if (
    topLeft.x !== bottomLeft.x ||
    topLeft.y !== topRight.y ||
    topRight.x !== bottomRight.x ||
    bottomRight.y !== bottomLeft.y
  ) {
    throw new Error(`bounds are non-rectilinear, not supported yet`)
  }
  return {
    top: topLeft.y,
    left: topLeft.x,
    width: topRight.x - topLeft.x,
    height: bottomLeft.y - topLeft.y,
  }
}

export const Table = z.object({
  layoutVariant: LayoutVariant.optional(),
  bounds: TableBounds.optional(),
})

export type Values = z.output<typeof Values>
export const Values = z.object({
  backsightAzimuthCorrected: z.boolean().default(true).optional(),
  backsightInclinationCorrected: z.boolean().default(true).optional(),
  pageImages: z
    .array(PageImage.nullish().transform((e) => e ?? undefined))
    .optional(),
  tables: z.array(Table.nullish().transform((e) => e ?? undefined)).optional(),
  shots: z.array(Shot.nullish().transform((e) => e ?? undefined)).optional(),
})

export type ValuesBesidesPageImages = z.output<typeof ValuesBesidesPageImages>
export const ValuesBesidesPageImages = Values.omit({ pageImages: true })
