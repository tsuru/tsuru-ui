import { FunctionComponent } from "react";
import MethodSelectionStepBase from "../../../components/wizard/MethodSelectionStep";
import { CreateMethod, MethodMessages } from "../../../components/wizard/types";

type MethodSelectionStepProps = {
  selectedMethod?: CreateMethod;
  onSelect: (method: CreateMethod) => void;
};

const methodMessages: MethodMessages = {
  cli: "You'll need to install tsuru-client on your machine to use the CLI.",
  terraform:
    "Make sure you have Terraform installed and configured for your environment.",
  web: "The app will be created directly through this interface. You can migrate to Terraform later.",
};

const MethodSelectionStep: FunctionComponent<MethodSelectionStepProps> = ({
  selectedMethod,
  onSelect,
}) => {
  return (
    <MethodSelectionStepBase
      selectedMethod={selectedMethod}
      onSelect={onSelect}
      resourceType="app"
      methodMessages={methodMessages}
    />
  );
};

export default MethodSelectionStep;
