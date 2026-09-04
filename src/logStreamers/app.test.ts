import Streamer from "./app";

// stream-json is imported at module scope, so this fails to even load the
// module when the installed version does not expose the streamer under the
// path this file imports -- which is what a major bump silently changed.
test("loads the app log streamer and its stream-json dependency", () => {
  const streamer = new Streamer();

  expect(streamer.buffer).toEqual([]);
  expect(streamer.listenersCount).toBe(0);
});
