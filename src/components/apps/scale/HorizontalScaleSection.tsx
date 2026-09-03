import { FunctionComponent } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  TextField,
  Slider,
  Alert,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
  useTheme,
} from "@mui/material";
import {
  TuneRounded,
  AutoGraphRounded,
  PeopleRounded,
  WarningAmber,
  ErrorOutline,
  CheckCircleOutline,
  RocketLaunch,
  Memory,
} from "@mui/icons-material";
import {
  AppAutoscaleSchedule,
  AppAutoscalePrometheus,
} from "../../../types/app";
import ScheduleForm from "../ScheduleForm";
import PrometheusMetricForm from "../PrometheusMetricForm";

export type ScaleMode = "manual" | "automatic";

export type HorizontalScaleConfig = {
  mode: ScaleMode;
  manualReplicas: number;
  minUnits: number;
  maxUnits: number;
  cpuTarget: number;
  schedules: AppAutoscaleSchedule[];
  prometheusMetrics: AppAutoscalePrometheus[];
};

type HorizontalScaleSectionProps = {
  processName: string;
  currentUnits: number;
  hasAutoscale: boolean;
  config: HorizontalScaleConfig;
  onConfigChange: (config: HorizontalScaleConfig) => void;
};

const cpuMarks = [
  { value: 30, label: "30%" },
  { value: 50, label: "50%" },
  { value: 70, label: "70%" },
  { value: 80, label: "80%" },
];

const getCpuColor = (value: number): "success" | "warning" | "error" => {
  if (value > 80) return "error";
  if (value >= 70) return "warning";
  return "success";
};

const getCpuHelperText = (value: number): string => {
  if (value > 80)
    return "Very high CPU target may cause instability and slow responses";
  if (value >= 70)
    return "High CPU target - pods may experience occasional pressure";
  if (value >= 50) return "Balanced CPU target - good for most workloads";
  return "Conservative CPU target - more headroom for bursts";
};

const HorizontalScaleSection: FunctionComponent<
  HorizontalScaleSectionProps
> = ({ processName, currentUnits, hasAutoscale, config, onConfigChange }) => {
  const theme = useTheme();

  const updateConfig = (updates: Partial<HorizontalScaleConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const delta =
    config.mode === "manual" ? config.manualReplicas - currentUnits : 0;

  const needsAutoscaleDelete = hasAutoscale && config.mode === "manual";

  return (
    <Box>
      <Stack spacing={3}>
        {/* Mode selection */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Scaling mode for <strong>{processName}</strong>
            </Typography>

            <ToggleButtonGroup
              value={config.mode}
              exclusive
              onChange={(_, value) => value && updateConfig({ mode: value })}
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="manual" sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TuneRounded fontSize="large" />
                  <Typography variant="subtitle2">Manual</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Set a fixed number of units
                  </Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value="automatic" sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AutoGraphRounded fontSize="large" />
                  <Typography variant="subtitle2">Automatic</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Scale based on metrics
                  </Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>

            {needsAutoscaleDelete && (
              <Alert severity="warning" icon={<WarningAmber />}>
                Switching to manual mode will{" "}
                <strong>remove the existing autoscale configuration</strong> for
                this process.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        {config.mode === "manual" ? (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <PeopleRounded />
                </Box>
                <Typography variant="h6">Unit Configuration</Typography>
              </Stack>

              <Stack direction="row" spacing={3} alignItems="center">
                <TextField
                  label="Number of Units"
                  type="number"
                  value={config.manualReplicas}
                  onChange={(e) =>
                    updateConfig({
                      manualReplicas: Math.max(
                        0,
                        parseInt(e.target.value) || 0
                      ),
                    })
                  }
                  inputProps={{ min: 0 }}
                  sx={{ width: 200 }}
                />

                {delta !== 0 && (
                  <Chip
                    icon={delta > 0 ? <RocketLaunch /> : <Memory />}
                    label={delta > 0 ? `+${delta} units` : `${delta} units`}
                    color={delta > 0 ? "success" : "warning"}
                    variant="outlined"
                  />
                )}

                {delta === 0 && (
                  <Chip
                    icon={<CheckCircleOutline />}
                    label="No change"
                    variant="outlined"
                  />
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {delta > 0
                  ? `This will add ${delta} unit${
                      delta > 1 ? "s" : ""
                    } to the process.`
                  : delta < 0
                  ? `This will remove ${Math.abs(delta)} unit${
                      Math.abs(delta) > 1 ? "s" : ""
                    } from the process.`
                  : "The replica count is already at the target value."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Autoscale boundaries */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <AutoGraphRounded />
                  </Box>
                  <Typography variant="h6">Autoscale Boundaries</Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                  <TextField
                    label="Minimum Units"
                    type="number"
                    value={config.minUnits}
                    onChange={(e) =>
                      updateConfig({
                        minUnits: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    inputProps={{ min: 0 }}
                    fullWidth
                    helperText="Lowest number of replicas"
                  />
                  <TextField
                    label="Maximum Units"
                    type="number"
                    value={config.maxUnits}
                    onChange={(e) =>
                      updateConfig({
                        maxUnits: Math.max(
                          config.minUnits,
                          parseInt(e.target.value) || config.minUnits
                        ),
                      })
                    }
                    inputProps={{ min: config.minUnits }}
                    fullWidth
                    error={config.maxUnits < config.minUnits}
                    helperText={
                      config.maxUnits < config.minUnits
                        ? "Must be >= minimum"
                        : "Highest number of replicas"
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* CPU target */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(
                        theme.palette[getCpuColor(config.cpuTarget)].main,
                        0.1
                      ),
                      color: theme.palette[getCpuColor(config.cpuTarget)].main,
                    }}
                  >
                    <Memory />
                  </Box>
                  <Typography variant="h6">CPU Target</Typography>
                  <Chip
                    label={`${config.cpuTarget}%`}
                    color={getCpuColor(config.cpuTarget)}
                    size="small"
                  />
                </Stack>

                <Box sx={{ px: 2, py: 1 }}>
                  <Slider
                    value={config.cpuTarget}
                    onChange={(_, value) =>
                      updateConfig({ cpuTarget: value as number })
                    }
                    min={20}
                    max={95}
                    step={5}
                    marks={cpuMarks}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v}%`}
                    sx={{
                      "& .MuiSlider-track": {
                        backgroundColor:
                          theme.palette[getCpuColor(config.cpuTarget)].main,
                      },
                      "& .MuiSlider-thumb": {
                        backgroundColor:
                          theme.palette[getCpuColor(config.cpuTarget)].main,
                      },
                    }}
                  />
                </Box>

                <Alert
                  severity={getCpuColor(config.cpuTarget)}
                  icon={
                    config.cpuTarget > 80 ? (
                      <ErrorOutline />
                    ) : config.cpuTarget >= 70 ? (
                      <WarningAmber />
                    ) : (
                      <CheckCircleOutline />
                    )
                  }
                  sx={{ mt: 2 }}
                >
                  {getCpuHelperText(config.cpuTarget)}
                </Alert>
              </CardContent>
            </Card>

            {/* Advanced: Schedules */}
            <Divider>
              <Chip label="Advanced Settings" size="small" />
            </Divider>

            <ScheduleForm
              schedules={config.schedules}
              onSchedulesChange={(schedules) => updateConfig({ schedules })}
            />

            <PrometheusMetricForm
              metrics={config.prometheusMetrics}
              onMetricsChange={(prometheusMetrics) =>
                updateConfig({ prometheusMetrics })
              }
            />
          </>
        )}
      </Stack>
    </Box>
  );
};

export default HorizontalScaleSection;
