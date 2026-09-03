import { Breadcrumbs, TextField, Typography } from "@mui/material";
import { ChangeEvent, FunctionComponent, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash.debounce";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import { Cluster } from "../../types/provisioner";
import DisplayError from "../../components/base/DisplayError";
import { useClusters } from "../../hooks/provisioner";
import { useTitle } from "react-use";
type ClusterListViewProps = {};

const ClusterListView: FunctionComponent<ClusterListViewProps> = () => {
  useTitle("Clusters");
  const [searchText, setSearchText] = useState<string>("");
  const { value, loading, error } = useClusters();
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <DisplayError error={error} />;
  }

  const columns: GridColDef<Cluster>[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 400,
      flex: 0.5,
      renderCell(params) {
        return (
          <Link href={`/admin/clusters/${params.row.name}`}>
            {params.row.name}
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
      field: "addresses",
      headerName: "Addresses",
      flex: 0.5,
      renderCell(params) {
        if (params.row.addresses.length === 0) {
          return null;
        }
        return (
          <Link href={params.row.addresses[0]}>{params.row.addresses[0]}</Link>
        );
      },
    },

    {
      field: "default",
      headerName: "Default",
      flex: 0.5,
      renderCell(params) {
        return <span>{params.row.default ? "✓" : ""}</span>;
      },
    },
  ];

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
  };

  const rows = (value || []).filter((cluster) => {
    if (searchText !== "") {
      return cluster.name.includes(searchText);
    }

    return true;
  });

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>Clusters</Typography>
      </Breadcrumbs>

      <TextField
        id="outlined-search"
        type="search"
        placeholder="Search"
        defaultValue={searchText}
        fullWidth
        size="small"
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

export default ClusterListView;
