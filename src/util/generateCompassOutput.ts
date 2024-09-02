import { Values } from '../types'
import { UnitizedNumber, Length, Angle, Unitize } from '@speleotica/unitized'
import {
  CompassTripHeader,
  formatCompassTripHeader,
  CompassShot,
  formatCompassShot,
  AzimuthUnit,
  DistanceUnit,
  InclinationUnit,
  LrudItem,
  ShotItem,
  LrudAssociation,
} from '@speleotica/compass/dat'

export function generateCompassOutput({ pages }: Values): string {
  if (!pages.length) return ''
  const header: CompassTripHeader = {
    cave: 'Cave',
    name: 'Trip',
    date: new Date(),
    declination: Unitize.degrees(0),
    distanceUnit: DistanceUnit.DecimalFeet,
    azimuthUnit: AzimuthUnit.Degrees,
    inclinationUnit: InclinationUnit.Degrees,
    hasRedundantBacksights: true,
    lrudUnit: DistanceUnit.DecimalFeet,
    shotOrder: [
      ShotItem.Distance,
      ShotItem.FrontsightAzimuth,
      ShotItem.BacksightAzimuth,
      ShotItem.FrontsightInclination,
      ShotItem.BacksightInclination,
    ],
    lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
    lrudAssociation: LrudAssociation.ToStation,
  }
  const compassShots: CompassShot[] = []
  for (const { tables } of pages) {
    for (const { shots } of tables) {
      for (let i = 0; i < shots.length - 1; i++) {
        const from = shots[i]?.from?.station
        if (!from) continue
        const to = shots[i + 1]?.isSplit
          ? shots[i + 1]?.to?.station
          : shots[i + 1]?.from?.station
        if (!to) continue

        const excludeDistance = false
        const distance = parseDistance(shots[i]?.distance)
        if (!distance) continue
        compassShots.push({
          from,
          to,
          distance,
          excludeDistance,
          frontsightAzimuth: parseAngle(shots[i]?.frontsightAzimuth),
          backsightAzimuth: parseAngle(shots[i]?.backsightAzimuth),
          frontsightInclination: parseAngle(shots[i]?.frontsightInclination),
          backsightInclination: parseAngle(shots[i]?.backsightInclination),
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
  return (
    formatCompassTripHeader(header) +
    compassShots.map((shot) => formatCompassShot(header)(shot)).join('')
  )
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
