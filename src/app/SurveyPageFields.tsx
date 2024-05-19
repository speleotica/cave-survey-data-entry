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

export const SurveyPageFields = React.memo(function SurveyPageFields({
  startIndex = 0,
  useFieldProps,
}: {
  startIndex?: number;
  useFieldProps?: UseFieldPropsMap;
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
}: {
  sx?: SxProps;
  index: number;
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
        placeholder="Sta"
        sx={{
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: "19%",
        }}
      />
      <Box
        sx={{
          position: "relative",
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: "37.5%",
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
              placeholder="Dist"
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
                useFieldProps={useFieldProps?.frontsightAzimuth}
                placeholder="FS Azm"
              />
              <AngleField
                index={index}
                useFieldProps={useFieldProps?.backsightAzimuth}
                placeholder="BS Azm"
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
                useFieldProps={useFieldProps?.frontsightInclination}
                placeholder="FS Inc"
              />
              <AngleField
                index={index}
                useFieldProps={useFieldProps?.backsightInclination}
                placeholder="BS Inc"
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
          useFieldProps={useFieldProps?.left}
          placeholder="L"
        />
        <SurveyTextField
          index={index}
          useFieldProps={useFieldProps?.right}
          placeholder="R"
        />
        <SurveyTextField
          index={index}
          useFieldProps={useFieldProps?.up}
          placeholder="U"
        />
        <SurveyTextField
          index={index}
          useFieldProps={useFieldProps?.down}
          placeholder="D"
        />
        <SurveyTextField
          index={index}
          useFieldProps={useFieldProps?.notes}
          placeholder="Notes"
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: "43%",
          }}
        />
      </Box>
    </Box>
  );
};

const SurveyTextField = ({
  index,
  useFieldProps,
  sx,
  inputProps,
  InputProps,
  ...props
}: React.ComponentProps<typeof TextField> & {
  index: number;
  useFieldProps?: UseFieldProps;
}) => {
  return (
    <TextField
      {...useFieldProps?.(index)}
      {...props}
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "10%",
        ...sx,
      }}
      inputProps={{
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
}: React.ComponentProps<typeof TextField> & {
  index: number;
  useFieldProps?: UseFieldProps;
}) => {
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
