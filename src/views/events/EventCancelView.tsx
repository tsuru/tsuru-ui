import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import Link from "../../components/base/MuiLink";
import Title from "../../components/base/Title";
import Subtitle from "../../components/base/Subtitle";
import DisplayError from "../../components/base/DisplayError";
import Loading from "../Loading";
import EventChip from "../../components/events/EventChip";
import { useTsuruEvent, useCancelEvent } from "../../hooks/events";
import { getOwnerString } from "../../types/events";
import time from "../../utils/time";
import { useTitle } from "react-use";

const DEFAULT_REASON = "Cancelled by user request";

const EventCancelView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const eventID = params.eventID as string;

  const event = useTsuruEvent(eventID);
  const {
    cancelEvent,
    loading,
    error: cancelError,
    success,
  } = useCancelEvent();
  const [reason, setReason] = useState("");

  useTitle(`Cancel Event: ${eventID}`);

  if (event.error) {
    return <DisplayError error={event.error} />;
  }

  if (event.loading || !event.value) {
    return <Loading />;
  }

  const breadcrumbs = (
    <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
      <Link underline="hover" color="inherit" href="/events">
        Events
      </Link>
      <Link underline="hover" color="inherit" href={`/events/${eventID}`}>
        {event.value.Kind.Name}
      </Link>
      <Typography color="text.primary">Cancel</Typography>
    </Breadcrumbs>
  );

  if (!event.value.Running) {
    return (
      <>
        {breadcrumbs}
        <Alert severity="info" sx={{ marginTop: "20px" }}>
          This event is no longer running and cannot be cancelled.
        </Alert>
        <Box sx={{ marginTop: "20px" }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/events/${eventID}`)}
          >
            Back to Event
          </Button>
        </Box>
      </>
    );
  }

  if (success) {
    return (
      <>
        {breadcrumbs}
        <Alert severity="success" sx={{ marginTop: "20px" }}>
          Cancellation request sent successfully. The event will stop shortly.
        </Alert>
        <Box sx={{ marginTop: "20px" }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/events/${eventID}`)}
          >
            Back to Event
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      {breadcrumbs}

      <Title>Cancel Running Event</Title>

      <Paper
        variant="outlined"
        sx={{ padding: "20px", marginTop: "20px", marginBottom: "20px" }}
      >
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            Action
          </Typography>
          <Typography
            variant="body1"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {event.value.Kind.Name} <EventChip event={event.value} />
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="overline" color="text.secondary">
            Target
          </Typography>
          <Typography variant="body1">
            {event.value.Target.Type}:{" "}
            <strong>{event.value.Target.Value}</strong>
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Started by
              </Typography>
              <Typography variant="body1">
                {getOwnerString(event.value)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Started at
              </Typography>
              <Typography variant="body1">
                {time.humanDateWithWeek(event.value.StartTime)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Alert severity="warning" sx={{ marginBottom: "24px" }}>
        Cancelling this event will interrupt the ongoing operation. This action
        cannot be undone.
      </Alert>

      <Subtitle>Reason for cancellation</Subtitle>

      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder={DEFAULT_REASON}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        helperText="Optionally describe why you are cancelling this event."
        sx={{ marginTop: "8px", marginBottom: "24px" }}
      />

      {cancelError && <DisplayError error={cancelError} />}

      <ButtonGroup sx={{ marginTop: cancelError ? "16px" : 0 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<BlockIcon />}
          disabled={loading}
          onClick={() => cancelEvent(eventID, reason || DEFAULT_REASON)}
        >
          {loading ? "Cancelling..." : "Cancel Event"}
        </Button>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => navigate(`/events/${eventID}`)}
        >
          Go Back
        </Button>
      </ButtonGroup>
    </>
  );
};

export default EventCancelView;
