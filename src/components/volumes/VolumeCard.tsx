import { FunctionComponent } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Link from "../base/JoyLink";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { CardActionArea } from "@mui/material";

type VolumeCardProps = {
  volumeName: string;
  planName: string;
};

const VolumeCard: FunctionComponent<VolumeCardProps> = ({
  volumeName,
  planName,
}) => {
  let icon = null;
  if (planName === "nfs") {
    icon = <FolderSharedIcon />;
  } else if (planName.startsWith("gcp-ephemeral")) {
    icon = <CloudCircleIcon />;
  } else if (planName === "emptydir") {
    icon = <FolderOpenIcon />;
  }

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
      <CardActionArea href={`/volumes/${volumeName}`} LinkComponent={Link}>
        <CardContent>
          <Typography
            variant="body2"
            aria-describedby="card-description"
            mb={1}
          >
            {volumeName}
          </Typography>
          <Typography variant="body2">{planName}</Typography>
        </CardContent>

        <div>
          <IconButton
            size="small"
            disabled
            sx={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}
          >
            {icon}
          </IconButton>
        </div>
      </CardActionArea>
    </Card>
  );
};

export default VolumeCard;
