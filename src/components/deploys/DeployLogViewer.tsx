import { FunctionComponent, useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  CheckCircleOutline,
  ErrorOutline,
} from "@mui/icons-material";
import { parseDeployLog } from "../../utils/deployLogParser";
import { DeployLogSection } from "../../types/deployLog";
import Console from "../base/Console";

type DeployLogViewerProps = {
  log: string;
};

const LogContainer = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

const SectionHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasError" && prop !== "isExpandable",
})<{ hasError?: boolean; isExpandable?: boolean }>(
  ({ theme, hasError, isExpandable }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: hasError
      ? alpha(theme.palette.error.main, 0.15)
      : alpha(theme.palette.primary.main, 0.1),
    borderLeft: `3px solid ${
      hasError ? theme.palette.error.main : theme.palette.primary.main
    }`,
    cursor: isExpandable ? "pointer" : "default",
    "&:hover": isExpandable
      ? {
          backgroundColor: hasError
            ? alpha(theme.palette.error.main, 0.25)
            : alpha(theme.palette.primary.main, 0.15),
        }
      : {},
  })
);

type SectionProps = {
  section: DeployLogSection;
  defaultExpanded?: boolean;
};

const Section: FunctionComponent<SectionProps> = ({
  section,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasLines = section.lines.length > 0;

  const content = section.lines
    .map((line) =>
      line.type === "arrow" ? `---> ${line.content}` : line.content
    )
    .join("\n");

  return (
    <Box>
      <SectionHeader
        hasError={section.hasError}
        isExpandable={hasLines}
        onClick={() => hasLines && setExpanded(!expanded)}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {section.hasError ? (
            <ErrorOutline color="error" fontSize="small" />
          ) : (
            <CheckCircleOutline color="success" fontSize="small" />
          )}
          <Typography
            variant="body2"
            fontWeight={600}
            fontFamily="monospace"
            color={section.hasError ? "error.main" : "text.primary"}
          >
            {section.title}
          </Typography>
        </Stack>
        {hasLines && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {section.lines.length}{" "}
              {section.lines.length === 1 ? "line" : "lines"}
            </Typography>
            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>
        )}
      </SectionHeader>
      {hasLines && (
        <Collapse in={expanded}>
          <Console>{content}</Console>
        </Collapse>
      )}
    </Box>
  );
};

const DeployLogViewer: FunctionComponent<DeployLogViewerProps> = ({ log }) => {
  const { sections } = parseDeployLog(log);

  return (
    <LogContainer>
      <Stack spacing={0}>
        {sections.map((section, index) => (
          <Section
            key={index}
            section={section}
            defaultExpanded={section.hasError || index === sections.length - 1}
          />
        ))}
      </Stack>
    </LogContainer>
  );
};

export default DeployLogViewer;
