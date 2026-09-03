import { Fetcher } from "../contexts/auth";
import { RPaasLogFilter, RPaasLogLine } from "../types/rpaas";

const streamerBufferSize = 200;
let uniqueID = 0;

class Streamer {
  abortController: AbortController | null;
  lastFilter: string;
  buffer: Array<RPaasLogLine>;
  listenersCount: number;
  lastError: Error | null;
  bufferPopulatedBy: string;

  constructor() {
    this.buffer = [];
    this.abortController = null;
    this.lastFilter = "";
    this.bufferPopulatedBy = "";
    this.listenersCount = 0;
    this.lastError = null;
  }

  start({
    fetch,
    service,
    instance,
    filter,
  }: {
    fetch: Fetcher;
    service: string;
    instance: string;
    filter: RPaasLogFilter;
  }) {
    this.listenersCount++;
    const filterString = JSON.stringify({ filter, service, instance });
    if (filterString === this.lastFilter && this.abortController !== null) {
      return;
    }

    this.lastFilter = filterString;

    if (this.abortController) {
      this.abortController.abort();
      this.buffer = [];
    }

    this.asyncStreamLines({ fetch, service, instance, filter });
  }

  async asyncStreamLines({
    fetch,
    service,
    instance,
    filter,
  }: {
    fetch: Fetcher;
    service: string;
    instance: string;
    filter: RPaasLogFilter;
  }) {
    try {
      this.lastError = null;
      return await this.internalStreamLines({
        fetch,
        service,
        instance,
        filter,
      });
    } catch (e: any) {
      this.lastError = e;
    }
  }

  async internalStreamLines({
    fetch,
    service,
    instance,
    filter,
  }: {
    fetch: Fetcher;
    service: string;
    instance: string;
    filter: RPaasLogFilter;
  }) {
    this.abortController = new AbortController();

    const qs = {
      lines: "10",
      follow: "1",
      ...filter,
    };
    const response = await fetch(
      `/1.20/services/${service}/resources/${instance}/log?${new URLSearchParams(
        qs
      ).toString()}`,
      {
        signal: this.abortController.signal,
      }
    );

    if (!response.body) return;
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();
    this.buffer = [];

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      for (const line of parseLines(value)) {
        uniqueID++;
        line.id = uniqueID;

        if (this.buffer.length > streamerBufferSize) {
          this.buffer.shift();
        }
        this.buffer.push(line);
      }
    }
  }

  bufferPreviousPopulated({
    service,
    instance,
    filter,
  }: {
    service: string;
    instance: string;
    filter: RPaasLogFilter;
  }) {
    if (this.buffer.length === 0) {
      return false;
    }

    return (
      this.bufferPopulatedBy === JSON.stringify({ filter, service, instance })
    );
  }

  async fillBuffer({
    fetch,
    service,
    instance,
    filter,
  }: {
    fetch: Fetcher;
    service: string;
    instance: string;
    filter: RPaasLogFilter;
  }) {
    const qs = {
      lines: "100",
      ...filter,
    };

    this.bufferPopulatedBy = JSON.stringify({ filter, service, instance });

    const response = await fetch(
      `/1.20/services/${service}/resources/${instance}/log?${new URLSearchParams(
        qs
      ).toString()}`
    );

    const text = await response.text();
    this.buffer = [];
    for (const line of parseLines(text)) {
      uniqueID++;
      line.id = uniqueID;

      if (this.buffer.length > streamerBufferSize) {
        this.buffer.shift();
      }
      this.buffer.push(line);
    }
  }

  stop() {
    this.listenersCount--;
    if (this.abortController && this.listenersCount === 0) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  forceStop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

const parseLines = (raw: string): Array<RPaasLogLine> => {
  const lines = raw.split("\n");

  const result: Array<RPaasLogLine> = [];

  for (const line of lines) {
    if (line === "") {
      continue;
    }

    const parsedValue = parseLine(line);
    if (!parsedValue) {
      continue;
    }
    result.push(parsedValue);
  }

  return result;
};

const parseLine = (line: string): RPaasLogLine | null => {
  const parts = line.split(" ");
  if (parts.length < 2) {
    return null;
  }

  const date = parts.shift() as string;
  const podAndContainer = parts.shift() as string;

  const podParts = podAndContainer.split("]");
  const pod = podParts[0].replace("[", "");
  const container = podParts[1].replace("[", "");
  const message = parts.join(" ");

  return {
    container,
    date,
    message,
    pod,
  };
};

export default Streamer;
