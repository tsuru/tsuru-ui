import {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";
import {
  Box,
  Breadcrumbs,
  Typography,
  Paper,
  Fade,
  alpha,
  useTheme,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import { NavigateNext, Apps, Settings } from "@mui/icons-material";

import Loading from "../Loading";
import DisplayError from "../../components/base/DisplayError";
import Link from "../../components/base/MuiLink";
import { useApp } from "../../hooks/app";
import {
  useAppEnvVars,
  useSetEnvVar,
  useDeleteEnvVar,
} from "../../hooks/envvars";
import {
  EnvVarsList,
  EnvVarsStreamDialog,
  StreamOperation,
} from "../../components/envvars";

type DialogState = {
  open: boolean;
  operation: StreamOperation;
  variableName: string;
};

const initialDialogState: DialogState = {
  open: false,
  operation: "add",
  variableName: "",
};

const AppEnvVarsView: FunctionComponent = () => {
  const theme = useTheme();
  const params = useParams();
  const appName = params.name as string;

  const app = useApp(appName);
  const {
    envVars,
    loading: envLoading,
    error: envError,
    refetch,
  } = useAppEnvVars(appName);
  const setEnvVarHook = useSetEnvVar(appName);
  const deleteEnvVarHook = useDeleteEnvVar(appName);

  const [dialogState, setDialogState] =
    useState<DialogState>(initialDialogState);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  useTitle(`Environment Variables: ${appName}`);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAdd = useCallback(
    async (
      name: string,
      value: string,
      isPrivate: boolean,
      norestart: boolean
    ) => {
      if (norestart) {
        const success = await setEnvVarHook.setEnvVar(
          { name, value, isPrivate },
          true
        );
        if (success) {
          showSnackbar(`Variable "${name}" added successfully.`, "success");
          await refetch();
        } else if (setEnvVarHook.simpleError) {
          showSnackbar(
            `Failed to add variable: ${setEnvVarHook.simpleError.message}`,
            "error"
          );
        }
      } else {
        setDialogState({ open: true, operation: "add", variableName: name });
        abortControllerRef.current = new AbortController();
        const success = await setEnvVarHook.setEnvVar(
          { name, value, isPrivate },
          false,
          abortControllerRef.current.signal
        );
        if (success) {
          await refetch();
        }
      }
    },
    [setEnvVarHook, showSnackbar, refetch]
  );

  const handleEdit = useCallback(
    async (
      name: string,
      value: string,
      isPrivate: boolean,
      norestart: boolean
    ) => {
      if (norestart) {
        const success = await setEnvVarHook.setEnvVar(
          { name, value, isPrivate },
          true
        );
        if (success) {
          showSnackbar(`Variable "${name}" updated successfully.`, "success");
          await refetch();
        } else if (setEnvVarHook.simpleError) {
          showSnackbar(
            `Failed to update variable: ${setEnvVarHook.simpleError.message}`,
            "error"
          );
        }
      } else {
        setDialogState({ open: true, operation: "edit", variableName: name });
        abortControllerRef.current = new AbortController();
        const success = await setEnvVarHook.setEnvVar(
          { name, value, isPrivate },
          false,
          abortControllerRef.current.signal
        );
        if (success) {
          await refetch();
        }
      }
    },
    [setEnvVarHook, showSnackbar, refetch]
  );

  const handleDelete = useCallback(
    async (name: string, norestart: boolean) => {
      if (norestart) {
        const success = await deleteEnvVarHook.deleteEnvVar(name, true);
        if (success) {
          showSnackbar(`Variable "${name}" deleted successfully.`, "success");
          await refetch();
        } else if (deleteEnvVarHook.simpleError) {
          showSnackbar(
            `Failed to delete variable: ${deleteEnvVarHook.simpleError.message}`,
            "error"
          );
        }
      } else {
        setDialogState({ open: true, operation: "delete", variableName: name });
        abortControllerRef.current = new AbortController();
        const success = await deleteEnvVarHook.deleteEnvVar(
          name,
          false,
          abortControllerRef.current.signal
        );
        if (success) {
          await refetch();
        }
      }
    },
    [deleteEnvVarHook, showSnackbar, refetch]
  );

  const handleCloseStreamDialog = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDialogState(initialDialogState);
    setEnvVarHook.reset();
    deleteEnvVarHook.reset();
  }, [setEnvVarHook, deleteEnvVarHook]);

  // Get current stream state based on operation
  const currentStreamState =
    dialogState.operation === "delete"
      ? deleteEnvVarHook.streamState
      : setEnvVarHook.streamState;

  if (app.error) {
    return <DisplayError error={app.error} />;
  }

  if (envError) {
    return <DisplayError error={envError} />;
  }

  if (app.loading || !app.value) {
    return <Loading />;
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{
          mb: 3,
          "& .MuiBreadcrumbs-separator": {
            mx: 1,
          },
        }}
      >
        <Link
          href="/apps"
          underline="hover"
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Apps fontSize="small" />
          Apps
        </Link>
        <Link
          href={`/apps/${appName}`}
          underline="hover"
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {appName}
        </Link>
        <Typography
          color="text.primary"
          fontWeight={600}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Settings fontSize="small" />
          Environment Variables
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 0.5,
                }}
              >
                Environment Variables
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage configuration variables for{" "}
                <Chip
                  size="small"
                  label={appName}
                  sx={{
                    height: 20,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Info Alert */}
      <Fade in timeout={400}>
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2,
            "& .MuiAlert-icon": {
              alignItems: "center",
            },
          }}
        >
          <Typography variant="body2">
            Variables managed by <strong>tsuru</strong> or external services
            like <strong>terraform</strong> cannot be edited.
          </Typography>
        </Alert>
      </Fade>

      {/* Main Content */}
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <EnvVarsList
            envs={envVars}
            loading={envLoading}
            onRefresh={handleRefresh}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            actionLoading={
              setEnvVarHook.simpleLoading || deleteEnvVarHook.simpleLoading
            }
          />
        </Paper>
      </Fade>

      {/* Stream Dialog for operations with restart */}
      <EnvVarsStreamDialog
        open={dialogState.open}
        operation={dialogState.operation}
        variableName={dialogState.variableName}
        stream={currentStreamState.stream}
        loading={currentStreamState.loading}
        error={currentStreamState.error}
        success={currentStreamState.success}
        onClose={handleCloseStreamDialog}
      />

      {/* Snackbar for operations without restart */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppEnvVarsView;
