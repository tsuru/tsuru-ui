import { FunctionComponent, ReactNode } from "react";
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  alpha,
  useTheme,
  Fade,
} from "@mui/material";
import { StepIconProps } from "@mui/material/StepIcon";
import { styled } from "@mui/material/styles";
import { stepConnectorClasses } from "@mui/material/StepConnector";
import { Settings } from "@mui/icons-material";
import { WizardStepConfig } from "./types";

type WizardContainerProps = {
  activeStep: number;
  children: ReactNode;
  title: string;
  subtitle: string;
  steps: WizardStepConfig[];
};

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: alpha(theme.palette.divider, 0.2),
    borderRadius: 1,
  },
}));

const StepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  zIndex: 1,
  color: alpha(theme.palette.text.primary, 0.5),
  width: 44,
  height: 44,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.3s ease-in-out",
  ...(ownerState.active && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
  }),
  ...(ownerState.completed && {
    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    color: theme.palette.success.contrastText,
  }),
}));

const WizardContainer: FunctionComponent<WizardContainerProps> = ({
  activeStep,
  children,
  title,
  subtitle,
  steps,
}) => {
  const theme = useTheme();

  const CustomStepIcon: FunctionComponent<StepIconProps> = ({
    active,
    completed,
    icon,
  }) => {
    const iconIndex =
      typeof icon === "number" ? icon : parseInt(String(icon), 10);
    const IconComponent = steps[iconIndex - 1]?.icon || Settings;
    return (
      <StepIconRoot ownerState={{ active, completed }}>
        <IconComponent sx={{ fontSize: 20 }} />
      </StepIconRoot>
    );
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", pb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95
          )} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: "blur(20px)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<CustomConnector />}
          sx={{ mb: 5 }}
        >
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Fade in timeout={400}>
          <Box>{children}</Box>
        </Fade>
      </Paper>
    </Box>
  );
};

export default WizardContainer;
