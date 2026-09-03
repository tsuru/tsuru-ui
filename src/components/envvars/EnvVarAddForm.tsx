import { FunctionComponent, useState, useCallback, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Checkbox,
  Typography,
  Paper,
  alpha,
  useTheme,
  Collapse,
  IconButton,
  Stack,
} from "@mui/material";
import { Add, Close, Warning } from "@mui/icons-material";
import { isSensitiveName } from "../../utils/envar";

type EnvVarAddFormProps = {
  existingNames: string[];
  onAdd: (
    name: string,
    value: string,
    isPrivate: boolean,
    norestart: boolean
  ) => void;
  disabled?: boolean;
};

const EnvVarAddForm: FunctionComponent<EnvVarAddFormProps> = ({
  existingNames,
  onAdd,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [norestart, setNorestart] = useState(false);

  const nameError = useMemo(() => {
    if (!name) return "";
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      return "Invalid name. Use letters, numbers, and underscores only. Must start with a letter or underscore.";
    }
    if (existingNames.includes(name)) {
      return "A variable with this name already exists.";
    }
    return "";
  }, [name, existingNames]);

  const showSensitiveWarning = useMemo(() => {
    return isSensitiveName(name) && !isPrivate;
  }, [name, isPrivate]);

  const isValid = useMemo(() => {
    return name.length > 0 && !nameError;
  }, [name, nameError]);

  const handleAdd = useCallback(() => {
    if (!isValid) return;
    onAdd(name, value, isPrivate, norestart);
    setName("");
    setValue("");
    setIsPrivate(false);
    setNorestart(false);
    setIsExpanded(false);
  }, [name, value, isPrivate, norestart, isValid, onAdd]);

  const handleCancel = useCallback(() => {
    setName("");
    setValue("");
    setIsPrivate(false);
    setNorestart(false);
    setIsExpanded(false);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        border: `2px dashed ${alpha(
          theme.palette.primary.main,
          isExpanded ? 0.5 : 0.2
        )}`,
        borderRadius: 2,
        backgroundColor: isExpanded
          ? alpha(theme.palette.primary.main, 0.02)
          : "transparent",
        transition: "all 0.3s ease-in-out",
        overflow: "hidden",
      }}
    >
      <Box
        onClick={() => !disabled && !isExpanded && setIsExpanded(true)}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          "&:hover":
            !disabled && !isExpanded
              ? {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              : {},
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Add
            sx={{
              color: disabled
                ? theme.palette.text.disabled
                : theme.palette.primary.main,
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              color: disabled
                ? theme.palette.text.disabled
                : theme.palette.primary.main,
              fontWeight: 500,
            }}
          >
            Add new environment variable
          </Typography>
        </Box>
        {isExpanded && (
          <IconButton size="small" onClick={handleCancel}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Variable Name"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="MY_VARIABLE_NAME"
              error={!!nameError}
              helperText={nameError || "Use UPPER_SNAKE_CASE for consistency"}
              size="small"
              disabled={disabled}
              autoFocus
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                },
              }}
            />

            <TextField
              fullWidth
              label="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value..."
              multiline
              minRows={2}
              maxRows={6}
              size="small"
              disabled={disabled}
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      size="small"
                      disabled={disabled}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Private variable{" "}
                      {isPrivate ? "(sensitive data)" : "(non-sensitive data)"}
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={norestart}
                      onChange={(e) => setNorestart(e.target.checked)}
                      size="small"
                      disabled={disabled}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Do not restart the application
                    </Typography>
                  }
                />
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCancel}
                  disabled={disabled}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAdd}
                  disabled={disabled || !isValid}
                  startIcon={<Add />}
                >
                  Add Variable
                </Button>
              </Box>
            </Box>

            {showSensitiveWarning && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                }}
              >
                <Warning
                  sx={{ fontSize: 16, color: theme.palette.error.main }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.error.main }}
                >
                  This variable name suggests sensitive data (contains KEY,
                  TOKEN, SECRET, etc.). Consider making it private to hide its
                  value from logs and UI.
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default EnvVarAddForm;
