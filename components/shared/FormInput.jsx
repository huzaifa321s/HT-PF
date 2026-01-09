// src/components/shared/FormInput.jsx
import { TextField } from "@mui/material";

const FormInput = ({ label, name, value, onChange, onKeyDown, inputRef, index, multiline, rows, type, disabled, required }) => (
  <TextField
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    onKeyDown={(e) => onKeyDown(e, index)}
    inputRef={(el) => (inputRef.current[index] = el)}
    multiline={multiline}
    rows={rows}
    type={type}
    disabled={disabled}
    required={required}
    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } }}
    fullWidth
  />
);

export default FormInput;