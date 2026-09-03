type TsuruEvent = {
  UniqueID: string;
  Kind: TsuruEventKind;

  Owner: {
    Type: string;
    Name: string;
  };

  Target: EventTarget;
  ExtraTargets: Array<EventExtraTarget> | null;
  Instance: {
    Name: string;
    Addresses: Array<string>;
  };

  StartTime: string;
  EndTime: string;
  Running: boolean;
  Error: string;
  Log: string;
  SourceIP: string;
  CancelInfo?: {
    Owner: string;
    StartTime: string;
    AckTime: string;
    Reason: string;
    Asked: boolean;
    Canceled: boolean;
  };
};

type TsuruEventInfo = TsuruEvent & {
  CustomData: {
    Start: any;
    End: any;
    Other: any;
  };
};

type EventExtraTarget = {
  Lock: boolean;
  Target: EventTarget;
};

type EventTarget = {
  Type: string;
  Value: string;
};

const getOwnerString = (event: TsuruEvent): string => {
  return event.Owner.Name !== ""
    ? `${event.Owner.Type}: ${event.Owner.Name}`
    : event.Owner.Type;
};

const eventsPerPage = 30;

type TsuruEventKind = {
  Type: string;
  Name: string;
};

export type { TsuruEvent, TsuruEventKind, TsuruEventInfo };
export { getOwnerString, eventsPerPage };
