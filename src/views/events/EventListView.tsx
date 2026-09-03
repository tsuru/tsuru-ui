import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import EventList from "../../components/events/EventList";
import { Box } from "@mui/material";
import { useTitle } from "react-use";

const EventListView = () => {
  useTitle("Events");

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography color="text.primary">Events</Typography>
      </Breadcrumbs>
      <Box sx={{ position: "relative" }}>
        <EventList />
      </Box>
    </>
  );
};

export default EventListView;
