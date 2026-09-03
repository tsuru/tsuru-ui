import { FunctionComponent, useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  alpha,
  useTheme,
  Collapse,
  Link,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CheckCircle,
  OpenInNew,
  ExpandMore,
  ExpandLess,
  Terminal,
  Description,
  PlayArrow,
  Link as LinkIcon,
} from "@mui/icons-material";
import DisplayError from "../../../components/base/DisplayError";
import { useFetch } from "../../../contexts/auth";
import config from "../../../config";
import { AppFormData } from "./types";
import CodeBlock from "../../../components/base/CodeBlock";

type InstructionsStepProps = {
  formData: AppFormData;
  onAppCreated?: () => void;
};

type InstructionSectionProps = {
  title: string;
  icon: typeof Terminal;
  children: React.ReactNode;
  defaultExpanded?: boolean;
};

const InstructionSection: FunctionComponent<InstructionSectionProps> = ({
  title,
  icon: Icon,
  children,
  defaultExpanded = true,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          px: 2.5,
          py: 2,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          "&:hover": {
            bgcolor: alpha(theme.palette.action.hover, 0.5),
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
        </Stack>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={expanded}>
        <Divider />
        <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
      </Collapse>
    </Card>
  );
};

const CLIInstructions: FunctionComponent<{ formData: AppFormData }> = ({
  formData,
}) => {
  const createArgs =
    formData.platform === "dockerfile"
      ? formData.appName
      : `${formData.appName} ${formData.platform}`;

  const tagArgs = (formData.tags || [])
    .map((tag) => ` --tag ${tag}`)
    .join("");

  return (
    <Stack spacing={3}>
      <InstructionSection title="Install tsuru-client" icon={Terminal}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          First, make sure you have the tsuru CLI installed on your machine.
        </Typography>
        <Link
          href="https://docs.tsuru.io/user_guides/install_client"
          target="_blank"
          rel="noopener"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontWeight: 600,
          }}
        >
          View installation guide
          <OpenInNew sx={{ fontSize: 16 }} />
        </Link>
      </InstructionSection>

      <InstructionSection title="Create your application" icon={PlayArrow}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Run the following command in your terminal to create the application:
        </Typography>
        <CodeBlock
          code={`tsuru app create ${createArgs} --team ${formData.team} --pool ${formData.pool}${tagArgs}`}
          title="Terminal"
        />
      </InstructionSection>

      <InstructionSection
        title="Next steps"
        icon={Description}
        defaultExpanded={false}
      >
        <List dense disablePadding>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle sx={{ fontSize: 18, color: "text.secondary" }} />
            </ListItemIcon>
            <ListItemText
              primary="Deploy your first version"
              secondary="Use 'tsuru app deploy' to deploy your code"
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle sx={{ fontSize: 18, color: "text.secondary" }} />
            </ListItemIcon>
            <ListItemText
              primary="Configure environment variables"
              secondary="Set up your app configuration with 'tsuru env set'"
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle sx={{ fontSize: 18, color: "text.secondary" }} />
            </ListItemIcon>
            <ListItemText
              primary="Scale your application"
              secondary="Adjust resources with 'tsuru unit add'"
            />
          </ListItem>
        </List>
      </InstructionSection>
    </Stack>
  );
};

