import { FunctionComponent } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Chip,
  alpha,
  useTheme,
  Grid,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Celebration,
  Rocket,
  ArrowForward,
  OpenInNew,
  Dashboard,
  Terminal,
  Book,
  LocalOffer,
} from "@mui/icons-material";
import Link from "../../../components/base/MuiLink";
import config from "../../../config";
import { AppFormData } from "./types";

type SuccessStepProps = {
  formData: AppFormData;
};

type QuickActionProps = {
  title: string;
  description: string;
  icon: typeof Dashboard;
  href?: string;
  onClick?: () => void;
  external?: boolean;
};

const QuickAction: FunctionComponent<QuickActionProps> = ({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  external,
}) => {
  const theme = useTheme();

  const content = (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.3),
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
          "& .action-arrow": {
            transform: "translateX(4px)",
          },
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {title}
              </Typography>
              {external ? (
                <OpenInNew
                  sx={{ fontSize: 16, color: "text.secondary" }}
                  className="action-arrow"
                />
              ) : (
                <ArrowForward
                  sx={{
                    fontSize: 16,
                    color: "text.secondary",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  className="action-arrow"
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        underline="none"
        sx={{ display: "block", height: "100%" }}
      >
        {content}
      </Link>
    );
  }

  return content;
};

const SuccessStep: FunctionComponent<SuccessStepProps> = ({ formData }) => {
  const theme = useTheme();

  const platformGuide = config.platformGuides?.[formData.platform];

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.success.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
            position: "relative",
          }}
        >
          <CheckCircle sx={{ fontSize: 56, color: "success.main" }} />
          <Celebration
            sx={{
              fontSize: 24,
              color: "warning.main",
              position: "absolute",
              top: 0,
              right: 0,
              transform: "rotate(15deg)",
            }}
          />
        </Box>

        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Congratulations!
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400}>
          Your application is ready
        </Typography>
      </Box>
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.success.main,
            0.05
          )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Rocket sx={{ fontSize: 28, color: "primary.main" }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {formData.appName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Application created successfully
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Platform
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formData.platform}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Team
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formData.team}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Pool
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formData.pool}
              </Typography>
            </Grid>
            {formData.tags && formData.tags.length > 0 && (
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Tags
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      icon={<LocalOffer sx={{ fontSize: 14 }} />}
                    />
                  ))}
                </Stack>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ mb: 2, textAlign: "center" }}
      >
        What would you like to do next?
      </Typography>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <QuickAction
            title="View Application"
            description="Open your app dashboard to manage and monitor"
            icon={Dashboard}
            href={`/apps/${formData.appName}/info`}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <QuickAction
            title="Deploy Guide"
            description="Learn how to deploy your first version"
            icon={Terminal}
            href={platformGuide || config.docsURL}
            external
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <QuickAction
            title="Documentation"
            description="Explore the full Tsuru documentation"
            icon={Book}
            href={config.docsURL}
            external
          />
        </Grid>
      </Grid>
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          component={Link}
          href={`/apps/${formData.appName}/info`}
          endIcon={<ArrowForward />}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            "&:hover": {
              boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          Go to Application Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default SuccessStep;
