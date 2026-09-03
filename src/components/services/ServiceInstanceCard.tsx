import { FunctionComponent, ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Link from "../base/JoyLink";
import { CardActionArea, Chip } from "@mui/material";

type ServiceInstanceCardProps = {
  name: string;
  description: string;
  service: string;
  icon: ReactNode;
  href: string;
  target?: string;
  showServiceName?: boolean;
};

const ServiceInstanceCard: FunctionComponent<ServiceInstanceCardProps> = ({
  name,
  description,
  service,
  icon,
  href,
  target,
  showServiceName,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 320,
        flex: "1 0 24%",
        position: "relative",
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <CardActionArea href={href} target={target} LinkComponent={Link}>
        <CardContent>
          <Typography fontSize="sm" aria-describedby="card-description" mb={1}>
            {name}
          </Typography>
          <Typography variant="body2">{description}</Typography>
        </CardContent>

        {icon && (
          <div>
            <IconButton
              size="small"
              disabled
              sx={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}
            >
              {icon}
            </IconButton>
          </div>
        )}

        {showServiceName && (
          <Chip
            label={service}
            size="small"
            sx={{ position: "absolute", bottom: "0.5rem", right: "0.5rem" }}
            color="primary"
          />
        )}
      </CardActionArea>
    </Card>
  );
};

export default ServiceInstanceCard;
