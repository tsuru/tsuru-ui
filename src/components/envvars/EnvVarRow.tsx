import { FunctionComponent, useState, memo } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  alpha,
  useTheme,
  Collapse,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  Checkbox,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  Edit,
  Delete,
  Check,
  Close,
  Lock,
  LockOpen,
  Warning,
} from "@mui/icons-material";
import { EnvironmentVar } from "../../types/provisioner";
import Link from "../base/MuiLink";
import { isSensitiveName } from "../../utils/envar";

type EnvVarRowProps = {
  env: EnvironmentVar;
  isEditable: boolean;
  isEditing: boolean;
  onEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (
    name: string,
    value: string,
    isPrivate: boolean,
    norestart: boolean
  ) => void;
  onDelete?: () => void;
};

const EnvVarRow: FunctionComponent<EnvVarRowProps> = memo(
  ({ env, isEditable, isEditing, onEdit, onCancelEdit, onSave, onDelete }) => {
    const theme = useTheme();
    const [showValue, setShowValue] = useState(false);
    const [copied, setCopied] = useState(false);
    const [editValue, setEditValue] = useState(env.value);
    const [editPrivate, setEditPrivate] = useState(!env.public);
    const [editNorestart, setEditNorestart] = useState(false);

    const isPrivate = !env.public;
    const isTsuruManaged = env.managedBy === "tsuru";
    const showSensitiveWarning = isSensitiveName(env.name) && env.public;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(env.value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error("Failed to copy:", e);
      }
    };

    const handleSave = () => {
      onSave && onSave(env.name, editValue, editPrivate, editNorestart);
    };

    const getManagedByDisplay = () => {
      if (!env.managedBy) return null;
      if (env.managedBy.includes("/")) {
        return (
          <Link href={`/services/${env.managedBy}`}>
            <Chip
              size="small"
              label={env.managedBy}
              sx={{
                height: 20,
                fontSize: "0.7rem",
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.info.main, 0.2),
                },
              }}
            />
          </Link>
        );
      }
      return (
        <Chip
          size="small"
          label={env.managedBy}
          sx={{
            height: 20,
            fontSize: "0.7rem",
            backgroundColor: alpha(theme.palette.grey[500], 0.1),
            color: theme.palette.text.secondary,
          }}
        />
      );
    };

    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: isEditing
            ? alpha(theme.palette.primary.main, 0.02)
            : alpha(theme.palette.background.paper, 0.5),
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Left side - Name and Value */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              {isPrivate ? (
                <Lock
                  sx={{ fontSize: 16, color: theme.palette.warning.main }}
                />
              ) : (
                <LockOpen
                  sx={{ fontSize: 16, color: theme.palette.success.main }}
                />
              )}
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                {env.name}
              </Typography>
              {getManagedByDisplay()}
            </Box>

            {!isEditing && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                {isPrivate && !showValue ? (
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: theme.palette.text.secondary,
                      letterSpacing: 2,
                    }}
                  >
                    ••••••••••••
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: theme.palette.text.secondary,
                      wordBreak: "break-all",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {env.value || (
                      <em style={{ color: theme.palette.text.disabled }}>
                        (empty)
                      </em>
                    )}
                  </Typography>
                )}
              </Box>
            )}

            {showSensitiveWarning && !isEditing && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 1,
                }}
              >
                <Warning
                  sx={{ fontSize: 14, color: theme.palette.error.main }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.error.main }}
                >
                  This variable name suggests sensitive data. Consider making it
                  private.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right side - Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {!isEditing && (
              <>
                {isPrivate && (
                  <Tooltip title={showValue ? "Hide value" : "Show value"}>
                    <IconButton
                      size="small"
                      onClick={() => setShowValue(!showValue)}
                      sx={{
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}
                    >
                      {showValue ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={copied ? "Copied!" : "Copy value"}>
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{
                      color: copied
                        ? theme.palette.success.main
                        : theme.palette.text.secondary,
                      "&:hover": {
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    {copied ? (
                      <Check fontSize="small" />
                    ) : (
                      <ContentCopy fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
                {isEditable && !isTsuruManaged && (
                  <>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={onEdit}
                        sx={{
                          color: theme.palette.text.secondary,
                          "&:hover": {
                            color: theme.palette.primary.main,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={onDelete}
                        sx={{
                          color: theme.palette.text.secondary,
                          "&:hover": {
                            color: theme.palette.error.main,
                            backgroundColor: alpha(
                              theme.palette.error.main,
                              0.1
                            ),
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Edit Form */}
        <Collapse in={isEditing}>
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Value"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                multiline
                minRows={2}
                maxRows={6}
                size="small"
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
                  gap: 1,
                }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editPrivate}
                        onChange={(e) => setEditPrivate(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Private variable{" "}
                        {editPrivate ? "(hidden)" : "(visible)"}
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editNorestart}
                        onChange={(e) => setEditNorestart(e.target.checked)}
                        size="small"
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
                  <IconButton
                    size="small"
                    onClick={onCancelEdit}
                    sx={{
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                      },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleSave}
                    sx={{
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <Check fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              {isSensitiveName(env.name) && !editPrivate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Warning
                    sx={{ fontSize: 14, color: theme.palette.error.main }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.error.main }}
                  >
                    This variable name suggests sensitive data. Consider making
                    it private.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Box>
    );
  }
);

EnvVarRow.displayName = "EnvVarRow";

export default EnvVarRow;
