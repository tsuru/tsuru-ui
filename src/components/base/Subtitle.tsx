import { Typography } from "@mui/material";
import { titleMarginTop } from "../../constants/style";
import { ReactNode } from "react";

type SubtitleProps = {
  children: ReactNode;
};
const Subtitle = (props: SubtitleProps) => {
  return (
    <Typography variant="subtitle1" marginTop={titleMarginTop}>
      {props.children}
    </Typography>
  );
};

export default Subtitle;