const TerraformInstructions: FunctionComponent<{ formData: AppFormData }> = ({
  formData,
}) => {
  const mainTfCode = `terraform {
  required_providers {
    tsuru = {
      source  = "tsuru/tsuru"
      version = ">= 2.1.3"
    }

    rpaas = {
      source  = "tsuru/rpaas"
      version = ">= 0.0.9"
    }
  }
}

provider "rpaas" {
  host = "${config.server}"
}

provider "tsuru" {
  host = "${config.server}"
}`;

  const tagsTfList = (formData.tags || [])
    .map((tag) => `"${tag}"`)
    .join(", ");

  const appTfCode = `resource "tsuru_app" "${formData.appName.replace(
    /-/g,
    "_"
  )}" {
  name           = "${formData.appName}"
  platform       = "${formData.platform}"
  team_owner     = "${formData.team}"
  pool           = "${formData.pool}"
  tags           = [${tagsTfList}]
}`;

  return (
    <Stack spacing={3}>
      <InstructionSection title="Create your repository" icon={Description}>
        <Typography variant="body2" color="text.secondary">
          Create a new directory to store your Terraform configuration files.
          This will be your infrastructure-as-code repository.
        </Typography>
      </InstructionSection>

      <InstructionSection title="Configure main.tf" icon={Terminal}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Create a <code>main.tf</code> file with the provider configuration:
        </Typography>
        <CodeBlock code={mainTfCode} language="hcl" title="main.tf" />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1.5 }}
        >
          You can also configure a Terraform backend for state management.
        </Typography>
      </InstructionSection>

      <InstructionSection title="Create app configuration" icon={Description}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Create a file named <code>{formData.appName}.tf</code> with your app
          resource:
        </Typography>
        <CodeBlock
          code={appTfCode}
          language="hcl"
          title={`${formData.appName}.tf`}
        />
      </InstructionSection>

      <InstructionSection title="Apply configuration" icon={PlayArrow}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Initialize Terraform and apply your configuration:
        </Typography>
        <Stack spacing={1.5}>
          <CodeBlock code="terraform init" title="Terminal" />
          <CodeBlock code="terraform apply" title="Terminal" />
        </Stack>
      </InstructionSection>

      <InstructionSection
        title="Useful resources"
        icon={LinkIcon}
        defaultExpanded={false}
      >
        <List dense disablePadding>
          {[
            {
              title: "Tsuru Provider",
              url: "https://registry.terraform.io/providers/tsuru/tsuru/latest/docs",
            },
            {
              title: "RPaaS Provider",
              url: "https://registry.terraform.io/providers/tsuru/rpaas/latest/docs",
            },
            {
              title: "ACL Provider",
              url: "https://registry.terraform.io/providers/tsuru/acl/latest/docs",
            },
            {
              title: "HCaaS Provider",
              url: "https://registry.terraform.io/providers/tsuru/hcaas/latest/docs",
            },
          ].map((resource) => (
            <ListItem
              key={resource.title}
              disableGutters
              component={Link}
              href={resource.url}
              target="_blank"
              rel="noopener"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <OpenInNew sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary={resource.title} />
            </ListItem>
          ))}
        </List>
      </InstructionSection>
    </Stack>
  );
};

type CreationState = "idle" | "loading" | "success" | "error";

const WebCreation: FunctionComponent<{
  formData: AppFormData;
  onCreated: () => void;
}> = ({ formData, onCreated }) => {
  const theme = useTheme();
  const fetch = useFetch();
  const [state, setState] = useState<CreationState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    const createApp = async () => {
      setState("loading");
      setError(null);

      const data: Record<string, any> = {
        name: formData.appName,
        teamowner: formData.team,
        pool: formData.pool,
        tags: formData.tags || [],
      };

      if (formData.platform !== "dockerfile") {
        data.platform = formData.platform;
      }

      try {
        const response = await fetch(`/apps`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.status > 299) {
          const errorText = await response.text();
          throw new Error(
            errorText || `Could not create app (${response.status})`
          );
        }

        setState("success");
        onCreated();
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    createApp();
  }, [fetch, formData, onCreated]);

  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      {state === "loading" && (
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(0.95)", opacity: 0.7 },
                "50%": { transform: "scale(1.05)", opacity: 1 },
                "100%": { transform: "scale(0.95)", opacity: 0.7 },
              },
            }}
          >
            <Terminal sx={{ fontSize: 36, color: "primary.main" }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Creating your application...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Setting up <strong>{formData.appName}</strong> on {formData.pool}
            </Typography>
          </Box>
        </Stack>
      )}

      {state === "success" && (
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.success.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle sx={{ fontSize: 48, color: "success.main" }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Application created successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>{formData.appName}</strong> is now ready for deployment
            </Typography>
          </Box>
          <Chip
            label="Ready to deploy"
            color="success"
            variant="outlined"
            icon={<CheckCircle />}
          />
        </Stack>
      )}

      {state === "error" && error && (
        <Stack spacing={2} alignItems="center">
          <DisplayError error={error} />
        </Stack>
      )}
    </Box>
  );
};

const InstructionsStep: FunctionComponent<InstructionsStepProps> = ({
  formData,
  onAppCreated,
}) => {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {formData.createMethod === "web"
            ? "Creating your application"
            : "Setup Instructions"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formData.createMethod === "web"
            ? "Your application is being created..."
            : "Follow these steps to create your application"}
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Chip
            label={formData.appName}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip label={formData.platform} size="small" variant="outlined" />
          <Chip label={formData.team} size="small" variant="outlined" />
          <Chip label={formData.pool} size="small" variant="outlined" />
        </Stack>
      </Card>

      {formData.createMethod === "cli" && (
        <CLIInstructions formData={formData} />
      )}
      {formData.createMethod === "terraform" && (
        <TerraformInstructions formData={formData} />
      )}
      {formData.createMethod === "web" && (
        <WebCreation
          formData={formData}
          onCreated={onAppCreated || (() => {})}
        />
      )}
    </Box>
  );
};

export default InstructionsStep;
