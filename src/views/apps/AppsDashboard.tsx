import { ChangeEvent, FunctionComponent, ReactNode, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import debounce from "lodash.debounce";

import AppCard from "../../components/apps/AppCard";
import Loading from "../Loading";

import { AppResume } from "../../types/app";
import DisplayError from "../../components/base/DisplayError";
import { Button, ButtonGroup, Card, CardContent } from "@mui/material";
import { Add, ExpandMore, List, Apps } from "@mui/icons-material";
import { useAppsResume } from "../../hooks/app";
import { useInterval, useTitle } from "react-use";
import config from "../../config";
import TableAppList from "../../components/apps/TableAppList";

type AppGroup = {
  title: string;
  apps: Array<AppResume>;
  expanded: boolean;
};

type AppDashBoardGroupBy =
  | "relevance"
  | "team"
  | "platform"
  | "pool"
  | "pool-group"
  | "plan";

const AppsDashboard: FunctionComponent = () => {
  const initialParams = new URLSearchParams(window.location.search);
  const [searchText, setSearchText] = useState<string>(
    initialParams.get("search") || ""
  );

  const [visualization, setVisualization] = useState<string>(
    initialParams.get("visualization") ||
      window.localStorage.tsuruAppsVisualization ||
      "list"
  );

  const [groupBy, setGroupBy] = useState<AppDashBoardGroupBy>(
    (initialParams.get("groupBy") as AppDashBoardGroupBy) || "relevance"
  );

  const apps = useAppsResume();
  useTitle("Apps");

  if (apps.error) {
    return <DisplayError error={apps.error} />;
  }

  if (apps.loading || !apps.value) {
    return <Loading />;
  }

  let filteredApps = apps.value;
  if (searchText !== "") {
    filteredApps = apps.value.filter((app) => app.name.includes(searchText));
  }

  let displayElem: ReactNode = null;

  if (visualization === "cards") {
    const groups = groupApps(filteredApps, groupBy);

    displayElem = groups.map((group, i) => {
      return (
        <AppGroupComponent
          group={group}
          expanded={group.expanded}
          key={"group-" + group.title.toLowerCase()}
        />
      );
    });
  } else {
    displayElem = <TableAppList rows={filteredApps} />;
  }

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
    replaceHistory(v.target.value, groupBy, visualization);
  };

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>Apps</Typography>
      </Breadcrumbs>

      <AppResumeBar apps={apps.value} />

      <Stack
        direction="row"
        useFlexGap
        spacing={2}
        sx={{ paddingBottom: "10px" }}
      >
        <Button
          href={config.prefix + "/apps/_create"}
          variant="contained"
          size="small"
        >
          <Add /> Create
        </Button>

        <TextField
          id="outlined-search"
          type="search"
          placeholder="Search apps"
          defaultValue={searchText}
          fullWidth
          size="small"
          autoFocus
          sx={{ flex: 1 }}
          onChange={debounce(onSearchChanged, 500)}
        />

        <AppChangeVisualizationButtonGroup
          visualization={visualization}
          onChange={(v) => {
            setVisualization(v);
            window.localStorage.tsuruAppsVisualization = v;
            replaceHistory(searchText, groupBy, v);
          }}
        />

        {visualization === "cards" ? (
          <Select
            value={groupBy}
            onChange={(event) => {
              const value = event.target.value as AppDashBoardGroupBy;
              setGroupBy(value);
              replaceHistory(searchText, value, visualization);
            }}
            sx={{ flex: 0.15 }}
            size="small"
            variant="outlined"
          >
            <MenuItem value="relevance">Group by relevance</MenuItem>
            <MenuItem value="team">Group by team</MenuItem>
            <MenuItem value="platform">Group by platform</MenuItem>
            <MenuItem value="pool">Group by pool</MenuItem>
            <MenuItem value="pool-group">Group by pool group</MenuItem>
            <MenuItem value="plan">Group by plan</MenuItem>
          </Select>
        ) : null}
      </Stack>

      {displayElem}
    </>
  );
};

type AppGroupComponentProps = {
  group: AppGroup;
  expanded: boolean;
};

const batchSize = 300;

