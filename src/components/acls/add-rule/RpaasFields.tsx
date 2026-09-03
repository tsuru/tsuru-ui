import { FunctionComponent } from "react";
import {
  TextField,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { Storage } from "@mui/icons-material";

type RpaasFieldsProps = {
  serviceName: string;
  instanceName: string;
  onServiceNameChange: (value: string) => void;
  onInstanceNameChange: (value: string) => void;
  serviceNames: string[];
  instanceNames: string[];
  loading: boolean;
};

const RpaasFields: FunctionComponent<RpaasFieldsProps> = ({
  serviceName,
  instanceName,
  onServiceNameChange,
  onInstanceNameChange,
  serviceNames,
  instanceNames,
  loading,
}) => {
  const theme = useTheme();

  return (
    <>
      <FormControl fullWidth required>
        <FormLabel sx={{ mb: 1, fontWeight: 500, fontSize: "0.875rem" }}>
          Service Name
        </FormLabel>
        <Select
          value={serviceName}
          onChange={(e) => {
            onServiceNameChange(e.target.value);
            onInstanceNameChange("");
          }}
          displayEmpty
          startAdornment={
            <InputAdornment position="start">
              <Storage
                sx={{
                  color: alpha(theme.palette.text.primary, 0.4),
                }}
              />
            </InputAdornment>
          }
        >
          <MenuItem value="" disabled>
            <em>Select a service...</em>
          </MenuItem>
          {serviceNames.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          The RPaaS service name
        </Typography>
      </FormControl>

      <Autocomplete
        value={instanceName || null}
        onChange={(_, newValue) => onInstanceNameChange(newValue || "")}
        inputValue={instanceName}
        onInputChange={(_, newInputValue) =>
          onInstanceNameChange(newInputValue)
        }
        options={instanceNames}
        loading={loading}
        disabled={!serviceName}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="Instance Name"
            placeholder={
              serviceName
                ? "Search or type instance name..."
                : "Select a service first"
            }
            required
            helperText={
              serviceName
                ? `${instanceNames.length} instances available for ${serviceName}`
                : "The specific RPaaS instance name"
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        noOptionsText={
          serviceName
            ? "No instances found. You can type a name manually."
            : "Select a service first"
        }
      />
    </>
  );
};

export default RpaasFields;
