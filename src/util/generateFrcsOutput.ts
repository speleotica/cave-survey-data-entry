import { distanceValue, isDistanceExcluded, Values } from '../types'
import { UnitizedNumber, Length, Angle } from '@speleotica/unitized'
import { FrcsShot, FrcsShotKind } from '@speleotica/frcsdata/FrcsShot'
import { FrcsTripHeader, formatFrcsSurveyFile } from '@speleotica/frcsdata'
import { slurp } from './slurp'

export async function generateFrcsOutput({
  tripHeader,
  pages,
}: Values): Promise<string> {
  const angleUnit =
    tripHeader.angleUnit === 'mils'
      ? Angle.milsNATO
      : tripHeader.angleUnit === 'gradians'
      ? Angle.gradians
      : Angle.degrees
  const header: FrcsTripHeader = {
    name: tripHeader.name,
    date: tripHeader.date,
    team: (tripHeader.team?.includes(';')
      ? tripHeader.team.split(';')
      : tripHeader.team?.split(',')
    )?.map((s) => s.trim()),
    distanceUnit:
      tripHeader.distanceUnit === 'meters' ? Length.meters : Length.feet,
    azimuthUnit: angleUnit,
    inclinationUnit: angleUnit,
    hasBacksightAzimuth: true,
    hasBacksightInclination: true,
    backsightAzimuthCorrected: tripHeader.backsightAzimuthCorrected,
    backsightInclinationCorrected: tripHeader.backsightInclinationCorrected,
  }

  const unitizeDist =
    tripHeader.distanceUnit === 'feet' ? Length.feet : Length.meters
  const unitizeAngle =
    tripHeader.angleUnit === 'gradians'
      ? Angle.gradians
      : tripHeader.angleUnit === 'mils'
      ? Angle.milsNATO
      : Angle.degrees

  function parseDistance(
    num: number | undefined
  ): UnitizedNumber<Length> | undefined {
    return num != null ? new UnitizedNumber(num, unitizeDist) : undefined
  }

  function parseAngle(
    num: number | undefined
  ): UnitizedNumber<Angle> | undefined {
    return num != null ? new UnitizedNumber(num, unitizeAngle) : undefined
  }

  const frcsShots: FrcsShot[] = []
  for (const { tables } of pages) {
    for (const { shots } of tables) {
      for (let i = 0; i < shots.length - 1; i++) {
        const from = shots[i]?.from?.station
        if (!from) continue
        const distance = parseDistance(distanceValue(shots[i]?.distance))
        if (!distance) continue
        frcsShots.push({
          from,
          to: shots[i + 1]?.isSplit
            ? shots[i + 1]?.to?.station
            : shots[i + 1]?.from?.station,
          kind: FrcsShotKind.Normal,
          distance,
          excludeDistance: isDistanceExcluded(shots[i]?.distance),
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
  return (
    (tripHeader.cave ? '' : ` *\n`) +
    (
      await slurp(
        formatFrcsSurveyFile({
          cave: tripHeader.cave,
          trips: [
            {
              header,
              shots: frcsShots,
            },
          ],
        })
      )
    ).join('')
  )
}
