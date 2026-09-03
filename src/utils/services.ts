import config from "../config";

type hrefForInstanceSignature = (service: string, instance: string) => string;

// Built on first use rather than at import time, since the services come from
// the config loaded at boot.
let hrefForInstanceByService: Record<string, hrefForInstanceSignature> | null =
  null;

const buildHrefForInstanceByService = (): Record<
  string,
  hrefForInstanceSignature
> => {
  const byService: Record<string, hrefForInstanceSignature> = {};

  for (const service of config.services || []) {
    if (service.hrefForInstance) {
      byService[service.name] = service.hrefForInstance;

      for (const additionalService of service.additionalServices || []) {
        byService[additionalService] = service.hrefForInstance;
      }
    }
  }

  return byService;
};

const hrefForInstance = (
  service: string,
  instance: string
): [string, string] => {
  if (!hrefForInstanceByService) {
    hrefForInstanceByService = buildHrefForInstanceByService();
  }

  if (hrefForInstanceByService[service]) {
    const href = hrefForInstanceByService[service](service, instance);

    if (href.startsWith("/")) {
      return [href, ""];
    }

    return [href, "_blank"];
  }

  return [`/services/${service}/${instance}`, ""];
};

export { hrefForInstance };
