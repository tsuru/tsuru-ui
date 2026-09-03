import {
  FunctionComponent,
  ReactNode,
  useState,
  useCallback,
  useRef,
} from "react";
import Loading from "../../views/Loading";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import {
  Button,
  Box,
  Stack,
  Tooltip,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  History,
  Block,
  CheckCircle,
  Error as ErrorIcon,
  ContentCopy,
} from "@mui/icons-material";

import time from "../../utils/time";
import Link from "../base/MuiLink";
import DisplayError from "../base/DisplayError";
import {
  useAppDeploys,
  useAppRollback,
  useAppDisableRollback,
} from "../../hooks/app";
import RollbackDialog from "./RollbackDialog";
import DisableRollbackDialog from "./DisableRollbackDialog";
import { Deploy } from "../../types/deploys";

type DeployListProps = {
  app: string;
};

type DialogState = {
  open: boolean;
  version: number;
  image: string;
};

const initialDialogState: DialogState = {
  open: false,
  version: 0,
  image: "",
};

const DeployList: FunctionComponent<DeployListProps> = ({ app }) => {
  const theme = useTheme();
  const deploys = useAppDeploys(app);
  const rollbackHook = useAppRollback(app);
  const disableRollbackHook = useAppDisableRollback(app);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [rollbackDialogState, setRollbackDialogState] =
    useState<DialogState>(initialDialogState);
  const [disableDialogState, setDisableDialogState] =
    useState<DialogState>(initialDialogState);

  // Rollback handlers
  const handleOpenRollbackDialog = useCallback((deploy: Deploy) => {
    setRollbackDialogState({
      open: true,
      version: deploy.Version,
      image: deploy.Image,
    });
  }, []);

  const handleCloseRollbackDialog = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (rollbackHook.streamState.success) {
      deploys.refetch();
    }
    setRollbackDialogState(initialDialogState);
    rollbackHook.reset();
  }, [rollbackHook, deploys]);

  const handleConfirmRollback = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    await rollbackHook.rollback(
      rollbackDialogState.image,
      abortControllerRef.current.signal
    );
  }, [rollbackHook, rollbackDialogState.image]);

  // Disable rollback handlers
  const handleOpenDisableDialog = useCallback((deploy: Deploy) => {
    setDisableDialogState({
      open: true,
      version: deploy.Version,
      image: deploy.Image,
    });
  }, []);

  const handleCloseDisableDialog = useCallback(() => {
    if (disableRollbackHook.state.success) {
      deploys.refetch();
    }
    setDisableDialogState(initialDialogState);
    disableRollbackHook.reset();
  }, [disableRollbackHook, deploys]);

  const handleConfirmDisable = useCallback(
    async (reason: string) => {
      await disableRollbackHook.disableRollback(
        disableDialogState.image,
        reason
      );
    },
    [disableRollbackHook, disableDialogState.image]
  );

  if (deploys.error) {
    return <DisplayError error={deploys.error} />;
  }

  if (deploys.loading || !deploys.value) {
    return <Loading />;
  }

  let deployElems = deploys.value.map((deploy) => {
    let primaryText = time.humanDateWithWeek(deploy.Timestamp);

    if (deploy.Message !== "") {
      primaryText = `${primaryText} - ${deploy.Message}`;
    }
    const secondaryText = `by ${deploy.User}, duration: ${time.humanDuration(
      deploy.Duration / 1000000000 // deploy.Duration is a nanosecond
    )}, using ${deploy.Origin}`;

    const hasVersion = deploy.Version > 0;
    const hasError = deploy.Error !== "";
    const canRollback = hasVersion && !hasError && deploy.CanRollback;

    let chip: ReactNode = null;
    if (hasVersion || hasError) {
      chip = (
        <Chip
          icon={
            hasError ? (
              <ErrorIcon sx={{ fontSize: 16 }} />
            ) : (
              <CheckCircle sx={{ fontSize: 16 }} />
            )
          }
          label={hasError ? "Error" : `V${deploy.Version}`}
          size="small"
          variant="outlined"
          color={hasError ? "error" : "success"}
          sx={{
            fontWeight: 600,
            "& .MuiChip-icon": {
              marginLeft: "8px",
            },
          }}
        />
      );
    }

    return (
      <ListItemButton
        href={`/apps/${app}/deploys/${deploy.ID}`}
        LinkComponent={Link}
        key={deploy.ID}
        sx={{
          borderRadius: 2,
          mb: 1,
          transition: "all 0.2s ease",
          border: `1px solid transparent`,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderColor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <ListItemText
          primary={
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box component="span">{primaryText}</Box>
              {chip}
            </Stack>
          }
          secondary={secondaryText}
          primaryTypographyProps={{
            fontWeight: 500,
          }}
          secondaryTypographyProps={{
            sx: { mt: 0.5 },
          }}
        />

        {canRollback && (
          <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
            <Tooltip title="Rollback to this version" arrow>
              <Button
                variant="contained"
                size="small"
                color="warning"
                startIcon={<History sx={{ fontSize: 18 }} />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenRollbackDialog(deploy);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 1.5,
                  px: 2,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: `0 2px 8px ${alpha(
                      theme.palette.warning.main,
                      0.3
                    )}`,
                  },
                }}
              >
                Rollback
              </Button>
            </Tooltip>

            <Tooltip title="Disable rollback for this version" arrow>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenDisableDialog(deploy);
                }}
                sx={{
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  borderRadius: 1.5,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                    borderColor: theme.palette.error.main,
                  },
                }}
              >
                <Block sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </ListItemButton>
    );
  });

  if (deployElems.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          color: theme.palette.text.secondary,
        }}
      >
        <ContentCopy sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
        No deploys found.
      </Box>
    );
  }

  return (
    <>
      <List sx={{ p: 0 }}>{deployElems}</List>

      {/* Rollback Dialog */}
      <RollbackDialog
        open={rollbackDialogState.open}
        appName={app}
        version={rollbackDialogState.version}
        image={rollbackDialogState.image}
        streamState={rollbackHook.streamState}
        onConfirm={handleConfirmRollback}
        onClose={handleCloseRollbackDialog}
      />

      {/* Disable Rollback Dialog */}
      <DisableRollbackDialog
        open={disableDialogState.open}
        appName={app}
        version={disableDialogState.version}
        image={disableDialogState.image}
        state={disableRollbackHook.state}
        onConfirm={handleConfirmDisable}
        onClose={handleCloseDisableDialog}
      />
    </>
  );
};

export default DeployList;
