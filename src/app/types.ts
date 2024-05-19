export type Shot = {
  fromStation?: string;
  distance?: string;
  frontsightAzimuth?: string;
  backsightAzimuth?: string;
  frontsightInclination?: string;
  backsightInclination?: string;
  left?: string;
  right?: string;
  up?: string;
  down?: string;
  notes?: string;
};

export type Values = {
  shots: Shot[];
};
