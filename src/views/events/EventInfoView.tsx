import React, { Fragment, FunctionComponent, ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import BlockIcon from "@mui/icons-material/Block";
import Link from "../../components/base/MuiLink";

import { getOwnerString } from "../../types/events";
import EventChip from "../../components/events/EventChip";
import Loading from "../Loading";
import time from "../../utils/time";
import Console from "../../components/base/Console";
import DeployLogViewer from "../../components/deploys/DeployLogViewer";
import EventDebugInfo from "../../components/events/EventDebugInfo";
import { hrefForInstance } from "../../utils/services";
import { titleMarginTop } from "../../constants/style";
import Title from "../../components/base/Title";
import Subtitle from "../../components/base/Subtitle";
import { useTitle } from "react-use";
import { useParams } from "react-router-dom";
import DisplayError from "../../components/base/DisplayError";
import { useTsuruEvent } from "../../hooks/events";

const AppEventInfo: FunctionComponent = () => {
  const params = useParams();
  const event = useTsuruEvent(params.eventID as string);

  useTitle(`Event: ${params.eventID}`);

  if (event.error) {
    return <DisplayError error={event.error} />;
  }

  if (event.loading || !event.value) {
    return <Loading />;
  }

  const duration =
    (Date.parse(event.value.EndTime) - Date.parse(event.value.StartTime)) /
    1000;

  const primaryText = `${event.value.Kind.Name} at ${time.humanDateWithWeek(
    event.value.StartTime
  )}`;
  const secondaryText = `by ${getOwnerString(
    event.value
  )}, duration: ${time.humanDuration(duration)}`;

  const startCustomData = event.value.CustomData.Start;
  const endCustomData = event.value.CustomData.End;
  const otherCustomData = event.value.CustomData.Other;

  let eventsLink = "/events";
  if (params.app) {
    eventsLink = `/apps/${params.app}${eventsLink}`;
  }

  const targets = [event.value.Target];
  for (const extraTarget of event.value.ExtraTargets || []) {
    targets.push(extraTarget.Target);
  }
  const targetElems = joinJSX(
    targets.map((t, i) => {
      let href: string | null = null;
      let target: string | undefined = undefined;

      if (t.Type === "app") {
        href = `/apps/${t.Value}`;
      }

      if (t.Type === "job") {
        href = `/jobs/${t.Value}`;
      }

      if (t.Type === "service-instance") {
        const parts = t.Value.split("/");
        if (parts.length === 2) {
          [href, target] = hrefForInstance(parts[0], parts[1]);
        }
      }

      let tsuruTarget: ReactNode = t.Value;

      if (href) {
        tsuruTarget = (
          <Link href={href} target={target}>
            {t.Value}
          </Link>
        );
      }

      return (
        <Fragment key={"target-" + i}>
          {t.Type}: {tsuruTarget}
        </Fragment>
      );
    }),
    ", "
  );

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        {params.app && [
          <Link underline="hover" color="inherit" href="/apps">
            Apps
          </Link>,
          <Link underline="hover" color="inherit" href={`/apps/${params.app}`}>
            {params.app}
          </Link>,
        ]}
        <Link underline="hover" color="inherit" href={eventsLink}>
          Events
        </Link>
        {primaryText && (
          <Typography color="text.primary">{primaryText}</Typography>
        )}
      </Breadcrumbs>

      <Title>{primaryText}</Title>
      <Subtitle>
        {secondaryText} <EventChip event={event.value} />
      </Subtitle>

      {event.value.Running && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<BlockIcon />}
          href={`/events/${params.eventID}/cancel`}
          component={Link}
          sx={{ marginTop: "12px" }}
        >
          Cancel Event
        </Button>
      )}

      {event.value.CancelInfo?.Canceled && (
        <Alert severity="warning" sx={{ marginTop: "16px" }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            This event was cancelled
          </Typography>
          {event.value.CancelInfo.Reason && (
            <Typography variant="body2">
              <strong>Reason:</strong> {event.value.CancelInfo.Reason}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>By:</strong> {event.value.CancelInfo.Owner}
          </Typography>
          <Typography variant="body2">
            <strong>At:</strong>{" "}
            {time.humanDateWithWeek(event.value.CancelInfo.AckTime)}
          </Typography>
        </Alert>
      )}

      <Subtitle>Target</Subtitle>
      <span>{targetElems}</span>
      <Subtitle>Started at</Subtitle>
      <span>{time.humanDateWithWeek(event.value.StartTime)}</span>
      {!event.value.Running && (
        <>
          <Subtitle>Finished at</Subtitle>
          <span>{time.humanDateWithWeek(event.value.EndTime)}</span>
        </>
      )}
      <Subtitle>Processed by instance</Subtitle>
      <span>
        {event.value.Instance.Name}
        {event.value.Instance.Addresses &&
          event.value.Instance.Addresses.length > 0 &&
          ` (${event.value.Instance.Addresses.join(", ")})`}
      </span>

      {event.value.SourceIP !== "" && (
        <>
          <Subtitle>Source IP</Subtitle>
          <span>{event.value.SourceIP}</span>
        </>
      )}

      {startCustomData && (
        <EventDebugInfo
          title="Start data"
          marginTop={titleMarginTop}
          data={startCustomData}
        />
      )}

      {endCustomData && (
        <EventDebugInfo
          title="End data"
          marginTop={titleMarginTop}
          data={endCustomData}
        />
      )}

      {otherCustomData && (
        <EventDebugInfo
          title="Other data"
          marginTop={titleMarginTop}
          data={otherCustomData}
        />
      )}
      {event.value.Error !== "" && (
        <>
          <Subtitle>Error</Subtitle>
          <Console>{event.value.Error}</Console>
        </>
      )}

      {event.value.Log !== "" && (
        <>
          <Subtitle>Log</Subtitle>
          <DeployLogViewer log={event.value.Log} />
        </>
      )}
    </>
  );
};

function joinJSX(
  targetElems: Array<React.JSX.Element>,
  separator: string
): Array<React.JSX.Element> {
  const separatorJSX = <span key="separator">{separator}</span>;

  return targetElems.reduce((acc: Array<React.JSX.Element>, curr, index) => {
    acc.push(curr);

    if (index !== targetElems.length - 1) {
      acc.push(separatorJSX);
    }

    return acc;
  }, []);
}

export default AppEventInfo;
