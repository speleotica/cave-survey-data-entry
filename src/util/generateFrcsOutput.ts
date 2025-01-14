import { Values } from '../types'
import { UnitizedNumber, Length, Angle, Unitize } from '@speleotica/unitized'
import { FrcsShot, FrcsShotKind } from '@speleotica/frcsdata/FrcsShot'
import { FrcsTripHeader, formatFrcsShot } from '@speleotica/frcsdata'

export function generateFrcsOutput({ pages }: Values): string {
  if (!pages.length) return ''
  const header: FrcsTripHeader = {
    name: 'Trip',
    distanceUnit: Length.feet,
    azimuthUnit: Angle.degrees,
    inclinationUnit: Angle.degrees,
  }
  const frcsShots: FrcsShot[] = []
  for (const { tables } of pages) {
    for (const { shots } of tables) {
      for (let i = 0; i < shots.length - 1; i++) {
        const from = shots[i]?.from?.station
        if (!from) continue
        const excludeDistance = false
        const distance = parseDistance(shots[i]?.distance)
        if (!distance) continue
        frcsShots.push({
          from,
          to: shots[i + 1]?.isSplit
            ? shots[i + 1]?.to?.station
            : shots[i + 1]?.from?.station,
          kind: FrcsShotKind.Normal,
          distance,
          excludeDistance,
          frontsightAzimuth: parseAngle(shots[i]?.frontsightAzimuth),
          backsightAzimuth: parseAngle(shots[i]?.backsightAzimuth),
          frontsightInclination: parseAngle(shots[i]?.frontsightInclination),
          backsightInclination: parseAngle(shots[i]?.backsightInclination),
          fromLruds: {
            left: parseDistance(shots[i]?.from?.left),
            right: parseDistance(shots[i]?.from?.right),
            up: parseDistance(shots[i]?.from?.up),
            down: parseDistance(shots[i]?.from?.down),
          },
          toLruds: shots[i + 1]?.isSplit
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
              },
          comment: shots[i + 1]?.notes,
        })
      }
    }
  }
  return frcsShots.map((shot) => formatFrcsShot(shot, header)).join('\n')
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
