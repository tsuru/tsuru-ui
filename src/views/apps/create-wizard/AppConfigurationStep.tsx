import { FunctionComponent } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Stack,
  Card,
  CardContent,
  alpha,
  useTheme,
  Grid,
  InputAdornment,
  CircularProgress,
  Collapse,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Apps,
  CloudQueue,
  People,
  Code,
  LocalOffer,
  CheckCircle,
  ErrorOutline,
} from "@mui/icons-material";
import { Pool } from "../../../types/provisioner";
import PlatformIcon from "../../../components/apps/PlatformIcon";
import DisplayError from "../../../components/base/DisplayError";
import { usePlatforms, usePools } from "../../../hooks/provisioner";
import { useTeams } from "../../../hooks/auth";
import config from "../../../config";
import { AppFormData, CreateMethod } from "./types";

type AppConfigurationStepProps = {
  formData: Partial<AppFormData>;
  onChange: (data: Partial<AppFormData>) => void;
  createMethod?: CreateMethod;
};

type FormSectionProps = {
  title: string;
  subtitle?: string;
  icon: typeof Apps;
  children: React.ReactNode;
  status?: "complete" | "incomplete" | "error";
};

const FormSection: FunctionComponent<FormSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  children,
  status,
}) => {
  const theme = useTheme();

  // A section whose content is entirely config-driven renders nothing when
  // that config is absent, instead of an empty card.
  if (!children) {
    return null;
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor:
                status === "complete"
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.1),
              color:
                status === "complete"
                  ? theme.palette.success.main
                  : theme.palette.primary.main,
              flexShrink: 0,
            }}
          >
            {status === "complete" ? (
              <CheckCircle sx={{ fontSize: 20 }} />
            ) : status === "error" ? (
              <ErrorOutline sx={{ fontSize: 20, color: "error.main" }} />
            ) : (
              <Icon sx={{ fontSize: 20 }} />
            )}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={subtitle ? 0.5 : 1.5}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {title}
              </Typography>
            </Stack>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                {subtitle}
              </Typography>
            )}
            {children}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const hasPoolGroups = (): boolean => Boolean(config.appPoolGroups?.length);

const filterPools = (
  allPools: Array<Pool>,
  poolGroup?: string,
  team?: string
): Array<Pool> => {
  // Without pool groups there is no environment to narrow by, so every pool
  // the team is allowed into is offered directly. A pool listing no team is
  // unrestricted, so it stays in the list.
  if (!hasPoolGroups()) {
    if (!team) {
      return allPools;
    }
    return allPools.filter(
      (p) => !p.allowed?.team?.length || p.allowed.team.includes(team)
    );
  }

  if (!poolGroup) {
    return [];
  }

  for (const fullPoolGroup of config.appPoolGroups || []) {
    if (fullPoolGroup.name !== poolGroup) {
      continue;
    }

    let pools = allPools.filter((pool) => pool.Name.match(fullPoolGroup.regex));

    if (fullPoolGroup.ignoreRegex !== undefined) {
      pools = pools.filter(
        (pool) => !pool.Name.match(fullPoolGroup.ignoreRegex || "")
      );
    }
    if (!team) {
      return pools;
    }
    return pools.filter((p) => p.allowed.team.includes(team));
  }
  return [];
};

