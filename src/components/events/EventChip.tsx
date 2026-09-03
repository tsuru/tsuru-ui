import { TsuruEvent } from "../../types/events";
import Chip from "@mui/material/Chip";

type EventChipProps = {
  event: TsuruEvent;
};

const EventChip = (props: EventChipProps) => {
  let chip = null;
  if (props.event.Running) {
    chip = <Chip size="small" variant="outlined" label="Running" />;
  } else if (props.event.Error !== "") {
    chip = <Chip size="small" variant="outlined" label="Error" color="error" />;
  }

  return chip;
};

export default EventChip;
