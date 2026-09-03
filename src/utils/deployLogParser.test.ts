import { parseDeployLog } from "./deployLogParser";

describe("parseDeployLog", () => {
  test("parses a normal section with lines", () => {
    const log = `---- Build ----
line 1
line 2`;
    const result = parseDeployLog(log);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].title).toBe("Build");
    expect(result.sections[0].hasError).toBe(false);
    expect(result.sections[0].lines).toEqual([
      { content: "line 1", type: "text", timestamp: undefined },
      { content: "line 2", type: "text", timestamp: undefined },
    ]);
  });

  test("parses an error section", () => {
    const log = `**** Deploy Failed ****
something went wrong`;
    const result = parseDeployLog(log);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].title).toBe("Deploy Failed");
    expect(result.sections[0].hasError).toBe(true);
    expect(result.sections[0].lines).toEqual([
      { content: "something went wrong", type: "text", timestamp: undefined },
    ]);
  });

  test("parses arrow lines inside a section", () => {
    const log = `---- Deploy ----
---> Deploying app
regular line`;
    const result = parseDeployLog(log);
    expect(result.sections[0].lines).toEqual([
      { content: "Deploying app", type: "arrow", timestamp: undefined },
      { content: "regular line", type: "text", timestamp: undefined },
    ]);
  });

  test("arrow line without a section becomes a section title", () => {
    const log = `---> Building image
step 1`;
    const result = parseDeployLog(log);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].title).toBe("Building image");
    expect(result.sections[0].lines).toEqual([
      { content: "step 1", type: "text", timestamp: undefined },
    ]);
  });

  test("orphan text line creates implicit Output section", () => {
    const log = `some orphan line`;
    const result = parseDeployLog(log);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].title).toBe("Output");
    expect(result.sections[0].lines).toEqual([
      { content: "some orphan line", type: "text", timestamp: undefined },
    ]);
  });

  test("extracts timestamps from lines", () => {
    const log = `---- Build ----
2024-01-15 14:30:00 +0300: compiled successfully`;
    const result = parseDeployLog(log);
    expect(result.sections[0].lines).toEqual([
      {
        content: "compiled successfully",
        type: "text",
        timestamp: "2024-01-15 14:30:00 +0300",
      },
    ]);
  });

  test("extracts timestamp with negative timezone offset", () => {
    const log = `---- Build ----
2024-06-01 08:00:00 -0500: started`;
    const result = parseDeployLog(log);
    expect(result.sections[0].lines[0].timestamp).toBe(
      "2024-06-01 08:00:00 -0500"
    );
    expect(result.sections[0].lines[0].content).toBe("started");
  });

  test("multiple sections are parsed in order", () => {
    const log = `---- Build ----
building...
---- Deploy ----
deploying...
**** Errors ****
error!`;
    const result = parseDeployLog(log);
    expect(result.sections).toHaveLength(3);
    expect(result.sections[0].title).toBe("Build");
    expect(result.sections[0].hasError).toBe(false);
    expect(result.sections[1].title).toBe("Deploy");
    expect(result.sections[1].hasError).toBe(false);
    expect(result.sections[2].title).toBe("Errors");
    expect(result.sections[2].hasError).toBe(true);
  });

  test("skips empty lines inside sections", () => {
    const log = `---- Build ----
line 1

line 2`;
    const result = parseDeployLog(log);
    expect(result.sections[0].lines).toEqual([
      { content: "line 1", type: "text", timestamp: undefined },
      { content: "line 2", type: "text", timestamp: undefined },
    ]);
  });

  test("empty log produces no sections", () => {
    const result = parseDeployLog("");
    expect(result.sections).toHaveLength(0);
  });

  test("line without valid timestamp is returned as-is", () => {
    const log = `---- Build ----
not a timestamp: just text`;
    const result = parseDeployLog(log);
    expect(result.sections[0].lines[0]).toEqual({
      content: "not a timestamp: just text",
      type: "text",
      timestamp: undefined,
    });
  });

  test("section header with extra spaces in title", () => {
    const log = `----  Hello World  ----
content`;
    const result = parseDeployLog(log);
    expect(result.sections[0].title).toBe("Hello World");
  });

  test("timestamp on a section header line does not break parsing", () => {
    const log = `2024-01-15 14:30:00 +0300: ---- Build ----
line 1`;
    const result = parseDeployLog(log);
    expect(result.sections[0].title).toBe("Build");
    expect(result.sections[0].lines).toEqual([
      { content: "line 1", type: "text", timestamp: undefined },
    ]);
  });
});
