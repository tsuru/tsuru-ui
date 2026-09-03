import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

function Loading() {
  return (
    <Box sx={{ paddingTop: "30px", paddingBottom: "30px" }}>
      <LinearProgress />
    </Box>
  );
}

export default Loading;
