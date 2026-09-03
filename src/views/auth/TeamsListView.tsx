import { Breadcrumbs, TextField, Typography } from "@mui/material";
import { ChangeEvent, FunctionComponent, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash.debounce";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import DisplayError from "../../components/base/DisplayError";
import { useTeams } from "../../hooks/auth";
import { Team } from "../../types/auth";
import { useTitle } from "react-use";
type TeamsListViewProps = {};

const TeamsListView: FunctionComponent<TeamsListViewProps> = () => {
  useTitle("Teams");

  const [searchText, setSearchText] = useState<string>("");
  const { value, loading, error } = useTeams();
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <DisplayError error={error} />;
  }

  const columns: GridColDef<Team>[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 400,
      flex: 0.5,
      renderCell(params) {
        return (
          <Link href={`/teams/${params.row.name}`}>{params.row.name}</Link>
        );
      },
    },
  ];

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
  };

  const rows = (value || []).filter((team) => {
    if (searchText !== "") {
      return team.name.includes(searchText);
    }

    return true;
  });

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>Teams</Typography>
      </Breadcrumbs>

      <TextField
        id="outlined-search"
        type="search"
        placeholder="Search"
        defaultValue={searchText}
        fullWidth
        autoFocus
        sx={{ paddingBottom: "10px" }}
        onChange={debounce(onSearchChanged, 500)}
      />

      <DataGrid
        rows={rows}
        getRowId={(row) => row.name}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
          sorting: {
            sortModel: [
              {
                field: "name",
                sort: "asc",
              },
            ],
          },
        }}
        pageSizeOptions={[100]}
        disableRowSelectionOnClick
        sx={{ height: "80%" }}
      />
    </>
  );
};

export default TeamsListView;