const AppGroupComponent: FunctionComponent<AppGroupComponentProps> = (
  props
) => {
  const [expanded, setExpanded] = useState(props.expanded);
  const [sizeLoaded, setSizeLoaded] = useState<number>(
    props.group.apps.length > batchSize ? batchSize : props.group.apps.length
  );

  useInterval(
    () => {
      if (sizeLoaded + batchSize < props.group.apps.length) {
        setSizeLoaded(sizeLoaded + batchSize);
      } else {
        setSizeLoaded(props.group.apps.length);
      }
    },
    sizeLoaded + batchSize < props.group.apps.length ? 10 : null
  );

  const appsElems = props.group.apps
    .slice(0, sizeLoaded)
    .map((app) => (
      <AppCard
        key={app.name}
        appName={app.name}
        units={app.units}
        platform={app.platform}
        poolName={app.pool}
      />
    ));

  return (
    <>
      <Button
        variant="text"
        color="inherit"
        size="large"
        sx={{ textTransform: "none", paddingTop: "10px", paddingLeft: "0px" }}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <ExpandMore
          fontSize="small"
          sx={{ transform: expanded ? "rotate(180deg)" : null }}
        />
        {props.group.title} ({props.group.apps.length})
      </Button>
      <Stack
        direction="row"
        useFlexGap
        flexWrap="wrap"
        spacing={2}
        sx={{ display: expanded ? "" : "none" }}
      >
        {appsElems}
      </Stack>
      <br />
    </>
  );
};

const AppResumeBar = ({ apps }: { apps: Array<AppResume> }) => {
  const relevance = groupAppsByRelevance(apps);
  return (
    <Stack
      direction="row"
      useFlexGap
      spacing={2}
      sx={{ paddingBottom: "10px" }}
    >
      <Card
        variant="outlined"
        sx={{
          flex: "1 0 19%",
          "&:hover": {
            boxShadow: "md",
            borderColor: "neutral.outlinedHoverBorder",
          },
        }}
      >
        <CardContent>
          <Typography gutterBottom>Total</Typography>
          {relevance.healthy.length +
            relevance.unhealthyDEV.length +
            relevance.unhealthyPROD.length +
            relevance.stopped.length}
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{
          flex: "1 0 19%",
          "&:hover": {
            boxShadow: "md",
            borderColor: "neutral.outlinedHoverBorder",
          },
        }}
      >
        <CardContent>
          <Typography gutterBottom>Healthy</Typography>
          {relevance.healthy.length}
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{
          flex: "1 0 19%",
          "&:hover": {
            boxShadow: "md",
            borderColor: "neutral.outlinedHoverBorder",
          },
        }}
      >
        <CardContent>
          <Typography gutterBottom>Unhealthy PROD</Typography>
          {relevance.unhealthyPROD.length}
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{
          flex: "1 0 19%",
          "&:hover": {
            boxShadow: "md",
            borderColor: "neutral.outlinedHoverBorder",
          },
        }}
      >
        <CardContent>
          <Typography gutterBottom>Unhealthy DEV</Typography>
          {relevance.unhealthyDEV.length}
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{
          flex: "1 0 19%",
          "&:hover": {
            boxShadow: "md",
            borderColor: "neutral.outlinedHoverBorder",
          },
        }}
      >
        <CardContent>
          <Typography gutterBottom>Stopped</Typography>
          {relevance.stopped.length}
        </CardContent>
      </Card>
    </Stack>
  );
};

const AppChangeVisualizationButtonGroup = ({
  visualization,
  onChange,
}: {
  visualization: string;
  onChange: (v: string) => void;
}) => {
  return (
    <ButtonGroup variant="contained" aria-label="Basic button group">
      <Button
        variant={visualization === "cards" ? "contained" : "outlined"}
        size="small"
        onClick={() => onChange("cards")}
      >
        <Apps />
      </Button>
      <Button
        variant={visualization === "list" ? "contained" : "outlined"}
        size="small"
        onClick={() => onChange("list")}
      >
        <List />
      </Button>
    </ButtonGroup>
  );
};

