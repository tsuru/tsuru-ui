import { FunctionComponent, useState, useMemo } from "react";
import { useTitle } from "react-use";
import {
  Box,
  Breadcrumbs,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  Fade,
} from "@mui/material";
import {
  NavigateNext,
  Apps,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";

import Link from "../../../components/base/MuiLink";
import config from "../../../config";

import WizardContainer from "./WizardContainer";
import MethodSelectionStep from "./MethodSelectionStep";
import AppConfigurationStep from "./AppConfigurationStep";
import InstructionsStep from "./InstructionsStep";
import SuccessStep from "./SuccessStep";
import { AppFormData, CreateMethod, WizardStep } from "./types";

const STEPS: WizardStep[] = ["method", "configure", "instructions", "success"];

const AppCreateWizard: FunctionComponent = () => {
  useTitle("Create app");
  const theme = useTheme();

  const [currentStep, setCurrentStep] = useState<WizardStep>("method");
  const [formData, setFormData] = useState<Partial<AppFormData>>({});
  const [webAppCreated, setWebAppCreated] = useState(false);

  const stepIndex = STEPS.indexOf(currentStep);

  const updateFormData = (data: Partial<AppFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const isStep1Valid = Boolean(formData.createMethod);

  const isStep2Valid = useMemo(() => {
    // The pool group is only part of the form when the deployment configures
    // pool groups; otherwise the pool is picked directly.
    const poolGroupRequired = Boolean(config.appPoolGroups?.length);

    return Boolean(
      formData.appName &&
        formData.appName.length >= 2 &&
        formData.platform &&
        formData.team &&
        formData.pool &&
        (!poolGroupRequired || formData.poolGroup)
    );
  }, [formData]);

  const canProceed = () => {
    switch (currentStep) {
      case "method":
        return isStep1Valid;
      case "configure":
        return isStep2Valid;
      case "instructions":
        if (formData.createMethod === "web") {
          return webAppCreated;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];

      if (nextStep === "success" && formData.createMethod !== "web") {
        const platformGuide = config.platformGuides?.[formData.platform || ""];
        if (platformGuide) {
          window.open(platformGuide, "_blank");
        }
      }

      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleMethodSelect = (method: CreateMethod) => {
    updateFormData({ createMethod: method });
  };

  const handleWebAppCreated = () => {
    setWebAppCreated(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "method":
        return (
          <MethodSelectionStep
            selectedMethod={formData.createMethod}
            onSelect={handleMethodSelect}
          />
        );
      case "configure":
        return (
          <AppConfigurationStep
            formData={formData}
            onChange={updateFormData}
            createMethod={formData.createMethod}
          />
        );
      case "instructions":
        return (
          <InstructionsStep
            formData={formData as AppFormData}
            onAppCreated={handleWebAppCreated}
          />
        );
      case "success":
        return <SuccessStep formData={formData as AppFormData} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
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
        <Typography
          color="text.primary"
          fontWeight={600}
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          Create New App
        </Typography>
      </Breadcrumbs>

      <WizardContainer activeStep={stepIndex}>
        <Fade in timeout={300} key={currentStep}>
          <Box>{renderStepContent()}</Box>
        </Fade>

        {currentStep !== "success" && (
          <Box sx={{ mt: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                disabled={currentStep === "method"}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  borderColor: alpha(theme.palette.divider, 0.3),
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                Back
              </Button>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Step {stepIndex + 1} of {STEPS.length}
                </Typography>
              </Stack>

              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={handleNext}
                disabled={!canProceed()}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: canProceed()
                    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                    : undefined,
                  boxShadow: canProceed()
                    ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                    : undefined,
                  "&:hover": {
                    boxShadow: canProceed()
                      ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                      : undefined,
                  },
                }}
              >
                {currentStep === "instructions"
                  ? "Complete"
                  : formData.createMethod === "web" &&
                    currentStep === "configure"
                  ? "Create App"
                  : "Continue"}
              </Button>
            </Stack>
          </Box>
        )}
      </WizardContainer>
    </Box>
  );
};

export default AppCreateWizard;
