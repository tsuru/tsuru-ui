import { createTheme } from "@mui/material/styles";
import { Button, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type ConsoleProps = {
  children: string;
  whiteSpace?: "pre";
  highlight?: string;
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const Console = (props: ConsoleProps) => {
  if (props.highlight) {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(props.children);
        alert("Copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy block: ", err);
      }
    };

    return (
      <div style={{ position: "relative" }}>
        <SyntaxHighlighter language={props.highlight} style={materialDark}>
          {props.children}
        </SyntaxHighlighter>
        <Tooltip title="Copy to clipboard">
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1, // Make sure button is in front of the blocks
              backgroundColor: lightTheme.palette.background.default,
              padding: "6px 12px", // Adjust padding
              color: lightTheme.palette.text.primary,
              textTransform: "none", // Disable uppercase transformation
            }}
          >
            Copy
          </Button>
        </Tooltip>
      </div>
    );
  }
  return (
    <pre
      style={{
        backgroundColor: darkTheme.palette.background.default,
        color: darkTheme.palette.text.primary,
        wordWrap: "break-word",
        overflowX: "auto",
        whiteSpace: props.whiteSpace ? props.whiteSpace : "pre-line",
        padding: "10px",
        fontSize: "11px",
      }}
    >
      {props.children}
    </pre>
  );
};

export default Console;