const groupApps = (
  apps: Array<AppResume>,
  groupBy: AppDashBoardGroupBy
): Array<AppGroup> => {
  const result: Array<AppGroup> = [];

  let sortGroups = true;

  if (groupBy === "relevance") {
    const relevance = groupAppsByRelevance(apps);

    if (relevance.unhealthyPROD.length > 0) {
      result.push({
        title: "Unhealthy PROD",
        apps: relevance.unhealthyPROD,
        expanded: true,
      });
    }

    if (relevance.unhealthyDEV.length > 0) {
      result.push({
        title: "Unhealthy DEV",
        apps: relevance.unhealthyDEV,
        expanded: true,
      });
    }

    if (relevance.healthy.length > 0) {
      result.push({
        title: "Healthy",
        apps: relevance.healthy,
        expanded: true,
      });
    }

    if (relevance.stopped.length > 0) {
      result.push({
        title: "Stopped",
        apps: relevance.stopped,
        expanded: false,
      });
    }

    sortGroups = false;
  }

  if (groupBy === "team") {
    const map: Record<string, Array<AppResume>> = {};

    for (const app of apps) {
      const key = app.teamowner;
      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(app);
    }

    for (const key in map) {
      result.push({
        title: `Team: ${key}`,
        apps: map[key],
        expanded: true,
      });
    }
  }

  if (groupBy === "platform") {
    const map: Record<string, Array<AppResume>> = {};

    for (const app of apps) {
      const key = app.platform;
      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(app);
    }

    for (const key in map) {
      result.push({
        title: `Platform: ${key}`,
        apps: map[key],
        expanded: true,
      });
    }
  }

  if (groupBy === "pool") {
    const map: Record<string, Array<AppResume>> = {};

    for (const app of apps) {
      const key = app.pool;
      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(app);
    }

    for (const key in map) {
      result.push({
        title: `Pool: ${key}`,
        apps: map[key],
        expanded: true,
      });
    }
  }

  if (groupBy === "pool-group") {
    const map: Record<string, Array<AppResume>> = {};
    const regexes: Record<string, RegExp> = {};

    config.appPoolGroups?.forEach((group) => {
      regexes[group.name] = new RegExp(group.regex);
    });

    for (const app of apps) {
      const pool = app.pool;

      for (const groupName in regexes) {
        if (regexes[groupName].test(pool)) {
          if (!map[groupName]) {
            map[groupName] = [];
          }
          map[groupName].push(app);
          break;
        }
      }
    }

    for (const key in map) {
      result.push({
        title: `Pool: ${key}`,
        apps: map[key],
        expanded: true,
      });
    }
  }

  if (groupBy === "plan") {
    const map: Record<string, Array<AppResume>> = {};

    for (const app of apps) {
      const key = app.plan.name;
      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(app);
    }

    for (const key in map) {
      result.push({
        title: `Plan: ${key}`,
        apps: map[key],
        expanded: true,
      });
    }

    result.sort((a: AppGroup, b: AppGroup) => {
      if (a.apps.length < b.apps.length) {
        return 1;
      } else if (a.apps.length > b.apps.length) {
        return -1;
      }
      return 0;
    });

    sortGroups = false;
  }

  if (sortGroups) {
    result.sort((a: AppGroup, b: AppGroup) => {
      if (a.title < b.title) {
        return -1;
      } else if (a.title > b.title) {
        return 1;
      }
      return 0;
    });
  }

  return result;
};

const groupAppsByRelevance = (apps: Array<AppResume>) => {
  const unhealthyDEV: Array<AppResume> = [];
  const unhealthyPROD: Array<AppResume> = [];
  const healthy: Array<AppResume> = [];
  const stopped: Array<AppResume> = [];

  for (const app of apps) {
    const isPROD = app.pool && app.pool.endsWith("-prod");
    if (app.units.total === 0) {
      stopped.push(app);
    } else if (app.units.error > 0) {
      if (isPROD) {
        unhealthyPROD.push(app);
      } else {
        unhealthyDEV.push(app);
      }
    } else {
      healthy.push(app);
    }
  }

  return {
    unhealthyDEV,
    unhealthyPROD,
    healthy,
    stopped,
  };
};

const replaceHistory = (
  search: string,
  groupBy: string,
  visualization: string
) => {
  window.history.replaceState(
    null,
    "",
    `?search=${search}&groupBy=${groupBy}&visualization=${visualization}`
  );
};

export default AppsDashboard;
