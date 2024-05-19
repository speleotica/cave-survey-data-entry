import { Values } from "./types";
import { UnitizedNumber, Length, Angle, Unitize } from "@speleotica/unitized";
import { FrcsShot, FrcsShotKind } from "@speleotica/frcsdata/FrcsShot";
import { FrcsTripHeader, formatFrcsShot } from "@speleotica/frcsdata";

export function generateFrcsOutput({ shots }: Values): string {
  const header: FrcsTripHeader = {
    name: "Trip",
    distanceUnit: Length.feet,
    azimuthUnit: Angle.degrees,
    inclinationUnit: Angle.degrees,
  };
  const frcsShots: FrcsShot[] = [];
  for (let i = 0; i < shots.length - 1; i++) {
    const from = shots[i]?.fromStation;
    if (!from) continue;
    let excludeDistance = false;
    let rawDistance = shots[i]?.distance;
    if (rawDistance != null && /\*\s*$/.test(rawDistance)) {
      excludeDistance = true;
      rawDistance = rawDistance.replace(/\*\s*$/, "");
    }
    const distance = parseDistance(rawDistance);
    if (!distance) continue;
    frcsShots.push({
      from,
      to: shots[i + 1]?.fromStation,
      kind: FrcsShotKind.Normal,
      distance,
      excludeDistance,
      frontsightAzimuth: parseAngle(shots[i]?.frontsightAzimuth),
      backsightAzimuth: parseAngle(shots[i]?.backsightAzimuth),
      frontsightInclination: parseAngle(shots[i]?.frontsightInclination),
      backsightInclination: parseAngle(shots[i]?.backsightInclination),
      fromLruds: {
        left: parseDistance(shots[i]?.left),
        right: parseDistance(shots[i]?.right),
        up: parseDistance(shots[i]?.up),
        down: parseDistance(shots[i]?.down),
      },
      toLruds: {
        left: parseDistance(shots[i + 1]?.left),
        right: parseDistance(shots[i + 1]?.right),
        up: parseDistance(shots[i + 1]?.up),
        down: parseDistance(shots[i + 1]?.down),
      },
      comment: shots[i + 1]?.notes,
    });
  }
  return frcsShots.map((shot) => formatFrcsShot(shot, header)).join("\n");
}

function parseNumber(value: string | undefined): number | undefined {
  return value != null &&
    /^\s*[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?\s*$/i.test(value)
    ? parseFloat(value)
    : undefined;
}

function parseDistance(
  value: string | undefined
): UnitizedNumber<Length> | undefined {
  const num = parseNumber(value);
  return num != null ? Unitize.feet(num) : undefined;
}

function parseAngle(
  value: string | undefined
): UnitizedNumber<Angle> | undefined {
  const num = parseNumber(value);
  return num != null ? Unitize.degrees(num) : undefined;
}
