"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { SurveyPageFields } from "./SurveyPageFields";
import Image from "next/image";
import blankSheet from "./blank-sheet.jpg";
import { TextField } from "@mui/material";
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
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <Image
              src={blankSheet}
              alt="survey sheet"
              height={800}
              width={600}
            />
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
            <SurveyPageFields useFieldProps={useFieldPropsMap} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 600,
            }}
          >
            <OutputField />
          </Box>
        </Box>
      )}
    </Form>
  );
}

export function OutputField() {
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
