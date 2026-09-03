import { DeployLogSection, ParsedDeployLog } from "../types/deployLog";

function extractTimestamp(line: string): {
  timestamp?: string;
  content: string;
} {
  // Format: "YYYY-MM-DD HH:MM:SS +/-TTTT: content"
  if (
    line.length >= 26 &&
    line[4] === "-" &&
    line[7] === "-" &&
    line[10] === " " &&
    line[13] === ":" &&
    line[16] === ":" &&
    line[19] === " " &&
    (line[20] === "+" || line[20] === "-") &&
    line[25] === ":"
  ) {
    return {
      timestamp: line.substring(0, 25),
      content: line.substring(26).trimStart(),
    };
  }
  return { content: line };
}

function parseSectionHeader(line: string): string | null {
  if (line.startsWith("---- ") && line.endsWith(" ----")) {
    return line.slice(5, -5).trim() || null;
  }
  return null;
}

function parseErrorSectionHeader(line: string): string | null {
  if (line.startsWith("**** ") && line.endsWith(" ****")) {
    return line.slice(5, -5).trim() || null;
  }
  return null;
}

function parseArrowLine(line: string): string | null {
  if (!line.startsWith("---> ")) return null;
  return line.slice(4).trimStart() || null;
}

export function parseDeployLog(log: string): ParsedDeployLog {
  const lines = log.split("\n");
  const sections: DeployLogSection[] = [];
  const prelude: string[] = [];

  let currentSection: DeployLogSection | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    const { timestamp, content } = extractTimestamp(trimmedLine);

    const sectionTitle = parseSectionHeader(content);
    if (sectionTitle) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: sectionTitle,
        lines: [],
        hasError: false,
      };
      continue;
    }

    const errorTitle = parseErrorSectionHeader(content);
    if (errorTitle) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: errorTitle,
        lines: [],
        hasError: true,
      };
      continue;
    }

    if (!currentSection) {
      if (content) {
        const arrowContent = parseArrowLine(content);
        if (arrowContent) {
          currentSection = {
            title: arrowContent,
            lines: [],
            hasError: false,
          };
        } else {
          // Create implicit section for other orphan lines
          currentSection = {
            title: "Output",
            lines: [],
            hasError: false,
          };
          currentSection.lines.push({
            content,
            type: "text",
            timestamp,
          });
        }
      }
      continue;
    }

    if (!content) {
      continue;
    }

    const arrowContent = parseArrowLine(content);
    if (arrowContent) {
      currentSection.lines.push({
        content: arrowContent,
        type: "arrow",
        timestamp,
      });
    } else {
      currentSection.lines.push({
        content,
        type: "text",
        timestamp,
      });
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { sections, prelude };
}
