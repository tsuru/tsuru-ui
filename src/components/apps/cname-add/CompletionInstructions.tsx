import { FunctionComponent } from "react";
import { Typography, Stack } from "@mui/material";
import CodeBlock from "../../base/CodeBlock";

type CompletionInstructionsProps = {
  method: "cli" | "terraform";
  appName: string;
  cname: string;
  issuer: string | null;
};

const CompletionInstructions: FunctionComponent<
  CompletionInstructionsProps
> = ({ method, appName, cname, issuer }) => {
  if (method === "terraform") {
    const terraformCode = issuer
      ? `# Documentation: https://registry.terraform.io/providers/tsuru/tsuru/latest/docs/resources/app_cname

resource "tsuru_app_cname" "app-extra-cname" {
    app         = "${appName}"
    hostname    = "${cname}"
}

resource "tsuru_certificate_issuer" "app-certificate" {
    app         = "${appName}"
    cname       = tsuru_app_cname.app-extra-cname.hostname
    issuer      = "${issuer}"
}`
      : `# Documentation: https://registry.terraform.io/providers/tsuru/tsuru/latest/docs/resources/app_cname

resource "tsuru_app_cname" "app-extra-cname" {
    app         = "${appName}"
    hostname    = "${cname}"
}`;

    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Add the following to your Terraform configuration:
        </Typography>
        <CodeBlock code={terraformCode} language="hcl" title="main.tf" />
      </Stack>
    );
  }

  const cliCode = issuer
    ? `# Add the CNAME
tsuru cname add \\
    --app ${appName} \\
    ${cname}

# Configure the certificate issuer
tsuru certificate issuer set -a ${appName} -c ${cname} ${issuer}`
    : `# Add the CNAME
tsuru cname add \\
    --app ${appName} \\
    ${cname}`;

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Run the following commands:
      </Typography>
      <CodeBlock code={cliCode} language="bash" title="Terminal" />
    </Stack>
  );
};

export default CompletionInstructions;
