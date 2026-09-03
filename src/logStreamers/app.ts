import { Fetcher } from "../contexts/auth";
import { AppLogFilter, AppLogLine } from "../types/app";
import streamValues from "stream-json/streamers/StreamValues";

const streamerBufferSize = 200;

// A Hacking way to provide similar process.nextTick on the browser
const ensureCallable = (fn: any) => {
  if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
  return fn;
};
const processFake: any = {
  // need to be a function to preserve "this" property
  nextTick: function (cb: any, ...args: Array<any>) {
    setTimeout(() => {
      ensureCallable(cb)(...args);
    }, 0);
  },
};

window.process = processFake;

let uniqueID = 0;

class Streamer {
  abortController: AbortController | null;
  lastFilter: string;
  bufferPopulatedBy: string;
  buffer: Array<AppLogLine>;
  listenersCount: number;
  lastError: Error | null;

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
    app,
    job,
    appLogFilter,
  }: {
    fetch: Fetcher;
    app?: string;
    job?: string;

    appLogFilter?: AppLogFilter;
  }) {
    this.listenersCount++;
    const filterString = JSON.stringify({ appLogFilter, app, job });
    if (filterString === this.lastFilter && this.abortController !== null) {
      return;
    }

    this.lastFilter = filterString;

    if (this.abortController) {
      this.abortController.abort();
      this.buffer = [];
    }

    this.asyncStreamLines({ fetch, app, job, appLogFilter });
  }

  async asyncStreamLines({
    fetch,
    app,
    job,
    appLogFilter,
  }: {
    fetch: Fetcher;
    app?: string;
    job?: string;
    appLogFilter?: AppLogFilter;
  }) {
    try {
      this.lastError = null;
      return await this.internalStreamLines({ fetch, app, job, appLogFilter });
    } catch (e: any) {
      this.lastError = e;
    }
  }

  async internalStreamLines({
    fetch,
    app,
    job,
    appLogFilter,
  }: {
    fetch: Fetcher;
    app?: string;
    job?: string;
    appLogFilter?: AppLogFilter;
  }) {
    let qs = {
      lines: "10",
      follow: "1",
    };

    this.abortController = new AbortController();

    let url = "";

    if (app) {
      url = `/apps/${app}/log?${new URLSearchParams({
        ...qs,
        ...appLogFilter,
      }).toString()}`;
    } else if (job) {
      url = `/jobs/${job}/log?${new URLSearchParams(qs).toString()}`;
    } else {
      throw new Error("no job neither app provided");
    }

    const response = await fetch(url, {
      signal: this.abortController.signal,
    });
    if (!response.body) return;
    const reader = response.body.getReader();
    const p = streamValues.withParser();
    this.buffer = [];
    p.on("data", (data) => {
      for (const item of data.value) {
        uniqueID++;
        item.id = uniqueID;
        if (this.buffer.length > streamerBufferSize) {
          this.buffer.shift();
        }
        this.buffer.push(item);
      }
    });

    p.on("error", (err) => {
      console.info("Error", err.stack);
    });

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      p.write(value);
    }
  }

  bufferPreviousPopulated({
    app,
    job,
    appLogFilter,
  }: {
    app?: string;
    job?: string;

    appLogFilter: AppLogFilter;
  }) {
    if (this.buffer.length === 0) {
      return false;
    }

    return (
      this.bufferPopulatedBy === JSON.stringify({ appLogFilter, app, job })
    );
  }

  async fillBuffer({
    fetch,
    app,
    job,
    appLogFilter,
  }: {
    fetch: Fetcher;
    app?: string;
    job?: string;
    appLogFilter?: AppLogFilter;
  }) {
    const qs = {
      lines: "100",
    };
    this.bufferPopulatedBy = JSON.stringify({ appLogFilter, app, job });
    this.abortController = new AbortController();

    let url = "";

    if (app) {
      url = `/apps/${app}/log?${new URLSearchParams({
        ...qs,
        ...appLogFilter,
      }).toString()}`;
    } else if (job) {
      url = `/jobs/${job}/log?${new URLSearchParams(qs).toString()}`;
    } else {
      throw new Error("no job neither app provided");
    }

    const response = await fetch(url);
    if (!response.body) return;

    this.buffer = (await response.json()) || [];

    for (const line of this.buffer) {
      uniqueID++;
      line.id = uniqueID;
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

export default Streamer;
