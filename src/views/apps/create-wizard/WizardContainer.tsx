import { FunctionComponent, ReactNode } from "react";
import { Settings, Terminal, Code, CheckCircle } from "@mui/icons-material";
import WizardContainerBase from "../../../components/wizard/WizardContainer";
import { WizardStepConfig } from "../../../components/wizard/types";

type WizardContainerProps = {
  activeStep: number;
  children: ReactNode;
};

const steps: WizardStepConfig[] = [
  { label: "Choose Method", icon: Settings },
  { label: "Configure App", icon: Terminal },
  { label: "Setup Instructions", icon: Code },
  { label: "Complete", icon: CheckCircle },
];

const WizardContainer: FunctionComponent<WizardContainerProps> = ({
  activeStep,
  children,
}) => {
  return (
    <WizardContainerBase
      activeStep={activeStep}
      title="Create New Application"
      subtitle="Set up your application in just a few steps"
      steps={steps}
    >
      {children}
    </WizardContainerBase>
  );
};

export default WizardContainer;
