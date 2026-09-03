import Dataset from "@mui/icons-material/Dataset";
import Public from "@mui/icons-material/Public";
import SensorDoor from "@mui/icons-material/SensorDoor";
import Security from "@mui/icons-material/Security";
import HeartBroken from "@mui/icons-material/HeartBroken";

import config from "../../config";

type ServiceIconProps = {
  service: string;
};

const iconsRepository: Record<string, any> = {
  Dataset,
  Public,
  SensorDoor,
  Security,
  HeartBroken,
};

// Built on first render rather than at import time, since the services come
// from the config loaded at boot.
let iconsByServiceName: Record<string, any> | null = null;

const buildIconsByServiceName = (): Record<string, any> => {
  const byName: Record<string, any> = {};

  for (const service of config.services || []) {
    byName[service.name] = iconsRepository[service.icon];

    for (const additionalService of service.additionalServices || []) {
      byName[additionalService] = iconsRepository[service.icon];
    }
  }

  return byName;
};

const ServiceIcon = (props: ServiceIconProps) => {
  if (!iconsByServiceName) {
    iconsByServiceName = buildIconsByServiceName();
  }

  const Icon = iconsByServiceName[props.service];

  if (Icon) {
    return <Icon />;
  }

  return null;
};

export default ServiceIcon;
