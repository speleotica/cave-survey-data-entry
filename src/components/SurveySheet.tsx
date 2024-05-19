import * as React from "react";
import Box from "@mui/material/Box";
import { LayoutVariant, SurveyPageFields } from "./SurveyPageFields";
import { PageImage } from "./types";
import { useField } from "react-final-form";
import { ResizableRect } from "./ResizableRect";
import { IconButton, MenuItem, TextField } from "@mui/material";

const useFieldProps = (subfield: string) => (index: number) => {
  const { input } = useField(`shots[${index}].${subfield}`);
  return input;
};

const useFieldPropsMap = {
  station: useFieldProps("fromStation"),
  distance: useFieldProps("distance"),
  frontsightAzimuth: useFieldProps("frontsightAzimuth"),
  backsightAzimuth: useFieldProps("backsightAzimuth"),
  frontsightInclination: useFieldProps("frontsightInclination"),
  backsightInclination: useFieldProps("backsightInclination"),
  left: useFieldProps("left"),
  right: useFieldProps("right"),
  up: useFieldProps("up"),
  down: useFieldProps("down"),
  notes: useFieldProps("notes"),
};

export function SurveySheet({
  pageImage,
  pageIndex: pageNumber = 0,
}: {
  pageImage: PageImage;
  pageIndex?: number;
}) {
  const src = React.useMemo(
    () => `data:${pageImage.type};base64,${pageImage.data}`,
    [pageImage]
  );

  const [tableBounds, setTableBounds] = React.useState({
    top: 113,
    left: 15,
    width: 520,
    height: 632,
  });

  const [layoutVariant, setLayoutVariant] =
    React.useState<LayoutVariant>("IMO");

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ userSelect: "none" }}>
        <img src={src} alt="survey sheet" height={800} />
      </Box>
      <Box
        sx={{
          ...tableBounds,
          position: "absolute",
        }}
      >
        <SurveyPageFields
          layoutVariant={layoutVariant}
          useFieldProps={useFieldPropsMap}
          startIndex={pageNumber * 11}
        />
      </Box>
      <ResizableRect bounds={tableBounds} onResize={setTableBounds} />
      <TextField
        value={layoutVariant}
        variant="filled"
        onChange={(e) => setLayoutVariant(e.target.value as any)}
        select
        label="Layout"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          position: "absolute",
          top: tableBounds.top - 60,
          left: tableBounds.left,
        }}
      >
        <MenuItem value="IMO">Inner Mountain Outfitters</MenuItem>
        <MenuItem value="Lech">Lechuguilla</MenuItem>
      </TextField>
    </Box>
  );
}
