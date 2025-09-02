import { distanceValue, Values } from '../types'
import { UnitizedNumber, Length, Angle, Unitize } from '@speleotica/unitized'
import {
  CompassAndTapeItem,
  LrudItem,
  LrudStyle,
  ShotType,
  SrvLine,
  SrvLineType,
  UnitsOptionType,
  formatWallsSrvFile,
} from '@speleotica/walls/srv'

export function generateWallsOutput({
  tripHeader: {
    cave,
    name,
    team,
    date,
    distanceUnit,
    angleUnit,
    backsightAzimuthCorrected,
    backsightInclinationCorrected,
  },
  pages,
}: Values): string {
  const lines: SrvLine[] = []
  if (cave) lines.push({ type: SrvLineType.Comment, comment: `Cave: ${cave}` })
  if (name) lines.push({ type: SrvLineType.Comment, comment: `Trip: ${name}` })
  if (team) lines.push({ type: SrvLineType.Comment, comment: `Team: ${team}` })
  if (date) lines.push({ type: SrvLineType.DateDirective, date })
  lines.push({
    type: SrvLineType.UnitsDirective,
    options: [
      {
        type: UnitsOptionType.DistanceUnit,
        unit: distanceUnit === 'feet' ? Length.feet : Length.meters,
      },
      {
        type: UnitsOptionType.FrontsightAzimuthUnit,
        unit:
          angleUnit === 'gradians'
            ? Angle.gradians
            : angleUnit === 'mils'
            ? Angle.milsNATO
            : Angle.degrees,
      },
      {
        type: UnitsOptionType.FrontsightInclinationUnit,
        unit:
          angleUnit === 'gradians'
            ? Angle.gradians
            : angleUnit === 'mils'
            ? Angle.milsNATO
            : Angle.degrees,
      },
      {
        type: UnitsOptionType.Order,
        order: [
          CompassAndTapeItem.Distance,
          CompassAndTapeItem.Azimuth,
          CompassAndTapeItem.Inclination,
        ],
      },
      {
        type: UnitsOptionType.LrudStyle,
        style: LrudStyle.ToStationBisector,
        order: [LrudItem.Left, LrudItem.Right, LrudItem.Up, LrudItem.Down],
      },
      {
        type: UnitsOptionType.BacksightAzimuthType,
        isCorrected: backsightAzimuthCorrected || false,
        tolerance: Unitize.degrees(2),
        doNotAverage: false,
      },
      {
        type: UnitsOptionType.BacksightInclinationType,
        isCorrected: backsightInclinationCorrected || false,
        tolerance: Unitize.degrees(2),
        doNotAverage: false,
      },
    ],
  })
  for (const { tables } of pages) {
    for (const { shots } of tables) {
      for (let i = 0; i < shots.length - 1; i++) {
        const from = shots[i]?.from?.station
        if (!from) continue
        const to = shots[i + 1]?.isSplit
          ? shots[i + 1]?.to?.station
          : shots[i + 1]?.from?.station
        if (!to) continue

        const distance = parseDistance(distanceValue(shots[i]?.distance))
        if (!distance) continue
        lines.push({
          type: SrvLineType.Shot,
          from,
          to,
          measurements: {
            type: ShotType.CompassAndTape,
            distance,
            frontsightAzimuth: parseAngle(shots[i]?.frontsightAzimuth),
            backsightAzimuth: parseAngle(shots[i]?.backsightAzimuth),
            frontsightInclination: parseAngle(shots[i]?.frontsightInclination),
            backsightInclination: parseAngle(shots[i]?.backsightInclination),
          },
          ...(shots[i + 1]?.isSplit
            ? {
                left: parseDistance(shots[i + 1]?.to?.left),
                right: parseDistance(shots[i + 1]?.to?.right),
                up: parseDistance(shots[i + 1]?.to?.up),
                down: parseDistance(shots[i + 1]?.to?.down),
              }
            : {
                left: parseDistance(shots[i + 1]?.from?.left),
                right: parseDistance(shots[i + 1]?.from?.right),
                up: parseDistance(shots[i + 1]?.from?.up),
                down: parseDistance(shots[i + 1]?.from?.down),
              }),
          comment: shots[i + 1]?.notes,
        })
      }
    }
  }
  return formatWallsSrvFile({ lines })
}

function parseDistance(
  num: number | undefined
): UnitizedNumber<Length> | undefined {
  return num != null ? Unitize.feet(num) : undefined
}

function parseAngle(
  num: number | undefined
): UnitizedNumber<Angle> | undefined {
  return num != null ? Unitize.degrees(num) : undefined
}
