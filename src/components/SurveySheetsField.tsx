import { Box } from "@mui/material";
import React from "react";
import { FieldRenderProps } from "react-final-form";
import { SurveySheet } from "./SurveySheet";
import { arrayBufferToBase64 } from "./arrayBufferToBase64";
import { PageImage } from "./types";

export function SurveySheetsField({
  input: { value, onChange },
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
      for (const file of files) {
        newPageImages.push({
          type: file.type,
          data: arrayBufferToBase64(await file.arrayBuffer()),
        });
      }
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
        alignSelf: "stretch",
        maxHeight: 1000,
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {(value || []).map((pageImage, index) => (
        <SurveySheet key={index} pageImage={pageImage} pageIndex={index} />
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
