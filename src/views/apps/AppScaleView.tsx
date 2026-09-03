import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Breadcrumbs,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  LinearProgress,
  Fade,
  Stack,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import Link from "../../components/base/MuiLink";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Console from "../../components/base/Console";
import DisplayError from "../../components/base/DisplayError";
import Title from "../../components/base/Title";
import {
  useApp,
  useAppScaleManual,
  useAppScaleAutoscale,
  useAppDeleteAutoscale,
  useAppUpdateProcessPlan,
  ProcessPlanUpdate,
} from "../../hooks/app";
import { usePlans } from "../../hooks/plans";
import { AppAutoscaleSchedule, AppAutoscalePrometheus } from "../../types/app";
import HorizontalScaleSection, {
  HorizontalScaleConfig,
  ScaleMode,
} from "../../components/apps/scale/HorizontalScaleSection";
import VerticalScaleSection from "../../components/apps/scale/VerticalScaleSection";
import Loading from "../Loading";

// Icons
import SwapVertIcon from "@mui/icons-material/SwapVert";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MemoryIcon from "@mui/icons-material/Memory";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";

function parsePercent(value: string | undefined): number | null {
  if (!value) return null;
  if (value.endsWith("m")) {
    return parseInt(value, 10) / 10;
  }
  const match = value.match(/^(\d+)%$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

type TabValue = "horizontal" | "vertical";

type ProcessPlanConfig = {
  currentPlan: string;
  newPlan: string;
};

const AppScaleView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();

  const process = params.process || "";
  const appName = params.name || "";

  const app = useApp(appName);
  const plans = usePlans();

  // Tab state
  const initialTab = (searchParams.get("tab") as TabValue) || "horizontal";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPhase, setExecutionPhase] = useState<
    "idle" | "deleting" | "scaling" | "done"
  >("idle");
  const [executionType, setExecutionType] = useState<"horizontal" | "vertical">(
    "horizontal"
  );

  // Horizontal scale state
  const [horizontalConfig, setHorizontalConfig] =
    useState<HorizontalScaleConfig>({
      mode: "manual" as ScaleMode,
      manualReplicas: 1,
      minUnits: 1,
      maxUnits: 10,
      cpuTarget: 50,
      schedules: [] as AppAutoscaleSchedule[],
      prometheusMetrics: [] as AppAutoscalePrometheus[],
    });
  const [hadAutoscale, setHadAutoscale] = useState(false);

  // Vertical scale state
  const [processConfig, setProcessConfig] = useState<ProcessPlanConfig | null>(
    null
  );
  const [noRestart, setNoRestart] = useState(false);

  // Load existing configuration
  useEffect(() => {
    if (app.value) {
      // Horizontal config
      const autoscale = app.value.autoscale?.find((a) => a.process === process);
      if (autoscale) {
        setHadAutoscale(true);
        const p = parsePercent(autoscale.averageCPU);
        setHorizontalConfig({
          mode: "automatic",
          manualReplicas:
            app.value.units.filter((u) => u.ProcessName === process).length ||
            1,
          minUnits: autoscale.minUnits,
          maxUnits: autoscale.maxUnits,
          cpuTarget: p !== null ? p : 50,
          schedules: autoscale.schedules || [],
          prometheusMetrics: autoscale.prometheus || [],
        });
      } else {
        const currentUnits = app.value.units.filter(
          (u) => u.ProcessName === process
        ).length;
        setHorizontalConfig((prev) => ({
          ...prev,
          mode: "manual",
          manualReplicas: currentUnits || 1,
        }));
      }

      // Vertical config - build process list
      const existingProcess = app.value.processes?.find(
        (p) => p.name === process
      );

      const config: ProcessPlanConfig = {
        currentPlan: existingProcess?.plan || "$default",
        newPlan: existingProcess?.plan || "$default",
      };

      setProcessConfig(config);
    }
  }, [app.value, process]);

  // Update URL when tab changes
  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    setSearchParams({ tab: newValue });
  };

  // Calculated values
  const currentUnits = useMemo(
    () => app.value?.units.filter((u) => u.ProcessName === process).length || 0,
    [app.value?.units, process]
  );

  const horizontalDelta = useMemo(
    () =>
      horizontalConfig.mode === "manual"
        ? horizontalConfig.manualReplicas - currentUnits
        : 0,
    [horizontalConfig.mode, horizontalConfig.manualReplicas, currentUnits]
  );

  const needsAutoscaleDelete =
    hadAutoscale && horizontalConfig.mode === "manual";

  const verticalChanges = useMemo(
    () => processConfig && processConfig.newPlan !== processConfig.currentPlan,
    [processConfig]
  );

  // API Hooks - Horizontal
  const deleteAutoscale = useAppDeleteAutoscale(
    appName,
    process,
    !(
      isExecuting &&
      executionPhase === "deleting" &&
      executionType === "horizontal"
    )
  );

  const manualScale = useAppScaleManual(
    appName,
    process,
    horizontalDelta,
    !(
      isExecuting &&
      executionPhase === "scaling" &&
      executionType === "horizontal" &&
      horizontalConfig.mode === "manual" &&
      horizontalDelta !== 0
    )
  );

  const autoscaleConfigMemo = useMemo(
    () => ({
      process,
      minUnits: horizontalConfig.minUnits,
      maxUnits: horizontalConfig.maxUnits,
      cpuTarget: horizontalConfig.cpuTarget,
      schedules:
        horizontalConfig.schedules.length > 0
          ? horizontalConfig.schedules
          : undefined,
      prometheusMetrics:
        horizontalConfig.prometheusMetrics.length > 0
          ? horizontalConfig.prometheusMetrics
          : undefined,
    }),
    [
      process,
      horizontalConfig.minUnits,
      horizontalConfig.maxUnits,
      horizontalConfig.cpuTarget,
      horizontalConfig.schedules,
      horizontalConfig.prometheusMetrics,
    ]
  );

  const autoscale = useAppScaleAutoscale(
    appName,
    autoscaleConfigMemo,
    !(
      isExecuting &&
      executionPhase === "scaling" &&
      executionType === "horizontal" &&
      horizontalConfig.mode === "automatic"
    )
  );

  // API Hook - Vertical
  const processPlanUpdates: ProcessPlanUpdate[] = useMemo(
    () => [
      {
        name: process,
        plan: processConfig?.newPlan || "$default",
      },
    ],
    [process, processConfig?.newPlan]
  );

  const updateProcessPlan = useAppUpdateProcessPlan(
    appName,
    processPlanUpdates,
    noRestart,
    !(
      isExecuting &&
      executionPhase === "scaling" &&
      executionType === "vertical"
    )
  );

  // Handle execution flow
  useEffect(() => {
    if (!isExecuting) return;

    if (executionType === "horizontal") {
      if (executionPhase === "deleting") {
        if (deleteAutoscale.action.value || deleteAutoscale.action.error) {
          if (deleteAutoscale.action.error) {
            setExecutionPhase("done");
          } else if (
            horizontalConfig.mode === "manual" &&
            horizontalDelta !== 0
          ) {
            setExecutionPhase("scaling");
          } else {
            setExecutionPhase("done");
          }
        }
      }

      if (executionPhase === "scaling") {
        const activeAction =
          horizontalConfig.mode === "manual" ? manualScale : autoscale;
        if (activeAction.action.value || activeAction.action.error) {
          setExecutionPhase("done");
        }
      }
    }

    if (executionType === "vertical") {
      if (executionPhase === "scaling") {
        if (updateProcessPlan.action.value || updateProcessPlan.action.error) {
          setExecutionPhase("done");
        }
      }
    }
  }, [
    isExecuting,
    executionPhase,
    executionType,
    deleteAutoscale.action,
    manualScale.action,
    autoscale.action,
    updateProcessPlan.action,
    horizontalConfig.mode,
    horizontalDelta,
  ]);

  // Apply handlers
  const handleApplyHorizontal = useCallback(() => {
    setExecutionType("horizontal");
    setIsExecuting(true);
    if (needsAutoscaleDelete) {
      setExecutionPhase("deleting");
    } else {
      setExecutionPhase("scaling");
    }
  }, [needsAutoscaleDelete]);

  const handleApplyVertical = useCallback(() => {
    setExecutionType("vertical");
    setIsExecuting(true);
    setExecutionPhase("scaling");
  }, []);

  // Determine active action results
  const getExecutionState = () => {
    if (executionType === "horizontal") {
      const activeAction =
        horizontalConfig.mode === "manual" ? manualScale : autoscale;
      const isLoading =
        executionPhase === "deleting"
          ? deleteAutoscale.action.loading
          : activeAction.action.loading;
      const error =
        executionPhase === "deleting"
          ? deleteAutoscale.action.error
          : activeAction.action.error;
      const success = executionPhase === "done" && !error;

      const streamParts = [];
      if (deleteAutoscale.stream) streamParts.push(deleteAutoscale.stream);
      if (horizontalConfig.mode === "manual" && manualScale.stream)
        streamParts.push(manualScale.stream);
      if (horizontalConfig.mode === "automatic" && autoscale.stream)
        streamParts.push(autoscale.stream);

      return { isLoading, error, success, stream: streamParts.join("\n") };
    } else {
      return {
        isLoading: updateProcessPlan.action.loading,
        error: updateProcessPlan.action.error,
        success: executionPhase === "done" && !updateProcessPlan.action.error,
        stream: updateProcessPlan.stream,
      };
    }
  };

  const { isLoading, error, success, stream } = getExecutionState();

  // Validation
  const isHorizontalValid = useMemo(() => {
    if (horizontalConfig.mode === "manual") {
      return horizontalConfig.manualReplicas >= 0;
    }
    return (
      horizontalConfig.minUnits >= 1 &&
      horizontalConfig.maxUnits >= horizontalConfig.minUnits &&
      horizontalConfig.cpuTarget > 0 &&
      horizontalConfig.cpuTarget <= 100
    );
  }, [horizontalConfig]);

  const hasHorizontalChanges = useMemo(() => {
    if (!app.value) return true;
    const existingAutoscale = app.value.autoscale?.find(
      (a) => a.process === process
    );

    if (horizontalConfig.mode === "manual") {
      return existingAutoscale || horizontalDelta !== 0;
    } else {
      if (!existingAutoscale) return true;
      const existingCpu = parsePercent(existingAutoscale.averageCPU) || 0;
      return (
        existingAutoscale.minUnits !== horizontalConfig.minUnits ||
        existingAutoscale.maxUnits !== horizontalConfig.maxUnits ||
        existingCpu !== horizontalConfig.cpuTarget ||
        JSON.stringify(existingAutoscale.schedules || []) !==
          JSON.stringify(horizontalConfig.schedules) ||
        JSON.stringify(existingAutoscale.prometheus || []) !==
          JSON.stringify(horizontalConfig.prometheusMetrics)
      );
    }
  }, [app.value, process, horizontalConfig, horizontalDelta]);

  const hasVerticalChanges = verticalChanges || false;

  if (app.error) {
    return <DisplayError error={app.error} />;
  }

  if (app.loading || plans.loading) {
    return <Loading />;
  }

  if (plans.error) {
    return <DisplayError error={plans.error} />;
  }

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "16px" }}>
        <Link underline="hover" color="inherit" href="/apps">
          Apps
        </Link>
        <Link underline="hover" color="inherit" href={`/apps/${appName}`}>
          {appName}
        </Link>
        <Typography color="text.primary">Scale</Typography>
      </Breadcrumbs>

      {!isExecuting ? (
        <Fade in>
          <Box>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                <SwapVertIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Title>Scale: {process}</Title>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Current units: <strong>{currentUnits}</strong>
                  </Typography>
                  {hadAutoscale ? (
                    <Chip
                      icon={<AutoGraphIcon sx={{ fontSize: 16 }} />}
                      label="Autoscale Active"
                      size="small"
                      color="success"
                    />
                  ) : (
                    <Chip
                      label="Manual Scaling"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            </Box>

            {/* Tabs */}
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  "& .MuiTab-root": {
                    minHeight: 64,
                    textTransform: "none",
                  },
                }}
              >
                <Tab
                  value="horizontal"
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SwapHorizIcon />
                      <Box textAlign="left">
                        <Typography variant="subtitle2">
                          Horizontal Scale
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Number of units
                        </Typography>
                      </Box>
                    </Stack>
                  }
                />
                <Tab
                  value="vertical"
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MemoryIcon />
                      <Box textAlign="left">
                        <Typography variant="subtitle2">
                          Vertical Scale
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Plan (CPU/Memory)
                        </Typography>
                      </Box>
                    </Stack>
                  }
                />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {activeTab === "horizontal" && (
                  <HorizontalScaleSection
                    processName={process}
                    currentUnits={currentUnits}
                    hasAutoscale={hadAutoscale}
                    config={horizontalConfig}
                    onConfigChange={setHorizontalConfig}
                  />
                )}

                {activeTab === "vertical" &&
                  app.value &&
                  plans.value &&
                  processConfig && (
                    <VerticalScaleSection
                      processName={process}
                      app={app.value}
                      plans={plans.value}
                      processConfig={processConfig}
                      onProcessConfigChange={setProcessConfig}
                      noRestart={noRestart}
                      onNoRestartChange={setNoRestart}
                    />
                  )}
              </Box>

              {/* Action buttons */}
              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.background.default, 0.3),
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                }}
              >
                <Tooltip title="Return without making changes">
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/apps/${appName}`)}
                    startIcon={<ArrowBackIcon />}
                  >
                    Cancel
                  </Button>
                </Tooltip>

                {activeTab === "horizontal" && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyHorizontal}
                    disabled={
                      !isHorizontalValid ||
                      !hasHorizontalChanges ||
                      (horizontalConfig.mode === "manual" &&
                        horizontalDelta === 0 &&
                        !needsAutoscaleDelete)
                    }
                    startIcon={<RocketLaunchIcon />}
                  >
                    Apply Horizontal Scale
                  </Button>
                )}

                {activeTab === "vertical" && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyVertical}
                    disabled={!hasVerticalChanges}
                    startIcon={<RocketLaunchIcon />}
                  >
                    Apply Vertical Scale
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </Fade>
      ) : (
        <Fade in>
          <Box>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              {isLoading && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <LinearProgress sx={{ flexGrow: 1 }} />
                  </Box>
                  <Typography variant="h6" color="primary">
                    {executionType === "vertical"
                      ? "Updating process plans..."
                      : executionPhase === "deleting"
                      ? "Removing existing autoscale..."
                      : horizontalConfig.mode === "manual"
                      ? horizontalDelta > 0
                        ? `Adding ${horizontalDelta} unit${
                            horizontalDelta > 1 ? "s" : ""
                          }...`
                        : `Removing ${Math.abs(horizontalDelta)} unit${
                            Math.abs(horizontalDelta) > 1 ? "s" : ""
                          }...`
                      : "Configuring autoscale..."}
                  </Typography>
                </>
              )}

              {error && (
                <Alert
                  severity="error"
                  icon={<ErrorOutlineIcon />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle1">
                    Error{" "}
                    {executionType === "vertical"
                      ? "updating plan"
                      : executionPhase === "deleting"
                      ? "removing autoscale"
                      : "scaling"}{" "}
                    app: {appName}
                  </Typography>
                  <Typography variant="body2">{error.message}</Typography>
                </Alert>
              )}

              {success && (
                <Alert
                  severity="success"
                  icon={<CheckCircleOutlineIcon />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle1">
                    {executionType === "vertical"
                      ? "Process plans updated successfully!"
                      : horizontalConfig.mode === "manual"
                      ? horizontalDelta !== 0
                        ? `Successfully ${
                            horizontalDelta > 0 ? "added" : "removed"
                          } ${Math.abs(horizontalDelta)} unit${
                            Math.abs(horizontalDelta) > 1 ? "s" : ""
                          }!`
                        : needsAutoscaleDelete
                        ? "Autoscale removed successfully!"
                        : "No changes were needed."
                      : "Autoscale configured successfully!"}
                  </Typography>
                </Alert>
              )}

              {stream && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Output:
                  </Typography>
                  <Console>{stream}</Console>
                </Box>
              )}

              {error && <DisplayError error={error} />}

              {(success || error) && (
                <Button
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() => navigate(`/apps/${appName}`)}
                  startIcon={<ArrowBackIcon />}
                >
                  Back to App
                </Button>
              )}
            </Paper>
          </Box>
        </Fade>
      )}
    </>
  );
};

export default AppScaleView;
