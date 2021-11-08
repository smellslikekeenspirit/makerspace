import React, { cloneElement, ReactElement } from "react";
import { Stack, Typography } from "@mui/material";

interface EmptyPageSectionProps {
  icon?: ReactElement;
  label: string;
}

export default function EmptyPageSection({
  icon,
  label,
}: EmptyPageSectionProps) {
  return (
    <Stack
      sx={{
        bgcolor: "grey.100",
        p: 2,
        borderRadius: 1,
      }}
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={1}
    >
      {icon && cloneElement(icon, { fontSize: "inherit", opacity: 0.5 })}

      <Typography color="grey.600" fontStyle="italic">
        {label}
      </Typography>
    </Stack>
  );
}
