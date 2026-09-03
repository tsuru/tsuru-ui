import { FunctionComponent } from "react";
import {
  TextField,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { Apps } from "@mui/icons-material";

type TsuruAppFieldsProps = {
  appName: string;
  onAppNameChange: (value: string) => void;
  appNames: string[];
  loading: boolean;
};

const TsuruAppFields: FunctionComponent<TsuruAppFieldsProps> = ({
  appName,
  onAppNameChange,
  appNames,
  loading,
}) => {
  const theme = useTheme();

  return (
    <Autocomplete
      value={appName || null}
      onChange={(_, newValue) => onAppNameChange(newValue || "")}
      inputValue={appName}
      onInputChange={(_, newInputValue) => onAppNameChange(newInputValue)}
      options={appNames}
      loading={loading}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label="App Name"
          placeholder="Search or type app name..."
          required
          helperText={`${appNames.length} apps available`}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <Apps
                    sx={{
                      color: alpha(theme.palette.text.primary, 0.4),
                    }}
                  />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
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
      noOptionsText="No apps found. You can type a name manually."
    />
  );
};

export default TsuruAppFields;
