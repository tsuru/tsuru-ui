import { memo, useCallback, useMemo } from "react";
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
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { AppAutoscaleSchedule } from "../../types/app";
import { useState } from "react";
import cronstrue from "cronstrue";

interface ScheduleFormProps {
  schedules: AppAutoscaleSchedule[];
  onSchedulesChange: (schedules: AppAutoscaleSchedule[]) => void;
}

const COMMON_TIMEZONES = ["UTC", "America/Sao_Paulo"];

const CRON_PRESETS = [
  { label: "Every day at 6 AM", value: "0 6 * * *" },
  { label: "Every day at 8 AM", value: "0 8 * * *" },
  { label: "Every day at 6 PM", value: "0 18 * * *" },
  { label: "Every day at 7 PM", value: "0 19 * * *" },
  { label: "Weekdays at 8 AM", value: "0 8 * * 1-5" },
  { label: "Weekdays at 6 PM", value: "0 18 * * 1-5" },
];

function parseCronSafe(cron: string): string {
  try {
    return cronstrue.toString(cron);
  } catch {
    return "Invalid cron expression";
  }
}

function validateCron(cron: string): boolean {
  try {
    cronstrue.toString(cron);
    return true;
  } catch {
    return false;
  }
}

interface ScheduleItemProps {
  schedule: AppAutoscaleSchedule;
  index: number;
  onUpdate: (
    index: number,
    field: keyof AppAutoscaleSchedule,
    value: string | number
  ) => void;
  onRemove: (index: number) => void;
}

const ScheduleItem = memo(
  ({ schedule, index, onUpdate, onRemove }: ScheduleItemProps) => {
    const [expanded, setExpanded] = useState(true);

    const startValid = useMemo(
      () => validateCron(schedule.start),
      [schedule.start]
    );
    const endValid = useMemo(() => validateCron(schedule.end), [schedule.end]);

    const startHuman = useMemo(
      () => parseCronSafe(schedule.start),
      [schedule.start]
    );
    const endHuman = useMemo(() => parseCronSafe(schedule.end), [schedule.end]);

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
            borderColor: "primary.main",
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
            <ScheduleIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={500}>
              {schedule.name || `Schedule ${index + 1}`}
            </Typography>
            <Chip
              label={`${schedule.minReplicas} replicas`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip label={schedule.timezone} size="small" variant="outlined" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Remove schedule">
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
                  label="Schedule Name"
                  value={schedule.name || ""}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g., Business Hours Peak"
                  helperText="Optional - helps identify this schedule"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  label="Minimum Replicas"
                  type="number"
                  value={schedule.minReplicas}
                  onChange={(e) =>
                    onUpdate(
                      index,
                      "minReplicas",
                      parseInt(e.target.value) || 0
                    )
                  }
                  inputProps={{ min: 0 }}
                  fullWidth
                  size="small"
                  helperText="Number of replicas during this schedule"
                />
              </Grid>

              <Grid size={12}>
                <Alert
                  severity="info"
                  icon={<InfoOutlinedIcon />}
                  sx={{ mb: 2 }}
                >
                  Use cron expressions to define when scaling rules apply.
                  Format: minute hour day-of-month month day-of-week
                </Alert>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Autocomplete
                  freeSolo
                  options={CRON_PRESETS}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.value
                  }
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.value}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  value={schedule.start}
                  onInputChange={(_, newValue) => {
                    onUpdate(index, "start", newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Start Time (cron)"
                      error={!startValid && schedule.start.length > 0}
                      helperText={
                        schedule.start.length > 0
                          ? startValid
                            ? startHuman
                            : "Invalid cron expression"
                          : "When this schedule becomes active"
                      }
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Autocomplete
                  freeSolo
                  options={CRON_PRESETS}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.value
                  }
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.value}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  value={schedule.end}
                  onInputChange={(_, newValue) => {
                    onUpdate(index, "end", newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="End Time (cron)"
                      error={!endValid && schedule.end.length > 0}
                      helperText={
                        schedule.end.length > 0
                          ? endValid
                            ? endHuman
                            : "Invalid cron expression"
                          : "When this schedule ends"
                      }
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Autocomplete
                  freeSolo
                  options={COMMON_TIMEZONES}
                  value={schedule.timezone}
                  onInputChange={(_, newValue) => {
                    onUpdate(index, "timezone", newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Timezone"
                      size="small"
                      fullWidth
                      helperText="IANA timezone identifier"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
    );
  }
);

ScheduleItem.displayName = "ScheduleItem";

const ScheduleForm = memo(
  ({ schedules, onSchedulesChange }: ScheduleFormProps) => {
    const addSchedule = useCallback(() => {
      onSchedulesChange([
        ...schedules,
        {
          minReplicas: 2,
          start: "0 8 * * 1-5",
          end: "0 18 * * 1-5",
          timezone: "America/Sao_Paulo",
        },
      ]);
    }, [schedules, onSchedulesChange]);

    const removeSchedule = useCallback(
      (index: number) => {
        onSchedulesChange(schedules.filter((_, i) => i !== index));
      },
      [schedules, onSchedulesChange]
    );

    const updateSchedule = useCallback(
      (
        index: number,
        field: keyof AppAutoscaleSchedule,
        value: string | number
      ) => {
        const newSchedules = [...schedules];
        newSchedules[index] = {
          ...newSchedules[index],
          [field]: value,
        };
        onSchedulesChange(newSchedules);
      },
      [schedules, onSchedulesChange]
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
            <ScheduleIcon color="action" />
            <Typography variant="h6">Scheduled Scaling</Typography>
            <Chip
              label={`${schedules.length} schedule${
                schedules.length !== 1 ? "s" : ""
              }`}
              size="small"
              color={schedules.length > 0 ? "primary" : "default"}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addSchedule}
            size="small"
          >
            Add Schedule
          </Button>
        </Box>

        {schedules.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No schedules configured. Add a schedule to automatically adjust
            replicas at specific times.
          </Alert>
        )}

        {schedules.map((schedule, index) => (
          <ScheduleItem
            key={index}
            schedule={schedule}
            index={index}
            onUpdate={updateSchedule}
            onRemove={removeSchedule}
          />
        ))}
      </Box>
    );
  }
);

ScheduleForm.displayName = "ScheduleForm";

export default ScheduleForm;
