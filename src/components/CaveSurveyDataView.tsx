"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import {
  Field,
  FieldRenderProps,
  Form,
  FormSpy,
  useField,
} from "react-final-form";
import { OutputField } from "./OutputField";
import { SurveySheetsField } from "./SurveySheetsField";
import { PageImage, Shot, Values } from "./types";
import { throttle } from "lodash";
import { Button, FormLabel, MenuItem, Switch, TextField } from "@mui/material";
import { FormState } from "final-form";
import { SplitPane } from "./SplitPane";

export default function Home() {
  const handleSubmit = React.useCallback((values: any) => {
    console.log(values);
  }, []);

  const initialValues = React.useMemo((): Values | undefined => {
    try {
      return Values.parse({
        pageImages: JSON.parse(
          localStorage.getItem("caveSurveyDataPageImages") || ""
        ),
        ...JSON.parse(localStorage.getItem("caveSurveyDataValues") || ""),
      });
    } catch (error) {
      return {
        pageImages: [],
        shots: [],
        backsightAzimuthCorrected: true,
        backsightInclinationCorrected: true,
      };
    }
  }, []);

  return (
    <Form<Values> initialValues={initialValues} onSubmit={handleSubmit}>
      {(props) => (
        <>
          <PersistData />
          <SplitPane
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            slotProps={{
              right: {
                sx: {
                  pt: 2,
                },
              },
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                flexShrink: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                overflow: "hidden",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                <ClearDataButton />
                <ClearAllButton />
              </Box>
              <Box
                sx={{ display: "flex", flexDirection: "row", gap: 4, mb: 2 }}
              >
                <Field
                  name="backsightAzimuthCorrected"
                  type="checkbox"
                  render={({ input }) => (
                    <FormLabel>
                      <Switch {...input} />
                      Corrected Backsight Azimuths
                    </FormLabel>
                  )}
                />
                <Field
                  name="backsightInclinationCorrected"
                  type="checkbox"
                  render={({ input }) => (
                    <FormLabel>
                      <Switch {...input} />
                      Corrected Backsight Inclinations
                    </FormLabel>
                  )}
                />
              </Box>
              <Field
                name="pageImages"
                render={(props: FieldRenderProps<PageImage[] | undefined>) => (
                  <SurveySheetsField {...props} />
                )}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              <TextField label="Format" select value="frcs" fullWidth>
                <MenuItem value="frcs">FRCS</MenuItem>
              </TextField>
              <OutputField
                fullWidth
                sx={{ flexGrow: 1, flexShrink: 1, minHeight: 0, mt: 2 }}
              />
            </Box>
          </SplitPane>
        </>
      )}
    </Form>
  );
}

function ClearDataButton() {
  const {
    input: { onChange },
  } = useField("shots");
  return (
    <Button
      onClick={() => {
        onChange([]);
      }}
    >
      Clear Data
    </Button>
  );
}

function ClearAllButton() {
  const shots = useField("shots");
  const pageImages = useField("pageImages");
  return (
    <Button
      onClick={() => {
        shots.input.onChange([]);
        pageImages.input.onChange([]);
      }}
    >
      Clear All
    </Button>
  );
}

function PersistData() {
  const lastValues = React.useRef<Values | undefined>(undefined);

  const handleChange = React.useMemo(
    () =>
      throttle(({ values }: FormState<Values>) => {
        if (values.pageImages !== lastValues.current?.pageImages) {
          localStorage.setItem(
            "caveSurveyDataPageImages",
            JSON.stringify(values.pageImages)
          );
        }
        if (
          (Object.keys(values) as (keyof Values)[]).some(
            (key) =>
              key !== "pageImages" && values[key] !== lastValues.current?.[key]
          )
        ) {
          const { pageImages, ...rest } = values;
          localStorage.setItem("caveSurveyDataValues", JSON.stringify(rest));
        }
        lastValues.current = values;
      }, 500),
    []
  );

  return <FormSpy subscription={{ values: true }} onChange={handleChange} />;
}
