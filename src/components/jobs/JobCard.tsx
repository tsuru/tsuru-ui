import cronstrue from "cronstrue";
import { FunctionComponent } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Link from "../base/JoyLink";
import Schedule from "@mui/icons-material/Schedule";
import { CardActionArea } from "@mui/material";

type JobCardProps = {
  jobName: string;
  schedule: string;
  manual?: boolean;
};

const JobCard: FunctionComponent<JobCardProps> = ({
  jobName,
  schedule,
  manual,
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
      <CardActionArea href={`/jobs/${jobName}`} LinkComponent={Link}>
        <CardContent>
          <Typography
            variant="body1"
            aria-describedby="card-description"
            mb={1}
          >
            {jobName}
          </Typography>

          {!manual && schedule && (
            <Typography variant="body2">
              {cronstrue.toString(schedule)}
            </Typography>
          )}
        </CardContent>

        <div>
          <IconButton
            size="small"
            disabled
            sx={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}
          >
            {!manual && schedule && <Schedule />}
          </IconButton>
        </div>
      </CardActionArea>
    </Card>
  );
};

export default JobCard;
