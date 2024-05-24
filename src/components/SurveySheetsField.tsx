import { Box } from "@mui/material";
import React from "react";
import { FieldRenderProps } from "react-final-form";
import { SurveySheet } from "./SurveySheet";
import { PageImage } from "./types";

export function SurveySheetsField({
  input: { name, value, onChange },
}: FieldRenderProps<PageImage[] | undefined>) {
  const handleDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);
  const handleDrop = React.useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const { files } = event.dataTransfer;
      const newPageImages = [...(value || [])];
      const addedImages = await Promise.all(
        [...files].map(async (file) => {
          const data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          if (typeof data !== "string")
            throw new Error(`expected readAsDataURL to produce a string`);
          return {
            type: file.type,
            data,
          } as const;
        })
      );
      for (const img of addedImages) newPageImages.push(img);
      onChange(newPageImages);
    },
    [value]
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        overflow: "scroll",
        flexGrow: 1,
        flexShrink: 1,
        alignSelf: "stretch",
        minHeight: 0,
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {(value || []).map((pageImage, index) => (
        <SurveySheet key={index} pageIndex={index} />
      ))}
      {!value?.length ? (
        <Box
          sx={{
            height: 200,
            textAlign: "center",
            my: 10,
            alignSelf: "stretch",
            color: "gray",
          }}
        >
          Drop images here
        </Box>
      ) : undefined}
    </Box>
  );
}
