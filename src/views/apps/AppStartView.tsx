import { Breadcrumbs, Button, ButtonGroup, Typography } from "@mui/material";
import Link from "../../components/base/MuiLink";
import { useNavigate, useParams } from "react-router-dom";
import Subtitle from "../../components/base/Subtitle";
import { useState } from "react";
import Console from "../../components/base/Console";
import DisplayError from "../../components/base/DisplayError";
import { useAppStreamAction } from "../../hooks/app";
import Title from "../../components/base/Title";

const AppStartView = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [startInitialized, setStartInitialized] = useState(false);

  const { action, stream } = useAppStreamAction(
    `/apps/${params.name}/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    !startInitialized
  );

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href="/apps">
          Apps
        </Link>
        <Link underline="hover" color="inherit" href={`/apps/${params.name}`}>
          {params.name}
        </Link>
        <Typography color="text.primary">Start</Typography>
      </Breadcrumbs>

      {!startInitialized ? (
        <>
          <Title>Do you want to start the app {params.name}?</Title>

          <ButtonGroup sx={{ marginTop: "20px" }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setStartInitialized(true);
              }}
            >
              Start
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/apps/${params.name}`)}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </>
      ) : (
        <>
          <Subtitle>
            {action.error && `Error starting app: ${params.name}`}
            {action.value && `App ${params.name} started successfully!`}
            {!action.value && !action.error && `Starting app ${params.name}...`}
          </Subtitle>

          <Console>{stream}</Console>
          {action.error && <DisplayError error={action.error} />}
          {action.value && (
            <Button
              variant="contained"
              sx={{ marginTop: "20px" }}
              onClick={() => navigate(`/apps/${params.name}`)}
            >
              Back to App
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default AppStartView;
