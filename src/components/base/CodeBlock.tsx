import { FunctionComponent, useState } from "react";
import {
  Box,
  Typography,
  Card,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ContentCopy, CheckCircle } from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeBlockProps = {
  code: string;
  language?: string;
  title?: string;
};

const CodeBlock: FunctionComponent<CodeBlockProps> = ({
  code,
  language = "bash",
  title,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {title && (
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: alpha(theme.palette.background.default, 0.5),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            {title}
          </Typography>
          <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? (
                <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <ContentCopy sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Box sx={{ position: "relative" }}>
        {!title && (
          <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                "&:hover": {
                  bgcolor: theme.palette.background.paper,
                },
              }}
            >
              {copied ? (
                <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <ContentCopy sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "16px",
            fontSize: "13px",
            borderRadius: title ? 0 : 8,
          }}
        >
          {code}
        </SyntaxHighlighter>
      </Box>
    </Card>
  );
};

export default CodeBlock;