const AppConfigurationStep: FunctionComponent<AppConfigurationStepProps> = ({
  formData,
  onChange,
}) => {
  const theme = useTheme();

  const platformsAvailable = usePlatforms();
  const poolsAvailable = usePools();
  const teamsAvailable = useTeams();

  const teamsNamesAvailable = teamsAvailable.value
    ? teamsAvailable.value.map((t) => t.name).sort()
    : [];

  const filteredPools = filterPools(
    poolsAvailable.value || [],
    formData.poolGroup,
    formData.team
  );

  const handlePoolGroupChange = (poolGroup: string) => {
    const selectedPoolGroup = config.appPoolGroups?.find(
      (pg) => pg.name === poolGroup
    );

    let newAppName = formData.appName || "";
    const currentSuffix = formData.suggestedSuffix || "";

    if (selectedPoolGroup?.suggestedSuffix) {
      if (
        formData.appName &&
        currentSuffix &&
        formData.appName.endsWith(currentSuffix)
      ) {
        newAppName = formData.appName.replace(
          currentSuffix,
          selectedPoolGroup.suggestedSuffix
        );
      } else if (formData.appName) {
        newAppName = formData.appName + selectedPoolGroup.suggestedSuffix;
      }
      onChange({
        poolGroup,
        appName: newAppName,
        pool: "",
        suggestedSuffix: selectedPoolGroup.suggestedSuffix,
      });
    } else {
      onChange({
        poolGroup,
        appName: newAppName,
        pool: "",
        suggestedSuffix: "",
      });
    }
  };

  const isAppNameValid = formData.appName && formData.appName.length >= 2;
  const isPoolGroupComplete = Boolean(formData.poolGroup);
  const isPlatformComplete = Boolean(formData.platform);
  const isTeamComplete = Boolean(formData.team);
  const isTagsComplete = Boolean(formData.tags && formData.tags.length > 0);
  const isPoolComplete = Boolean(formData.pool);

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Configure your application
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details below to set up your new application
        </Typography>
      </Box>
      <Stack spacing={2.5}>
        <FormSection
          title="Application Name"
          subtitle="Choose a unique name for your application (min. 2 characters)"
          icon={Apps}
          status={isAppNameValid ? "complete" : undefined}
        >
          <TextField
            fullWidth
            placeholder="my-awesome-app"
            value={formData.appName || ""}
            onChange={(e) => onChange({ appName: e.target.value })}
            variant="outlined"
            size="small"
            inputProps={{ maxLength: 40 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Apps sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: formData.appName &&
                formData.appName.length >= 2 && (
                  <InputAdornment position="end">
                    <CheckCircle sx={{ fontSize: 18, color: "success.main" }} />
                  </InputAdornment>
                ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: alpha(theme.palette.background.default, 0.5),
              },
            }}
          />
          {formData.appName && formData.appName.length < 2 && (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ mt: 0.5, display: "block" }}
            >
              Name must be at least 2 characters
            </Typography>
          )}
        </FormSection>

        <FormSection
          title="Deployment Environment"
          subtitle="Select where your application will be deployed"
          icon={CloudQueue}
          status={isPoolGroupComplete ? "complete" : undefined}
        >
          {hasPoolGroups() && (
            <Grid container spacing={1.5}>
              {config.appPoolGroups?.map((poolGroup) => (
                <Grid
                  key={poolGroup.name}
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <Card
                    elevation={0}
                    onClick={() => handlePoolGroupChange(poolGroup.name)}
                    sx={{
                      cursor: "pointer",
                      border: `2px solid ${
                        formData.poolGroup === poolGroup.name
                          ? theme.palette.primary.main
                          : alpha(theme.palette.divider, 0.15)
                      }`,
                      borderRadius: 2,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor:
                          formData.poolGroup === poolGroup.name
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.3),
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {poolGroup.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {poolGroup.description}
                          </Typography>
                        </Box>
                        {formData.poolGroup === poolGroup.name && (
                          <CheckCircle
                            sx={{ color: "primary.main", fontSize: 20 }}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </FormSection>

        <FormSection
          title="Platform"
          subtitle="Select the runtime environment for your application"
          icon={Code}
          status={isPlatformComplete ? "complete" : undefined}
        >
          {platformsAvailable.error && (
            <DisplayError error={platformsAvailable.error} />
          )}
          {platformsAvailable.loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Loading platforms...
              </Typography>
            </Box>
          )}
          {platformsAvailable.value && (
            <FormControl fullWidth size="small">
              <InputLabel>Select platform</InputLabel>
              <Select
                value={formData.platform || ""}
                onChange={(e) => onChange({ platform: e.target.value })}
                label="Select platform"
                sx={{
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                }}
              >
                {platformsAvailable.value
                  .filter((p) => !p.Disabled)
                  .map((platform) => (
                    <MenuItem key={platform.Name} value={platform.Name}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PlatformIcon platform={platform.Name} />
                      </ListItemIcon>
                      <ListItemText>{platform.Name}</ListItemText>
                    </MenuItem>
                  ))}
                <MenuItem value="dockerfile">
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PlatformIcon platform="docker" />
                  </ListItemIcon>
                  <ListItemText>Dockerfile</ListItemText>
                </MenuItem>
              </Select>
            </FormControl>
          )}
        </FormSection>

        <FormSection
          title="Team Ownership"
          subtitle="Which team will be responsible for maintaining this application?"
          icon={People}
          status={isTeamComplete ? "complete" : undefined}
        >
          {teamsAvailable.error && (
            <DisplayError error={teamsAvailable.error} />
          )}
          {teamsAvailable.loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Loading teams...
              </Typography>
            </Box>
          )}
          {teamsAvailable.value && (
            <Autocomplete
              options={teamsNamesAvailable}
              value={formData.team || null}
              onChange={(_, value) => onChange({ team: value || "", pool: "" })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for your team..."
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    },
                  }}
                />
              )}
            />
          )}
        </FormSection>

        <FormSection
          title="Tags"
          subtitle="Add tags to help organize and categorize this application"
          icon={LocalOffer}
          status={isTagsComplete ? "complete" : undefined}
        >
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={formData.tags || []}
            onChange={(_, value) => onChange({ tags: value })}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Type a tag and press Enter..."
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  },
                }}
              />
            )}
          />
        </FormSection>

        <Collapse
          in={Boolean(
            formData.team && (!hasPoolGroups() || formData.poolGroup)
          )}
        >
          <FormSection
            title="Pool"
            subtitle="Select the infrastructure pool for your application"
            icon={CloudQueue}
            status={isPoolComplete ? "complete" : undefined}
          >
            {poolsAvailable.error && (
              <DisplayError error={poolsAvailable.error} />
            )}
            {poolsAvailable.loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Loading pools...
                </Typography>
              </Box>
            )}
            {!poolsAvailable.loading && filteredPools.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Select pool</InputLabel>
                <Select
                  value={formData.pool || ""}
                  onChange={(e) => onChange({ pool: e.target.value })}
                  label="Select pool"
                  sx={{
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  {filteredPools.map((pool) => (
                    <MenuItem key={pool.Name} value={pool.Name}>
                      {pool.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {!poolsAvailable.loading && filteredPools.length === 0 && (
              <Alert severity="warning" variant="outlined">
                No pools available for this combination.
                {config.supportMessage && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    {config.supportMessage}
                  </Typography>
                )}
              </Alert>
            )}
          </FormSection>
        </Collapse>
      </Stack>
    </Box>
  );
};

export default AppConfigurationStep;
