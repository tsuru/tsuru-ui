import { Typography } from "@mui/material";
import { titleMarginTop } from "../../constants/style";
import { ReactNode } from "react";

type TitleProps = {
  children: ReactNode;
};
const Title = (props: TitleProps) => {
  return (
    <Typography variant="h6" marginTop={titleMarginTop}>
      {props.children}
    </Typography>
  );
};

export default Title;
