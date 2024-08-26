import { Values } from './types'
import { UnitizedNumber, Length, Angle, Unitize } from '@speleotica/unitized'
import { FrcsShot, FrcsShotKind } from '@speleotica/frcsdata/FrcsShot'
import { FrcsTripHeader, formatFrcsShot } from '@speleotica/frcsdata'
import { parseNumber } from './parseNumber'

export function generateFrcsOutput({ shots }: Values): string {
  if (!shots) return ''
  const header: FrcsTripHeader = {
    name: 'Trip',
    distanceUnit: Length.feet,
    azimuthUnit: Angle.degrees,
    inclinationUnit: Angle.degrees,
  }
  const frcsShots: FrcsShot[] = []
  for (let i = 0; i < shots.length - 1; i++) {
    const from = shots[i]?.from?.station
    if (!from) continue
    let excludeDistance = false
    let rawDistance = shots[i]?.distance
    if (rawDistance != null && /\*\s*$/.test(rawDistance)) {
      excludeDistance = true
      rawDistance = rawDistance.replace(/\*\s*$/, '')
    }
    const distance = parseDistance(rawDistance)
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
  return frcsShots.map((shot) => formatFrcsShot(shot, header)).join('\n')
}

function parseDistance(
  value: string | undefined
): UnitizedNumber<Length> | undefined {
  const num = parseNumber(value)
  return num != null ? Unitize.feet(num) : undefined
}

function parseAngle(
  value: string | undefined
): UnitizedNumber<Angle> | undefined {
  const num = parseNumber(value)
  return num != null ? Unitize.degrees(num) : undefined
}
