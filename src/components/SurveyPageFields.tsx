import { Box, SxProps, TextField } from "@mui/material";
import { css } from "@emotion/css";
import * as React from "react";

type UseFieldProps = (index: number) => React.ComponentProps<typeof TextField>;

type UseFieldPropsMap = {
  station?: UseFieldProps;
  distance?: UseFieldProps;
  frontsightAzimuth?: UseFieldProps;
  backsightAzimuth?: UseFieldProps;
  frontsightInclination?: UseFieldProps;
  backsightInclination?: UseFieldProps;
  left?: UseFieldProps;
  right?: UseFieldProps;
  up?: UseFieldProps;
  down?: UseFieldProps;
  notes?: UseFieldProps;
};

export type LayoutVariant = "IMO" | "Lech";

export const SurveyPageFields = React.memo(function SurveyPageFields({
  startIndex = 0,
  useFieldProps,
  layoutVariant = "IMO",
}: {
  startIndex?: number;
  useFieldProps?: UseFieldPropsMap;
  layoutVariant?: LayoutVariant;
}) {
  const numRows = 11;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        width: "100%",
        height: "100%",
      }}
    >
      {[...Array(numRows).keys()].map((index) => (
        <SurveyRow
          sx={{
            flexBasis: `${100 / numRows}%`,
          }}
          key={index}
          index={index + startIndex}
          layoutVariant={layoutVariant}
          useFieldProps={useFieldProps}
          includeShotFields={index < numRows - 1}
        />
      ))}
    </Box>
  );
});

const SurveyRow = ({
  sx,
  index,
  useFieldProps,
  includeShotFields = true,
  layoutVariant,
}: {
  sx?: SxProps;
  index: number;
  layoutVariant: LayoutVariant;
  useFieldProps?: UseFieldPropsMap;
  includeShotFields?: boolean;
}) => {
  return (
    <Box
      sx={{
        ...sx,
        flexGrow: 1,
        flexShrink: 1,
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "stretch",
      }}
    >
      <SurveyTextField
        index={index}
        useFieldProps={useFieldProps?.station}
        field="station"
        // placeholder="Sta"
        sx={{
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: layoutVariant === "Lech" ? "19%" : "16%",
        }}
      />
      <Box
        sx={{
          position: "relative",
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: layoutVariant === "Lech" ? "37.5%" : "40%",
          pointerEvents: "none",
        }}
      >
        {includeShotFields && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "stretch",
              pointerEvents: "all",
            }}
          >
            <SurveyTextField
              index={index}
              useFieldProps={useFieldProps?.distance}
              field="distance"
              // placeholder="Dist"
              sx={{
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            >
              <AngleField
                index={index}
                field="frontsightAzimuth"
                useFieldProps={useFieldProps?.frontsightAzimuth}
                // placeholder="FS Azm"
              />
              <AngleField
                index={index}
                field="backsightAzimuth"
                useFieldProps={useFieldProps?.backsightAzimuth}
                // placeholder="BS Azm"
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            >
              <AngleField
                index={index}
                field="frontsightInclination"
                useFieldProps={useFieldProps?.frontsightInclination}
                // placeholder="FS Inc"
              />
              <AngleField
                index={index}
                field="backsightInclination"
                useFieldProps={useFieldProps?.backsightInclination}
                // placeholder="BS Inc"
              />
            </Box>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          flexBasis: 0,
          flexGrow: 1,
          flexShrink: 1,
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "stretch",
        }}
      >
        <SurveyTextField
          index={index}
          field="left"
          useFieldProps={useFieldProps?.left}
          // placeholder="L"
        />
        <SurveyTextField
          index={index}
          field="right"
          useFieldProps={useFieldProps?.right}
          // placeholder="R"
        />
        <SurveyTextField
          index={index}
          field="up"
          useFieldProps={useFieldProps?.up}
          // placeholder="U"
        />
        <SurveyTextField
          index={index}
          field="down"
          useFieldProps={useFieldProps?.down}
          // placeholder="D"
        />
        <SurveyTextField
          index={index}
          field="notes"
          useFieldProps={useFieldProps?.notes}
          // placeholder="Notes"
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: layoutVariant === "Lech" ? "43%" : "30%",
          }}
        />
      </Box>
    </Box>
  );
};

const SurveyTextField = ({
  field,
  index,
  useFieldProps,
  sx,
  inputProps,
  InputProps,
  ...props
}: React.ComponentProps<typeof TextField> & {
  field?:
    | "station"
    | "distance"
    | "frontsightAzimuth"
    | "backsightAzimuth"
    | "frontsightInclination"
    | "backsightInclination"
    | "left"
    | "right"
    | "up"
    | "down"
    | "notes";
  index: number;
  useFieldProps?: UseFieldProps;
}) => {
  const fieldProps = useFieldProps?.(index);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      let otherInput: Element | null = null;
      if (event.key === "ArrowUp") {
        switch (field) {
          case "frontsightAzimuth":
            otherInput = document.querySelector(
              `[data-field="backsightAzimuth"][data-index="${index - 1}"]`
            );
            break;
          case "backsightAzimuth":
            otherInput = document.querySelector(
              `[data-field="frontsightAzimuth"][data-index="${index}"]`
            );
            break;
          case "frontsightInclination":
            otherInput = document.querySelector(
              `[data-field="backsightInclination"][data-index="${index - 1}"]`
            );
            break;
          case "backsightInclination":
            otherInput = document.querySelector(
              `[data-field="frontsightInclination"][data-index="${index}"]`
            );
            break;
          default:
            otherInput = document.querySelector(
              `[data-field="${field}"][data-index="${index - 1}"]`
            );
            break;
        }
      }
      if (event.key === "ArrowDown") {
        switch (field) {
          case "frontsightAzimuth":
            otherInput = document.querySelector(
              `[data-field="backsightAzimuth"][data-index="${index}"]`
            );
            break;
          case "backsightAzimuth":
            otherInput = document.querySelector(
              `[data-field="frontsightAzimuth"][data-index="${index + 1}"]`
            );
            break;
          case "frontsightInclination":
            otherInput = document.querySelector(
              `[data-field="backsightInclination"][data-index="${index}"]`
            );
            break;
          case "backsightInclination":
            otherInput = document.querySelector(
              `[data-field="frontsightInclination"][data-index="${index + 1}"]`
            );
            break;
          default:
            otherInput = document.querySelector(
              `[data-field="${field}"][data-index="${index + 1}"]`
            );
            break;
        }
      }
      if (otherInput instanceof HTMLInputElement) {
        otherInput.focus();
        otherInput.select();
      }
    },
    [field, index]
  );

  return (
    <TextField
      {...fieldProps}
      {...props}
      onKeyDown={onKeyDown}
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "10%",
        backgroundColor: fieldProps?.value
          ? "rgba(255, 255, 255, 0.8)"
          : "none",
        ...sx,
      }}
      inputProps={{
        "data-field": field,
        "data-index": index,
        className: css`
          padding: 2px;
          text-align: center;
        `,
        ...inputProps,
      }}
      InputProps={{
        ...InputProps,
        sx: {
          borderRadius: 0,
          height: "100%",
          fontSize: "0.8rem",
          ...InputProps?.sx,
        },
      }}
    />
  );
};

const AngleField = ({
  sx,
  inputProps,
  InputProps,
  ...props
}: React.ComponentProps<typeof SurveyTextField>) => {
  return (
    <SurveyTextField
      {...props}
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        ...sx,
      }}
      InputProps={{
        ...InputProps,
        sx: {
          height: "100%",
          ...InputProps?.sx,
        },
      }}
    />
  );
};
