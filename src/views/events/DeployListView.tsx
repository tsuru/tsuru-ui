import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import EventList from "../../components/events/EventList";
import { Box } from "@mui/material";
import { useTitle } from "react-use";

const DeployListView = () => {
  useTitle("Deploys");

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography color="text.primary">Deploys</Typography>
      </Breadcrumbs>
      <Box sx={{ position: "relative" }}>
        <EventList kind="app.deploy" />
      </Box>
    </>
  );
};

export default DeployListView;
