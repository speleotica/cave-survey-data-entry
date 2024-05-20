import * as React from "react";
import Box from "@mui/material/Box";
import { SurveyPageFields } from "./SurveyPageFields";
import {
  LayoutVariant,
  PageImage,
  rectToTableBounds,
  tableBoundsToRect,
} from "./types";
import { useField } from "react-final-form";
import { ResizableRect } from "./ResizableRect";
import { IconButton, MenuItem, TextField } from "@mui/material";

const useFieldProps = (subfield: string) => (index: number) => {
  const { input } = useField(`shots[${index}].${subfield}`);
  return input;
};

const useFieldPropsMap = {
  from: {
    station: useFieldProps("from.station"),
    left: useFieldProps("from.left"),
    right: useFieldProps("from.right"),
    up: useFieldProps("from.up"),
    down: useFieldProps("from.down"),
  },
  to: {
    station: useFieldProps("to.station"),
    left: useFieldProps("to.left"),
    right: useFieldProps("to.right"),
    up: useFieldProps("to.up"),
    down: useFieldProps("to.down"),
  },
  isSplit: useFieldProps("isSplit"),
  distance: useFieldProps("distance"),
  frontsightAzimuth: useFieldProps("frontsightAzimuth"),
  backsightAzimuth: useFieldProps("backsightAzimuth"),
  frontsightInclination: useFieldProps("frontsightInclination"),
  backsightInclination: useFieldProps("backsightInclination"),
  notes: useFieldProps("notes"),
};

const defaultTable = {
  layoutVariant: "IMO",
  bounds: rectToTableBounds({
    top: 113,
    left: 15,
    width: 520,
    height: 632,
  }),
};

export function SurveySheet({ pageIndex = 0 }: { pageIndex?: number }) {
  const {
    input: { value: pageImage },
  } = useField(`pageImages[${pageIndex}]`);
  const {
    input: { value: table = defaultTable, onChange: setTable },
  } = useField(`tables[${pageIndex}]`);

  const {
    layoutVariant = defaultTable?.layoutVariant,
    bounds = defaultTable?.bounds,
  } = table;

  const rectBounds = React.useMemo(() => tableBoundsToRect(bounds), [bounds]);

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ userSelect: "none" }}>
        <img src={pageImage.data} alt="survey sheet" height={800} />
      </Box>
      <Box
        sx={{
          ...rectBounds,
          position: "absolute",
        }}
      >
        <SurveyPageFields
          layoutVariant={layoutVariant}
          useFieldProps={useFieldPropsMap}
          startIndex={pageIndex * 11}
        />
      </Box>
      <ResizableRect
        bounds={rectBounds}
        onResize={(bounds) =>
          setTable({ ...table, bounds: rectToTableBounds(bounds) })
        }
      />
      <TextField
        value={layoutVariant}
        variant="filled"
        onChange={(e) =>
          setTable({ ...table, layoutVariant: e.target.value as any })
        }
        select
        label="Layout"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          position: "absolute",
          top: rectBounds.top - 60,
          left: rectBounds.left,
        }}
      >
        <MenuItem value="IMO">Inner Mountain Outfitters</MenuItem>
        <MenuItem value="Lech">Lechuguilla</MenuItem>
      </TextField>
    </Box>
  );
}
