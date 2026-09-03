import { Breadcrumbs, Snackbar, TextField, Typography } from "@mui/material";
import { ChangeEvent, FunctionComponent, useState } from "react";
import { Token } from "../../types/auth";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash.debounce";
import { humanDate } from "../../utils/time";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import DisplayError from "../../components/base/DisplayError";
import { useTokens } from "../../hooks/auth";
import { useTitle } from "react-use";
type TokenListViewProps = {};

const TokenListView: FunctionComponent<TokenListViewProps> = () => {
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarError, setSnackBarError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState<string>("");
  const { value, loading, error } = useTokens();
  useTitle("Tokens");

  if (error) {
    return <DisplayError error={error} />;
  }

  if (loading || !value) {
    return <Loading />;
  }

  const columns: GridColDef<Token>[] = [
    {
      field: "token_id",
      headerName: "Token",
      minWidth: 400,
      flex: 0.5,
      renderCell(params) {
        return (
          <Link href={`/tokens/${params.row.token_id}`}>
            {params.row.token_id}
          </Link>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 0.5,
    },
    {
      field: "team",
      headerName: "Team",
      flex: 0.5,
    },
    {
      field: "created_at",
      headerName: "Created at",
      flex: 0.5,
      renderCell: (params) => {
        return humanDate(params.row.created_at);
      },
    },
    {
      field: "expires_at",
      headerName: "Expires at",
      flex: 0.5,
      renderCell: (params) => {
        if (
          params.row.expires_at === "" ||
          params.row.expires_at === "0001-01-01T00:00:00Z"
        ) {
          return "never";
        }
        return humanDate(params.row.expires_at);
      },
    },

    {
      field: "last_access",
      headerName: "Last access",
      flex: 0.5,
      renderCell: (params) => {
        if (
          params.row.last_access === "" ||
          params.row.last_access === "0001-01-01T00:00:00Z"
        ) {
          return "never";
        }
        return humanDate(params.row.last_access);
      },
    },

    {
      field: "roles",
      headerName: "Roles",
      flex: 0.6,

      renderCell: (params) => {
        const elems = (params.row.roles || []).map((role) => (
          <li>
            {role.ContextValue
              ? `${role.Name} (${role.ContextValue})`
              : role.Name}
          </li>
        ));

        return <ul>{elems}</ul>;
      },
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          label="Copy token secret to clipboard"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(params.row.token);
              setSnackBarOpen(true);
            } catch (e) {
              setSnackBarOpen(true);
              setSnackBarError(`${e}`);
            }
          }}
          showInMenu
        />,
      ],
    },
  ];

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
  };

  const rows = value.filter((token) => {
    if (searchText !== "") {
      return (
        token.token_id.includes(searchText) ||
        token.description.includes(searchText)
      );
    }

    return true;
  });

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>Tokens</Typography>
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
        getRowId={(row) => row.token_id}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
          columns: {
            columnVisibilityModel: {
              expires_at: false,
              created_at: false,
              last_access: false,
              roles: false,
            },
          },
          sorting: {
            sortModel: [
              {
                field: "id",
                sort: "asc",
              },
            ],
          },
        }}
        pageSizeOptions={[100]}
        disableRowSelectionOnClick
        sx={{ height: "80%" }}
      />

      <Snackbar
        open={snackBarOpen}
        autoHideDuration={3000}
        onClose={() => {
          setSnackBarOpen(false);
        }}
        message={snackBarError ? snackBarError : "Token copied to clipboard"}
      />
    </>
  );
};

export default TokenListView;
