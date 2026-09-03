const MAX_STREAM_LINES = 200;

// truncateStream keeps only the last MAX_STREAM_LINES lines of the stream to prevent react be overwhelmed
// with too many lines and crashing the browser. This is especially important for long-running operations
// that can produce a lot of output.
const truncateStream = (stream: string): string => {
  const lines = stream.split("\n");
  if (lines.length <= MAX_STREAM_LINES) return stream;
  return lines.slice(-MAX_STREAM_LINES).join("\n");
};

export { truncateStream };
