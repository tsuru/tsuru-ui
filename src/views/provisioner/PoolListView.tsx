import { Breadcrumbs, TextField, Typography } from "@mui/material";
import { ChangeEvent, FunctionComponent, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash.debounce";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import { Pool } from "../../types/provisioner";
import DisplayError from "../../components/base/DisplayError";
import { usePools } from "../../hooks/provisioner";
import { useTitle } from "react-use";

const PoolListView: FunctionComponent = () => {
  const [searchText, setSearchText] = useState<string>("");
  const { value, error, loading } = usePools();

  useTitle("Pools");

  if (error) {
    return <DisplayError error={error} />;
  }

  if (loading || !value) {
    return <Loading />;
  }

  const columns: GridColDef<Pool>[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 400,
      flex: 0.5,
      renderCell(params) {
        return (
          <Link href={`/admin/pools/${params.row.Name}`}>
            {params.row.Name}
          </Link>
        );
      },
    },
    {
      field: "provisioner",
      headerName: "Provisioner",
      flex: 0.5,
    },
    {
      field: "default",
      headerName: "Default",
      flex: 0.5,
      renderCell(params) {
        return <span>{params.row.Default ? "✓" : ""}</span>;
      },
    },
  ];

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
  };

  const rows = value.filter((pool) => {
    if (searchText !== "") {
      return pool.Name.includes(searchText);
    }

    return true;
  });

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>Pools</Typography>
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

      <DataGrid
        rows={rows}
        getRowId={(row) => row.Name}
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

export default PoolListView;
