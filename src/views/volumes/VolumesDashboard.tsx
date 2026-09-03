import { ChangeEvent, FunctionComponent, ReactNode, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import debounce from "lodash.debounce";

import Loading from "../Loading";
import VolumeCard from "../../components/volumes/VolumeCard";
import TableVolumeList from "../../components/volumes/TableVolumeList";
import { useTitle } from "react-use";
import DisplayError from "../../components/base/DisplayError";
import { useVolumes } from "../../hooks/volumes";
import { Button, ButtonGroup } from "@mui/material";
import { Apps, List } from "@mui/icons-material";

const VolumesDashboard: FunctionComponent = () => {
  const initialParams = new URLSearchParams(window.location.search);
  const [searchText, setSearchText] = useState<string>(
    initialParams.get("search") || ""
  );
  const [visualization, setVisualization] = useState<string>(
    initialParams.get("visualization") ||
      window.localStorage.tsuruVolumesVisualization ||
      "list"
  );

  const volumes = useVolumes();

  useTitle("Volumes");

  if (volumes.error) {
    return <DisplayError error={volumes.error} />;
  }

  if (volumes.loading || !volumes.value) {
    return <Loading />;
  }

  let filteredVolumes = volumes.value;
  if (searchText !== "") {
    filteredVolumes = volumes.value.filter((volume) =>
      volume.Name.includes(searchText)
    );
  }

  const replaceHistory = (newSearchText: string, newVisualization: string) => {
    window.history.replaceState(
      null,
      "",
      `?search=${newSearchText}&visualization=${newVisualization}`
    );
  };

  let displayElem: ReactNode = null;

  if (visualization === "cards") {
    displayElem = (
      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={2}>
        {filteredVolumes.map((volume) => (
          <VolumeCard
            key={volume.Name}
            volumeName={volume.Name}
            planName={volume.Plan.Name}
          />
        ))}
      </Stack>
    );
  } else {
    displayElem = <TableVolumeList rows={filteredVolumes} />;
  }

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
    replaceHistory(v.target.value, visualization);
  };

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>Volumes</Typography>
      </Breadcrumbs>

      <Stack
        direction="row"
        useFlexGap
        spacing={2}
        sx={{ paddingBottom: "10px" }}
      >
        <TextField
          id="outlined-search"
          type="search"
          placeholder="Search volumes"
          defaultValue={searchText}
          fullWidth
          autoFocus
          size="small"
          sx={{ flex: 1 }}
          onChange={debounce(onSearchChanged, 500)}
        />

        <ButtonGroup variant="contained" aria-label="visualization">
          <Button
            variant={visualization === "cards" ? "contained" : "outlined"}
            size="small"
            onClick={() => {
              setVisualization("cards");
              window.localStorage.tsuruVolumesVisualization = "cards";
              replaceHistory(searchText, "cards");
            }}
          >
            <Apps />
          </Button>
          <Button
            variant={visualization === "list" ? "contained" : "outlined"}
            size="small"
            onClick={() => {
              setVisualization("list");
              window.localStorage.tsuruVolumesVisualization = "list";
              replaceHistory(searchText, "list");
            }}
          >
            <List />
          </Button>
        </ButtonGroup>
      </Stack>

      {displayElem}
    </>
  );
};

export default VolumesDashboard;
