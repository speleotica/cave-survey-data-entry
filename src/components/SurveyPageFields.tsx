import { Box, Fab, SxProps, TextField, Tooltip } from "@mui/material";
import * as React from "react";
import { LayoutVariant } from "./types";
import { ViewStream } from "@mui/icons-material";

type UseFieldProps = (index: number) => React.ComponentProps<typeof TextField>;

type UseStationAndLrudFieldProps = {
  station?: UseFieldProps;
  left?: UseFieldProps;
  right?: UseFieldProps;
  up?: UseFieldProps;
  down?: UseFieldProps;
};

type UseFieldPropsMap = {
  from?: UseStationAndLrudFieldProps;
  to?: UseStationAndLrudFieldProps;
  isSplit?: UseFieldProps;
  distance?: UseFieldProps;
  frontsightAzimuth?: UseFieldProps;
  backsightAzimuth?: UseFieldProps;
  frontsightInclination?: UseFieldProps;
  backsightInclination?: UseFieldProps;
  notes?: UseFieldProps;
};

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

const lrudDirs = ["left", "right", "up", "down"] as const;

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
  const prevSplit = useFieldProps?.isSplit?.(index - 1)?.value === true;
  const isSplitProps = useFieldProps?.isSplit?.(index);
  const isSplit = isSplitProps?.value === true;
  const nextSplit = useFieldProps?.isSplit?.(index + 1)?.value === true;

  const stationSx = {
    position: "relative",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: layoutVariant === "Lech" ? "19%" : "16%",
    "&:not(:hover) > :nth-child(1)": {
      visibility: "hidden",
    },
  } as const;
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
      {isSplit ? (
        <VerticalSplit sx={stationSx}>
          <Tooltip title="Unsplit row" placement="right">
            <Fab
              size="small"
              tabIndex={-1}
              sx={{
                position: "absolute",
                top: "50%",
                left: 0,
                mt: -2,
                ml: -2,
                height: 32,
                width: 32,
                minHeight: 32,
              }}
              onClick={() => isSplitProps?.onChange?.(false as any)}
            >
              <ViewStream />
            </Fab>
          </Tooltip>
          <SurveyTextField
            index={index}
            useFieldProps={useFieldProps?.to?.station}
            field="to.station"
            above={{
              field: "from.station",
              index: index - 1,
            }}
            below={{ field: "from.station", index }}
            right="distance"
          />
          <SurveyTextField
            index={index}
            useFieldProps={useFieldProps?.from?.station}
            field="from.station"
            below={{
              field: nextSplit ? "to.station" : "from.station",
              index: index + 1,
            }}
            above={{ field: "to.station", index }}
            right="distance"
          />
        </VerticalSplit>
      ) : (
        <Box
          sx={{
            ...stationSx,
            display: "flex",
          }}
        >
          <Tooltip title="Split row" placement="right">
            <Fab
              size="small"
              tabIndex={-1}
              sx={{
                position: "absolute",
                top: "50%",
                left: 0,
                mt: -2,
                ml: -2,
                height: 32,
                width: 32,
                minHeight: 32,
              }}
              onClick={() => isSplitProps?.onChange?.(true as any)}
            >
              <ViewStream />
            </Fab>
          </Tooltip>
          <SurveyTextField
            index={index}
            useFieldProps={useFieldProps?.from?.station}
            field="from.station"
            above={{
              field: "from.station",
              index: index - 1,
            }}
            below={{
              field: nextSplit ? "to.station" : "from.station",
              index: index + 1,
            }}
            right="distance"
          />
        </Box>
      )}
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
              left="from.station"
              right="frontsightAzimuth"
              sx={{
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            />
            <VerticalSplit
              sx={{
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            >
              <AngleField
                index={index}
                field="frontsightAzimuth"
                useFieldProps={useFieldProps?.frontsightAzimuth}
                above={{ field: "backsightAzimuth", index: index - 1 }}
                below={{ field: "backsightAzimuth", index }}
                left="distance"
                right="frontsightInclination"
              />
              <AngleField
                index={index}
                field="backsightAzimuth"
                useFieldProps={useFieldProps?.backsightAzimuth}
                above={{ field: "frontsightAzimuth", index }}
                below={{ field: "frontsightAzimuth", index: index + 1 }}
                left="distance"
                right="backsightInclination"
              />
            </VerticalSplit>
            <VerticalSplit
              sx={{
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
              }}
            >
              <AngleField
                index={index}
                field="frontsightInclination"
                useFieldProps={useFieldProps?.frontsightInclination}
                above={{ field: "backsightInclination", index: index - 1 }}
                below={{ field: "backsightInclination", index }}
                left="frontsightAzimuth"
                right="from.left"
              />
              <AngleField
                index={index}
                field="backsightInclination"
                useFieldProps={useFieldProps?.backsightInclination}
                above={{ field: "frontsightInclination", index }}
                below={{ field: "frontsightInclination", index: index + 1 }}
                left="backsightAzimuth"
                right={{
                  field: nextSplit ? "to.left" : "from.left",
                  index: index + 1,
                }}
              />
            </VerticalSplit>
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
        {lrudDirs.map((dir, lrudIndex) =>
          isSplit ? (
            <VerticalSplit key={dir}>
              <SurveyTextField
                index={index}
                field={`to.${dir}`}
                useFieldProps={useFieldProps?.to?.[dir]}
                above={{ field: `from.${dir}`, index: index - 1 }}
                below={{ field: `from.${dir}`, index }}
                left={
                  lrudIndex > 0
                    ? `to.${lrudDirs[lrudIndex - 1]}`
                    : { field: "backsightInclination", index: index - 1 }
                }
                right={
                  lrudIndex < 3 ? `to.${lrudDirs[lrudIndex + 1]}` : "notes"
                }
              />
              <SurveyTextField
                index={index}
                field={`from.${dir}`}
                useFieldProps={useFieldProps?.from?.[dir]}
                above={{ field: `to.${dir}`, index }}
                below={{
                  field: nextSplit ? `to.${dir}` : `from.${dir}`,
                  index: index + 1,
                }}
                left={
                  lrudIndex > 0
                    ? `from.${lrudDirs[lrudIndex - 1]}`
                    : "frontsightInclination"
                }
                right={
                  lrudIndex < 3 ? `from.${lrudDirs[lrudIndex + 1]}` : "notes"
                }
              />
            </VerticalSplit>
          ) : (
            <SurveyTextField
              key={dir}
              index={index}
              field={`from.${dir}`}
              useFieldProps={useFieldProps?.from?.[dir]}
              above={{
                field: `from.${dir}`,
                index: index - 1,
              }}
              below={{
                field: nextSplit ? `to.${dir}` : `from.${dir}`,
                index: index + 1,
              }}
              left={
                lrudIndex > 0
                  ? `from.${lrudDirs[lrudIndex - 1]}`
                  : "frontsightInclination"
              }
              right={
                lrudIndex < 3 ? `from.${lrudDirs[lrudIndex + 1]}` : "notes"
              }
            />
          )
        )}
        <SurveyTextField
          index={index}
          field="notes"
          useFieldProps={useFieldProps?.notes}
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: layoutVariant === "Lech" ? "43%" : "30%",
          }}
          left="from.down"
        />
      </Box>
    </Box>
  );
};

