import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "../../components/base/MuiLink";
import UnitList from "../../components/apps/UnitList";
import { useAppsUnits } from "../../hooks/app";
import Loading from "../Loading";

const AppsUnitList = () => {
  const units = useAppsUnits();

  if (units.loading || !units.value) {
    return <Loading />;
  }

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href="/apps">
          Apps
        </Link>
        <Typography color="text.primary">Units</Typography>
      </Breadcrumbs>

      <UnitList units={units.value} sx={{ height: "90%" }} />
    </>
  );
};

export default AppsUnitList;
