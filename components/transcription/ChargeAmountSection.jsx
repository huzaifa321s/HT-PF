import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Divider,
  Paper,
  Tooltip,
  Button,
} from "@mui/material";
import { Delete, DragIndicator, AddCircleOutline } from "@mui/icons-material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ChargeAmountSection({ formData, setFormData, currency, mode }) {
  const [services, setServices] = useState(
    formData.recommended_services?.map((name, i) => ({
      id: i.toString(),
      name,
      price: formData.serviceCharges?.[i] || "",
    })) || []
  );

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      recommended_services: services.map((s) => s.name),
      serviceCharges: services.map((s) => s.price),
    }));
  }, [services]);

  const calculateTotal = (list) =>
    list.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setServices((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addService = () => {
    const newItem = { id: Date.now().toString(), name: "", price: "" };
    setServices((prev) => [...prev, newItem]);
  };

  const removeService = (id) => {
    setServices((prev) => prev.filter((item) => item.id !== id));
  };

  const updateService = (id, field, value) => {
    setServices((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const total = calculateTotal(services);

  const paperStyle = {
    p: 3,
    borderRadius: 5,
    mb: 4,
    bgcolor: mode === "dark" ? "#121212" : "#fff",
    boxShadow: "0 8px 24px rgba(102,126,234,0.15)",
    transition: "all 0.4s ease",
    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 32px rgba(102,126,234,0.25)" },
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      bgcolor: "#fff",
      "& fieldset": { borderColor: "rgba(102,126,234,0.3)", borderWidth: 2 },
      "&:hover fieldset": { borderColor: "rgba(102,126,234,0.5)" },
      "&.Mui-focused fieldset": { borderColor: "#667eea" },
    },
  };

  return (
    <Paper variant="outlined" sx={paperStyle}>
      {services.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography color="text.secondary" mb={2}>
            No services added yet.
          </Typography>
          <Button
            startIcon={<AddCircleOutline />}
            variant="contained"
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
              },
            }}
            onClick={addService}
          >
            Add Service
          </Button>
        </Box>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {services.map((service) => (
              <SortableItem
                key={service.id}
                service={service}
                updateService={updateService}
                removeService={removeService}
                currency={currency}
                mode={mode}
                inputStyle={inputStyle}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {services.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {currency === "USD" ? "$" : "₨"} {total.toLocaleString()}
            </Typography>
          </Box>

          <Box mt={3} textAlign="center">
            <Button
              startIcon={<AddCircleOutline />}
              variant="outlined"
              size="small"
              onClick={addService}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 3,
                fontWeight: 600,
                color: "#667eea",
                border: "2px solid #667eea",
                "&:hover": {
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  border: "2px solid transparent",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(102,126,234,0.3)",
                },
              }}
            >
              Add Another
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}

function SortableItem({ service, updateService, removeService, currency, mode, inputStyle }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: service.id });
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
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: mode === "dark" ? "#1E1E1E" : "#fafafa",
        boxShadow: "0 4px 12px rgba(102,126,234,0.08)",
        "&:hover": { boxShadow: "0 8px 20px rgba(102,126,234,0.15)" },
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
        sx={inputStyle}
      />

      <TextField
        label={`Price (${currency})`}
        type="number"
        variant="outlined"
        size="small"
        sx={{ width: 130, ...inputStyle }}
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
