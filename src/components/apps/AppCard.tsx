import { FunctionComponent } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "../base/JoyLink";
import config from "../../config";
import { Chip, useTheme, alpha, CardActionArea } from "@mui/material";

type AppCardProps = {
  appName: string;
  platform?: string;
  poolName?: string;
  units: {
    ready: number;
    error: number;
    total: number;
    started?: number;
    starting?: number;
    created?: number;
  };
};

const AppCard: FunctionComponent<AppCardProps> = ({
  appName,
  units,
  platform,
  poolName,
}) => {
  const fullHealthy = units.ready === units.total && units.total > 0;

  // Failures outside production are shown as a warning rather than a danger,
  // but only where the deployment has said which of its pools are production.
  // Pool naming is a per-deployment convention, so without that every pool is
  // treated alike and the real severity is shown.
  const productionPoolRegex = config.productionPoolRegex;
  const isNonProductionPool = productionPoolRegex
    ? !(poolName && productionPoolRegex.test(poolName))
    : false;

  const theme = useTheme();
  let secondaryText: string = "";
  let color: string | undefined = undefined;

  if (fullHealthy) {
    secondaryText = `${units.ready}/${units.total} units ready`;
  } else if (units.total === 0) {
    secondaryText = `stopped`;
  } else if (units.error > 0) {
    color = "danger";
    secondaryText = `${units.error} units with errors`;
  } else if ((units.started || 0) > 0) {
    color = "danger";
    secondaryText = `${units.started} units with missing healthcheck`;
  } else if ((units.starting || 0) > 0) {
    color = "warning";
    secondaryText = `${units.starting} units starting`;
  } else if ((units.created || 0) > 0) {
    color = "warning";
    secondaryText = `${units.created} units is waiting to start`;
  }

  if (isNonProductionPool && color === "danger") {
    color = "warning";
  }

  let textColor = !fullHealthy ? "text.disabled" : "text.tertiary";
  if (color === "danger" || color === "warning") {
    textColor = "text.primary";
  }

  return (
    <Card
      variant={fullHealthy && units.total > 0 ? "outlined" : "elevation"}
      sx={{
        minWidth: 320,
        flex: "1 0 24%",
        position: "relative",
        backgroundColor:
          color === "danger"
            ? alpha(theme.palette.error.main, 0.08)
            : color === "warning"
            ? alpha(theme.palette.warning.main, 0.08)
            : undefined,
        color: textColor,
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <CardActionArea href={`/apps/${appName}`} LinkComponent={Link}>
        <CardContent>
          <Typography fontSize="sm" aria-describedby="card-description" mb={1}>
            {appName}
          </Typography>
          <Typography variant="body2">{secondaryText}</Typography>
        </CardContent>

        {platform && (
          <div>
            <Chip
              label={platform}
              size="small"
              sx={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}
              color="primary"
            />
          </div>
        )}
      </CardActionArea>
    </Card>
  );
};

export default AppCard;
