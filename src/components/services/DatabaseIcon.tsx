import { FunctionComponent } from "react";

import { ReactComponent as MySQLLogo } from "../../databases/mysql.svg";
import { ReactComponent as RedisLogo } from "../../databases/redis.svg";
import { ReactComponent as MongoDBLogo } from "../../databases/mongodb.svg";

type DatabaseIconProps = {
  database: string;
};
const PlatformIcon: FunctionComponent<DatabaseIconProps> = ({ database }) => {
  if (database === "mysql") {
    return <MySQLLogo width={"30px"} height={"30px"} />;
  }

  if (database === "redis") {
    return <RedisLogo width={"30px"} height={"30px"} />;
  }

  if (database === "mongodb") {
    return <MongoDBLogo width={"30px"} height={"30px"} />;
  }

  return null;
};

export default PlatformIcon;
