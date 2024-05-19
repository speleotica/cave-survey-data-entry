"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { Button, MenuItem, TextField } from "@mui/material";
import { Field, FieldRenderProps, Form, useField } from "react-final-form";
import { OutputField } from "@/components/OutputField";
import { SurveySheetsField } from "@/components/SurveySheetsField";
import { PageImage, Values } from "@/components/types";

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
