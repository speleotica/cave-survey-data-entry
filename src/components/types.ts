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

export type PageImage = {
  /**
   * The mime type
   */
  type: string;
  /**
   * The base-64 encoded data
   */
  data: string;
};

export type Values = {
  pageImages?: PageImage[];
  shots?: Shot[];
};
