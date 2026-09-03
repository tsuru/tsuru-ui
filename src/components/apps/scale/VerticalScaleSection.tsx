import { FunctionComponent, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Autocomplete,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Tooltip,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Memory,
  RestartAlt,
  CheckCircle,
  SwapHoriz,
} from "@mui/icons-material";
import { App } from "../../../types/app";

type Plan = {
  name: string;
};

type ProcessPlanConfig = {
  currentPlan: string;
  newPlan: string;
};

type VerticalScaleSectionProps = {
  processName: string;
  app: App;
  plans: Plan[];
  processConfig: ProcessPlanConfig | undefined;
  onProcessConfigChange: (configs: ProcessPlanConfig) => void;
  noRestart: boolean;
  onNoRestartChange: (value: boolean) => void;
};

const VerticalScaleSection: FunctionComponent<VerticalScaleSectionProps> = ({
  app,
  processName,
  plans,
  processConfig,
  onProcessConfigChange,
  noRestart,
  onNoRestartChange,
}) => {
  const config = processConfig || {
    currentPlan: "$default",
    newPlan: "$default",
  };

  const theme = useTheme();

  const planOptions = useMemo(() => plans.map((p) => p.name), [plans]);

  const handlePlanChange = (newPlan: string) => {
    const updated = processConfig
      ? { ...processConfig, newPlan }
      : {
          currentPlan: "$default",
          newPlan,
        };
    onProcessConfigChange(updated);
  };

  const resetToDefault = () => {
    handlePlanChange("$default");
  };

  const hasChange = config.newPlan !== config.currentPlan;
  const effectivePlan =
    config.newPlan === "$default" ? app.plan.name : config.newPlan;

  return (
    <Box>
      <Stack spacing={2}>
        {/* Header info */}
        <Alert severity="info" icon={<Memory />}>
          <Typography variant="body2">
            <strong>Vertical scaling</strong> allows you to change the plan
            (CPU/memory) for each process individually. Processes with plan{" "}
            <Chip label="$default" size="small" sx={{ mx: 0.5 }} />
            use the application's default plan: <strong>{app.plan.name}</strong>
          </Typography>
        </Alert>

        {/* Process card */}
        <Stack spacing={1.5}>
          <Card
            variant="outlined"
            sx={{
              borderColor: hasChange
                ? alpha(theme.palette.warning.main, 0.5)
                : alpha(theme.palette.divider, 0.3),
              bgcolor: hasChange
                ? alpha(theme.palette.warning.main, 0.02)
                : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              {/* Process header */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ cursor: "pointer" }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: hasChange
                        ? alpha(theme.palette.warning.main, 0.1)
                        : alpha(theme.palette.primary.main, 0.1),
                      color: hasChange
                        ? theme.palette.warning.main
                        : theme.palette.primary.main,
                    }}
                  >
                    <Memory fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {processName}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {hasChange ? (
                          <>
                            <span style={{ textDecoration: "line-through" }}>
                              {config.currentPlan === "$default"
                                ? app.plan.name
                                : config.currentPlan}
                            </span>
                            {" → "}
                            <strong>{effectivePlan}</strong>
                          </>
                        ) : (
                          <>
                            Plan:{" "}
                            <strong>
                              {config.currentPlan === "$default"
                                ? `${app.plan.name} (default)`
                                : config.currentPlan}
                            </strong>
                          </>
                        )}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  {hasChange && (
                    <Chip
                      icon={<SwapHoriz sx={{ fontSize: 16 }} />}
                      label="Changed"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="flex-start"
                >
                  <Autocomplete
                    options={["$default", ...planOptions]}
                    value={config.newPlan}
                    onChange={(_, value) =>
                      handlePlanChange(value || "$default")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Plan"
                        size="small"
                        helperText={
                          config.newPlan === "$default"
                            ? `Uses default plan: ${app.plan.name}`
                            : undefined
                        }
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          width="100%"
                        >
                          <Typography>
                            {option === "$default"
                              ? `$default (${app.plan.name})`
                              : option}
                          </Typography>
                          {option === config.currentPlan && (
                            <Chip
                              label="current"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ ml: "auto" }}
                            />
                          )}
                        </Stack>
                      </li>
                    )}
                    sx={{ minWidth: 280 }}
                    disableClearable
                  />

                  {config.newPlan !== "$default" && (
                    <Tooltip title="Use application's default plan">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RestartAlt />}
                        onClick={(e) => {
                          e.stopPropagation();
                          resetToDefault();
                        }}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Reset
                      </Button>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Summary and options */}
        {hasChange && (
          <>
            <Divider />

            <Card
              variant="outlined"
              sx={{ bgcolor: alpha(theme.palette.warning.main, 0.03) }}
            >
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Summary of changes
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircle color="warning" sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      <strong>{processName}</strong>:{" "}
                      {config.currentPlan === "$default"
                        ? app.plan.name
                        : config.currentPlan}{" "}
                      →{" "}
                      {config.newPlan === "$default"
                        ? app.plan.name
                        : config.newPlan}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={noRestart}
                      onChange={(e) => onNoRestartChange(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body2" fontWeight={500}>
                        Apply without restart
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Changes will be applied on next deploy
                      </Typography>
                    </Stack>
                  }
                />

                {!noRestart && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Units will be restarted to apply the new plan.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default VerticalScaleSection;
