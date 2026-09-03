import { FunctionComponent } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  Chip,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";
import {
  Terminal,
  Code,
  Language,
  CheckCircle,
  ArrowForward,
} from "@mui/icons-material";
import { CreateMethod, MethodOption, MethodMessages } from "./types";

type MethodSelectionStepProps = {
  selectedMethod?: CreateMethod;
  onSelect: (method: CreateMethod) => void;
  resourceType: string;
  methodMessages: MethodMessages;
};

const defaultMethodOptions: MethodOption[] = [
  {
    id: "cli",
    title: "Command Line",
    subtitle: "tsuru-client",
    description: "",
    features: ["Quick setup", "Scriptable"],
  },
  {
    id: "terraform",
    title: "Infrastructure as Code",
    subtitle: "Terraform",
    description: "",
    recommended: true,
    features: ["Version controlled", "Reproducible"],
  },
  {
    id: "web",
    title: "Web Interface",
    subtitle: "UI Dashboard",
    description: "",
    features: ["Beginner friendly", "Visual feedback"],
  },
];

const MethodCard: FunctionComponent<{
  option: MethodOption;
  selected: boolean;
  onSelect: () => void;
}> = ({ option, selected, onSelect }) => {
  const theme = useTheme();
  const iconMap = {
    cli: Terminal,
    terraform: Code,
    web: Language,
  };
  const Icon = iconMap[option.id];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `2px solid ${
          selected
            ? theme.palette.primary.main
            : alpha(theme.palette.divider, 0.1)
        }`,
        borderRadius: 3,
        transition: "all 0.2s ease-in-out",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          borderColor: selected
            ? theme.palette.primary.main
            : alpha(theme.palette.primary.main, 0.3),
          transform: "translateY(-2px)",
          boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      {option.recommended && (
        <Chip
          label="Recommended"
          size="small"
          color="primary"
          sx={{
            position: "absolute",
            top: -12,
            right: 16,
            fontWeight: 600,
            fontSize: "0.7rem",
          }}
        />
      )}

      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: theme.palette.primary.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle
            sx={{ fontSize: 16, color: theme.palette.primary.contrastText }}
          />
        </Box>
      )}

      <CardActionArea
        onClick={onSelect}
        sx={{
          height: "100%",
          p: 0,
        }}
      >
        <CardContent sx={{ p: 3, height: "100%" }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: selected
                  ? alpha(theme.palette.primary.main, 0.12)
                  : alpha(theme.palette.primary.main, 0.04),
                color: selected
                  ? theme.palette.primary.main
                  : alpha(theme.palette.text.primary, 0.6),
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {option.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha(theme.palette.primary.main, 0.7),
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {option.subtitle}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexGrow: 1 }}
            >
              {option.description}
            </Typography>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {option.features.map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    height: 24,
                    borderColor: alpha(theme.palette.divider, 0.3),
                  }}
                />
              ))}
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                color: selected
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                transition: "color 0.2s ease-in-out",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {selected ? "Selected" : "Select"}
              </Typography>
              <ArrowForward sx={{ fontSize: 16 }} />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const MethodSelectionStep: FunctionComponent<MethodSelectionStepProps> = ({
  selectedMethod,
  onSelect,
  resourceType,
  methodMessages,
}) => {
  const theme = useTheme();

  const methodOptions = defaultMethodOptions.map((option) => {
    let description = "";
    switch (option.id) {
      case "cli":
        description = `Use the tsuru CLI to create and manage your ${resourceType} with imperative commands.`;
        break;
      case "terraform":
        description = `Define your ${resourceType} infrastructure declaratively using Terraform providers.`;
        break;
      case "web":
        description = `Create your ${resourceType} directly through this web interface with guided forms. Great for quick tests or demonstrations.`;
        break;
    }
    return { ...option, description };
  });

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          How do you want to manage your {resourceType}?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose the method that best fits your workflow and team preferences
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {methodOptions.map((option) => (
          <Grid
            key={option.id}
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <MethodCard
              option={option}
              selected={selectedMethod === option.id}
              onSelect={() => onSelect(option.id)}
            />
          </Grid>
        ))}
      </Grid>
      {selectedMethod && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {methodMessages[selectedMethod]}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MethodSelectionStep;
