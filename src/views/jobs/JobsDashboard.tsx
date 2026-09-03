import { ChangeEvent, FunctionComponent, ReactNode, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import debounce from "lodash.debounce";

import Loading from "../Loading";
import JobCard from "../../components/jobs/JobCard";
import TableJobList from "../../components/jobs/TableJobList";

import { useTitle } from "react-use";
import { useJobs } from "../../hooks/jobs";
import { Button, ButtonGroup } from "@mui/material";
import { Apps, List } from "@mui/icons-material";

const JobsDashboard: FunctionComponent = () => {
  const initialParams = new URLSearchParams(window.location.search);
  const [searchText, setSearchText] = useState<string>(
    initialParams.get("search") || ""
  );
  const [visualization, setVisualization] = useState<string>(
    initialParams.get("visualization") ||
      window.localStorage.tsuruJobsVisualization ||
      "list"
  );

  const jobs = useJobs();

  useTitle("Jobs");

  if (jobs.loading || !jobs.value) {
    return <Loading />;
  }

  let filteredJobs = jobs.value;
  if (searchText !== "") {
    filteredJobs = jobs.value.filter((job) => job.name.includes(searchText));
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
        {filteredJobs.map((job) => (
          <JobCard
            key={job.name}
            jobName={job.name}
            schedule={job.spec.schedule}
            manual={job.spec.manual}
          />
        ))}
      </Stack>
    );
  } else {
    displayElem = <TableJobList rows={filteredJobs} />;
  }

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
    replaceHistory(v.target.value, visualization);
  };

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>Jobs</Typography>
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
          placeholder="Search jobs"
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
              window.localStorage.tsuruJobsVisualization = "cards";
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
              window.localStorage.tsuruJobsVisualization = "list";
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

export default JobsDashboard;