function VerticalSplit({
  sx,
  children,
}: {
  sx?: SxProps;
  children?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

type FieldType =
  | "from.station"
  | "from.left"
  | "from.right"
  | "from.up"
  | "from.down"
  | "distance"
  | "frontsightAzimuth"
  | "backsightAzimuth"
  | "frontsightInclination"
  | "backsightInclination"
  | "to.station"
  | "to.left"
  | "to.right"
  | "to.up"
  | "to.down"
  | "notes";

type FieldReference =
  | FieldType
  | {
      field: FieldType;
      index: number;
    };

const SurveyTextField = ({
  field,
  index,
  above = { field, index: index - 1 },
  below = { field, index: index + 1 },
  left,
  right,
  useFieldProps,
  sx,
  inputProps,
  InputProps,
  ...props
}: React.ComponentProps<typeof TextField> & {
  field: FieldType;
  above?: FieldReference;
  below?: FieldReference;
  left?: FieldReference;
  right?: FieldReference;
  index: number;
  useFieldProps?: UseFieldProps;
}) => {
  const fieldProps = useFieldProps?.(index);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      let ref: FieldReference | undefined;
      const input =
        event.target instanceof HTMLInputElement ? event.target : undefined;
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          ref = above;
          break;
        case "ArrowDown":
          event.preventDefault();
          ref = below;
          break;
        case "ArrowLeft":
          if (input?.selectionStart === 0) {
            ref = left;
          }
          break;
        case "ArrowRight":
          if (input && input.selectionEnd === input.value?.length) {
            ref = right;
          }
          break;
      }
      const otherInput =
        typeof ref === "string"
          ? document.querySelector(
              `[data-field="${ref}"][data-index="${index}"]`
            )
          : ref
          ? document.querySelector(
              `[data-field="${ref.field}"][data-index="${ref.index}"]`
            )
          : undefined;
      if (otherInput instanceof HTMLInputElement) {
        event.preventDefault();
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
        "& input": {
          padding: "2px",
          textAlign: "center",
        },
        ...sx,
      }}
      inputProps={{
        "data-field": field,
        "data-index": index,
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
