"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { SurveyPageFields } from "./SurveyPageFields";
import Image from "next/image";
import blankSheet from "./blank-sheet.jpg";
import { Button, MenuItem, TextField } from "@mui/material";
import { Form, FormSpy, useField } from "react-final-form";
import { throttle } from "lodash";
import { Values } from "./types";
import { FormState } from "final-form";
import { generateFrcsOutput } from "./generateFrcsOutput";

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

export default function Home() {
  const handleSubmit = React.useCallback((values: any) => {
    console.log(values);
  }, []);

  return (
    <Form<Values> onSubmit={handleSubmit}>
      {(props) => (
        <Box
          sx={{
            my: 4,
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            position: "relative",
          }}
        >
          <Box
            sx={{
              flexBasis: 600,
              flexShrink: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <ClearButton />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                overflow: "scroll",
                maxHeight: 1000,
              }}
            >
              <SurveySheet />
              <SurveySheet pageNumber={1} />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TextField label="Format" select value="frcs">
              <MenuItem value="frcs">FRCS</MenuItem>
            </TextField>
            <OutputField />
          </Box>
        </Box>
      )}
    </Form>
  );
}

function ClearButton() {
  const {
    input: { onChange },
  } = useField("shots");
  return (
    <Button
      onClick={() => {
        onChange([]);
      }}
    >
      Clear
    </Button>
  );
}

function SurveySheet({ pageNumber = 0 }: { pageNumber?: number }) {
  return (
    <Box sx={{ position: "relative" }}>
      <Box>
        <Image src={blankSheet} alt="survey sheet" height={800} width={600} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 113,
          left: 15,
          width: 520,
          height: 632,
          border: "1px solid red",
        }}
      >
        <SurveyPageFields
          useFieldProps={useFieldPropsMap}
          startIndex={pageNumber * 10}
        />
      </Box>
    </Box>
  );
}

function OutputField() {
  const [value, setValue] = React.useState("");

  const handleChange = React.useMemo(
    () =>
      throttle(({ values }: FormState<Values>) => {
        setTimeout(() => setValue(generateFrcsOutput(values)), 0);
      }, 500),
    []
  );

  return (
    <>
      <TextField
        multiline
        rows={40}
        sx={{ width: 600 }}
        value={value}
        InputProps={{ readOnly: true, sx: { fontFamily: "monospace" } }}
      />
      <FormSpy onChange={handleChange} subscription={{ values: true }} />
    </>
  );
}
