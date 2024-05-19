import * as React from "react";
import { TextField } from "@mui/material";
import { FormState } from "final-form";
import { throttle } from "lodash";
import { FormSpy } from "react-final-form";
import { generateFrcsOutput } from "./generateFrcsOutput";
import { Values } from "./types";

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
