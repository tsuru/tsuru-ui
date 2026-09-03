import { memo, useCallback, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
  Chip,
  Tooltip,
  Alert,
  Collapse,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CodeIcon from "@mui/icons-material/Code";
import SpeedIcon from "@mui/icons-material/Speed";
import { AppAutoscalePrometheus } from "../../types/app";

interface PrometheusMetricFormProps {
  metrics: AppAutoscalePrometheus[];
  onMetricsChange: (metrics: AppAutoscalePrometheus[]) => void;
}

const SAMPLE_QUERIES = [
  {
    name: "Request Rate",
    query: 'sum(rate(http_requests_total{app="$APP"}[5m]))',
    description: "Requests per second",
  },
  {
    name: "Queue Length",
    query: 'avg(queue_length{app="$APP"})',
    description: "Average message queue depth",
  },
];

interface MetricItemProps {
  metric: AppAutoscalePrometheus;
  index: number;
  onUpdate: (
    index: number,
    field: keyof AppAutoscalePrometheus,
    value: string | number
  ) => void;
  onRemove: (index: number) => void;
}

const MetricItem = memo(
  ({ metric, index, onUpdate, onRemove }: MetricItemProps) => {
    const [expanded, setExpanded] = useState(true);
    const [showSamples, setShowSamples] = useState(false);

    return (
      <Paper
        elevation={2}
        sx={{
          marginBottom: "16px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: "secondary.main",
            boxShadow: 3,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            backgroundColor: "action.hover",
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QueryStatsIcon color="secondary" />
            <Typography variant="subtitle1" fontWeight={500}>
              {metric.name || `Metric ${index + 1}`}
            </Typography>
            {metric.threshold > 0 && (
              <Chip
                icon={<SpeedIcon />}
                label={`Threshold: ${metric.threshold}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Remove metric">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        </Box>
        <Collapse in={expanded}>
          <Box sx={{ padding: "20px" }}>
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  label="Metric Name"
                  value={metric.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g., request_rate"
                  helperText="Unique identifier for this metric trigger"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  label="Threshold"
                  type="number"
                  value={metric.threshold}
                  onChange={(e) =>
                    onUpdate(
                      index,
                      "threshold",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  fullWidth
                  size="small"
                  required
                  inputProps={{ step: "0.1" }}
                  helperText="Target value that triggers scaling"
                />
              </Grid>

              <Grid size={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    PromQL Query
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<CodeIcon />}
                    onClick={() => setShowSamples(!showSamples)}
                  >
                    {showSamples ? "Hide" : "Show"} Examples
                  </Button>
                </Box>

                <Collapse in={showSamples}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Sample queries (replace $APP with your app name):
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {SAMPLE_QUERIES.map((sample, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 1,
                            mb: 1,
                            backgroundColor: "background.paper",
                            borderRadius: 1,
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "action.selected" },
                          }}
                          onClick={() => {
                            onUpdate(index, "query", sample.query);
                            if (!metric.name) {
                              onUpdate(
                                index,
                                "name",
                                sample.name.toLowerCase().replace(/\s+/g, "_")
                              );
                            }
                          }}
                        >
                          <Typography variant="subtitle2">
                            {sample.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="div"
                          >
                            {sample.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              wordBreak: "break-all",
                              color: "secondary.main",
                            }}
                          >
                            {sample.query}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Alert>
                </Collapse>

                <TextField
                  value={metric.query}
                  onChange={(e) => onUpdate(index, "query", e.target.value)}
                  fullWidth
                  size="small"
                  required
                  multiline
                  rows={3}
                  placeholder='e.g., sum(rate(http_requests_total{app="myapp"}[5m]))'
                  helperText="PromQL query that returns a numeric value for scaling decisions"
                  sx={{
                    "& .MuiInputBase-input": {
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                    },
                  }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Prometheus Server URL"
                  value={metric.prometheusAddress}
                  onChange={(e) =>
                    onUpdate(index, "prometheusAddress", e.target.value)
                  }
                  fullWidth
                  size="small"
                  placeholder="https://prometheus.example.com"
                  helperText="Full URL to your Prometheus server, leave empty to use the default"
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
    );
  }
);

MetricItem.displayName = "MetricItem";

const PrometheusMetricForm = memo(
  ({ metrics, onMetricsChange }: PrometheusMetricFormProps) => {
    const addMetric = useCallback(() => {
      onMetricsChange([
        ...metrics,
        {
          name: "",
          threshold: 100,
          query: "",
          prometheusAddress: "",
        },
      ]);
    }, [metrics, onMetricsChange]);

    const removeMetric = useCallback(
      (index: number) => {
        onMetricsChange(metrics.filter((_, i) => i !== index));
      },
      [metrics, onMetricsChange]
    );

    const updateMetric = useCallback(
      (
        index: number,
        field: keyof AppAutoscalePrometheus,
        value: string | number
      ) => {
        const newMetrics = [...metrics];
        newMetrics[index] = {
          ...newMetrics[index],
          [field]: value,
        };
        onMetricsChange(newMetrics);
      },
      [metrics, onMetricsChange]
    );

    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QueryStatsIcon color="action" />
            <Typography variant="h6">Prometheus Metrics</Typography>
            <Chip
              label={`${metrics.length} metric${
                metrics.length !== 1 ? "s" : ""
              }`}
              size="small"
              color={metrics.length > 0 ? "secondary" : "default"}
            />
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={addMetric}
            size="small"
          >
            Add Metric
          </Button>
        </Box>

        {metrics.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No custom metrics configured. Add Prometheus metrics for advanced
            scaling based on application-specific data.
          </Alert>
        )}

        {metrics.map((metric, index) => (
          <MetricItem
            key={index}
            metric={metric}
            index={index}
            onUpdate={updateMetric}
            onRemove={removeMetric}
          />
        ))}
      </Box>
    );
  }
);

PrometheusMetricForm.displayName = "PrometheusMetricForm";

export default PrometheusMetricForm;
