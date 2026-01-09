import React from "react";
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete, DragIndicator } from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem({ service, updateService, removeService, currency, mode }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: "8px",
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: mode === "dark" ? "#1E1E1E" : "#fafafa",
      }}
    >
      <Tooltip title="Drag to reorder">
        <IconButton {...attributes} {...listeners} size="small">
          <DragIndicator fontSize="small" />
        </IconButton>
      </Tooltip>

      <TextField
        label="Service Name"
        variant="outlined"
        size="small"
        fullWidth
        value={service.name}
        onChange={(e) => updateService(service.id, "name", e.target.value)}
      />

      <TextField
        label={`Price (${currency})`}
        type="number"
        variant="outlined"
        size="small"
        sx={{ width: 130 }}
        value={service.price}
        onChange={(e) => updateService(service.id, "price", e.target.value)}
      />

      <Tooltip title="Remove Service">
        <IconButton color="error" onClick={() => removeService(service.id)}>
          <Delete />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
