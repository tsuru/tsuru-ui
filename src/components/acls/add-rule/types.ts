import { Public, Dns, Apps, Storage } from "@mui/icons-material";
import { ACLProtoPort } from "../../../types/acl";

export type DestinationType =
  | "tsuruApp"
  | "rpaasInstance"
  | "externalDNS"
  | "externalIP";

export type DestinationOption = {
  id: DestinationType;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Public;
};

export const destinationOptions: DestinationOption[] = [
  {
    id: "externalDNS",
    title: "DNS",
    subtitle: "Domain Name",
    description: "Allow access to a service via DNS hostname.",
    icon: Dns,
  },
  {
    id: "externalIP",
    title: "IP",
    subtitle: "IP Address / CIDR",
    description: "Allow access to a service via IP address or CIDR block.",
    icon: Public,
  },
  {
    id: "tsuruApp",
    title: "Tsuru App",
    subtitle: "Internal Application",
    description:
      "Allow access to another Tsuru application within the platform.",
    icon: Apps,
  },
  {
    id: "rpaasInstance",
    title: "RPaaS Instance",
    subtitle: "Reverse Proxy",
    description:
      "Allow access to an RPaaS (Reverse Proxy as a Service) instance.",
    icon: Storage,
  },
];

export const PROTOCOLS = ["TCP", "UDP"] as const;
export const DEFAULT_PROXY = "http://proxy:3128";

export const validateCIDR = (value: string): boolean => {
  if (!value) return false;

  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  if (!cidrRegex.test(value)) return false;

  const [ip, prefix] = value.split("/");
  const octets = ip.split(".").map(Number);
  if (octets.some((octet) => octet < 0 || octet > 255)) return false;

  if (prefix !== undefined) {
    const prefixNum = parseInt(prefix, 10);
    if (prefixNum < 0 || prefixNum > 32) return false;
  }

  return true;
};

export type PortsState = {
  ports: ACLProtoPort[];
  addPort: () => void;
  updatePort: (index: number, port: ACLProtoPort) => void;
  removePort: (index: number) => void;
};
