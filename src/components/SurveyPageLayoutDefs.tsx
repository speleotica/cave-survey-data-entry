import { LayoutVariant } from '@/types'

type LrudDir = 'left' | 'right' | 'up' | 'down'

type StaggeredLayoutDef = {
  staggered: true
  numRows: number
  stationWidth: string
  shotWidth: string
  distanceWidth?: string
  azimuthWidth?: string
  inclinationWidth?: string
  lrudWidth?: string
  lrudWidths?: { [K in LrudDir]?: string }
  downWidth?: string
  notes?: 'afterLrud' | 'afterInclination'
  notesWidth?: string
}

type UnstaggeredLayoutDef = {
  staggered: false
  numRows: number
  station: 'from' | 'to'
  stationWidth: string
  shotWidth: string
  distanceWidth?: string
  azimuthWidth?: undefined
  inclinationWidth?: undefined
  lrudWidth?: string
  lrudWidths?: { [K in LrudDir]?: string }
  notes?: undefined
  notesWidth?: undefined
}

export type SurveyPageLayoutDef = StaggeredLayoutDef | UnstaggeredLayoutDef

export const SurveyPageLayoutDefs: Record<LayoutVariant, SurveyPageLayoutDef> =
  {
    Lech: {
      staggered: true,
      numRows: 11,
      stationWidth: '19%',
      shotWidth: '37.5%',
      notes: 'afterLrud',
      notesWidth: '43%',
    },
    IMO: {
      staggered: true,
      numRows: 11,
      stationWidth: '16%',
      shotWidth: '40%',
      notes: 'afterLrud',
      notesWidth: '30%',
    },
    'X-38': {
      staggered: true,
      numRows: 10,
      stationWidth: '18%',
      shotWidth: '38%',
      distanceWidth: '38%',
      azimuthWidth: '30%',
      inclinationWidth: '30%',
      notes: 'afterInclination',
      notesWidth: '12%',
    },
    'X-39': {
      staggered: true,
      numRows: 10,
      stationWidth: '18%',
      shotWidth: '38.5%',
      distanceWidth: '38%',
      azimuthWidth: '30%',
      inclinationWidth: '30%',
      lrudWidths: {
        left: '23%',
        right: '23%',
        up: '25%',
        down: '28%',
      },
      notes: 'afterInclination',
      notesWidth: '12%',
    },
    FromStaDisAzIncLrUd: {
      staggered: false,
      numRows: 26,
      station: 'from',
      stationWidth: '16%',
      shotWidth: '50%',
    },
    ToStaDisAzIncLrUd: {
      staggered: false,
      numRows: 26,
      station: 'to',
      stationWidth: '16%',
      shotWidth: '50%',
    },
  }
