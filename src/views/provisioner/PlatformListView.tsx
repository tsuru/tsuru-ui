import {
  Breadcrumbs,
  CardActionArea,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, FunctionComponent, useState } from "react";
import debounce from "lodash.debounce";
import Loading from "../Loading";
import { Platform } from "../../types/provisioner";
import { Card, CardContent, IconButton } from "@mui/material";
import PlatformIcon from "../../components/apps/PlatformIcon";
import DisplayError from "../../components/base/DisplayError";
import { usePlatforms } from "../../hooks/provisioner";
import { useTitle } from "react-use";
import config from "../../config";
import Link from "../../components/base/JoyLink";

const PlatformListView: FunctionComponent = () => {
  const [searchText, setSearchText] = useState<string>("");
  const { value, error, loading } = usePlatforms();

  useTitle("Platforms");

  if (error) {
    return <DisplayError error={error} />;
  }

  if (loading || !value) {
    return <Loading />;
  }

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
  };

  const platformsElems = value
    .filter((platform) => {
      if (searchText !== "") {
        return platform.Name.includes(searchText);
      }

      return true;
    })
    .map((platform) => (
      <PlatformCard platform={platform} key={platform.Name} />
    ));

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>Platforms</Typography>
      </Breadcrumbs>

      <TextField
        id="outlined-search"
        type="search"
        placeholder="Search"
        defaultValue={searchText}
        fullWidth
        autoFocus
        size="small"
        sx={{ paddingBottom: "10px" }}
        onChange={debounce(onSearchChanged, 500)}
      />

      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={2}>
        {platformsElems}
      </Stack>
    </>
  );
};

type PlatformCardProps = {
  platform: Platform;
};
const PlatformCard: FunctionComponent<PlatformCardProps> = ({ platform }) => {
  return (
    <Card
      variant={platform.Disabled ? "elevation" : "outlined"}
      sx={{
        minWidth: 320,
        flex: "1 0 24%",
        position: "relative",
        backgroundColor: platform.Disabled
          ? "action.disabledBackground"
          : undefined,
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <CardActionArea
        href={
          config.platformGuides && config.platformGuides[platform.Name]
            ? config.platformGuides[platform.Name]
            : "#"
        }
        target={
          config.platformGuides && config.platformGuides[platform.Name]
            ? "_blank"
            : undefined
        }
        LinkComponent={Link}
        disabled={
          !(config.platformGuides && config.platformGuides[platform.Name])
        }
      >
        <CardContent>
          <Typography fontSize="sm" aria-describedby="card-description" mb={1}>
            {platform.Name}
          </Typography>
        </CardContent>

        <div>
          <IconButton
            size="small"
            disabled
            sx={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}
          >
            <PlatformIcon platform={platform.Name} />
          </IconButton>
        </div>
      </CardActionArea>
    </Card>
  );
};

export default PlatformListView;
