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

export function generateCompassOutput({ tripHeader, pages }: Values): string {
  const distanceUnit =
    tripHeader.distanceUnit === 'meters'
      ? DistanceUnit.Meters
      : DistanceUnit.FeetAndInches
  const header: CompassTripHeader = {
    cave: tripHeader.cave || '',
    name: tripHeader.name,
    team: tripHeader.team,
    date: tripHeader.date || new Date(),
    declination: Unitize.degrees(0),
    distanceUnit,
    azimuthUnit:
      tripHeader.angleUnit === 'gradians'
        ? AzimuthUnit.Gradians
        : AzimuthUnit.Degrees,
    inclinationUnit:
      tripHeader.angleUnit === 'gradians'
        ? InclinationUnit.Gradians
        : InclinationUnit.Degrees,
    hasRedundantBacksights: true,
    lrudUnit: distanceUnit,
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
        let backsightAzimuth = parseAngle(shots[i]?.backsightAzimuth)
        if (backsightAzimuth && tripHeader.backsightAzimuthCorrected)
          backsightAzimuth = Angle.opposite(backsightAzimuth)
        let backsightInclination = parseAngle(shots[i]?.backsightInclination)
        if (backsightInclination && tripHeader.backsightInclinationCorrected)
          backsightInclination = backsightInclination.negate()
        compassShots.push({
          from,
          to,
          distance,
          excludeDistance,
          frontsightAzimuth: parseAngle(shots[i]?.frontsightAzimuth),
          backsightAzimuth,
          frontsightInclination: parseAngle(shots[i]?.frontsightInclination),
          backsightInclination,
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
