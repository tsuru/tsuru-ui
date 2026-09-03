import { useState } from "react";

import Console from "../base/Console";
import { Button } from "@mui/material";
import Subtitle from "../base/Subtitle";

type EventDebugInfoProps = {
  title: string;
  marginTop?: string;
  data: Object;
};

const EventDebugInfo = (props: EventDebugInfoProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Subtitle>{props.title}</Subtitle>
      <Button
        size="small"
        color="info"
        variant="outlined"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "hide details" : "show details"}
      </Button>
      {expanded && (
        <Console whiteSpace="pre">
          {JSON.stringify(props.data, null, 2)}
        </Console>
      )}
    </>
  );
};

export default EventDebugInfo;
