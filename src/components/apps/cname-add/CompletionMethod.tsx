import { FunctionComponent } from "react";
import MethodSelectionStepBase from "../../wizard/MethodSelectionStep";
import { CreateMethod, MethodMessages } from "../../wizard/types";

type CompletionMethodProps = {
  selectedMethod?: CreateMethod;
  onSelect: (method: CreateMethod) => void;
};

const methodMessages: MethodMessages = {
  cli: "You'll run tsuru commands to add the CNAME and configure the certificate issuer.",
  terraform:
    "Use Terraform resources to manage your CNAME and certificate as code.",
  web: "The CNAME and certificate will be configured directly through this interface.",
};

const CompletionMethod: FunctionComponent<CompletionMethodProps> = ({
  selectedMethod,
  onSelect,
}) => {
  return (
    <MethodSelectionStepBase
      selectedMethod={selectedMethod}
      onSelect={onSelect}
      resourceType="CNAME"
      methodMessages={methodMessages}
    />
  );
};

export default CompletionMethod;
