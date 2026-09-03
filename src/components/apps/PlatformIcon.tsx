import { ComponentType, FunctionComponent, SVGProps } from "react";

import { ReactComponent as PythonLogo } from "../../platforms/python.svg";
import { ReactComponent as GolangLogo } from "../../platforms/go.svg";
import { ReactComponent as NodeJSLogo } from "../../platforms/nodejs.svg";
import { ReactComponent as RubyLogo } from "../../platforms/ruby.svg";
import { ReactComponent as StaticLogo } from "../../platforms/static.svg";
import { ReactComponent as JavaLogo } from "../../platforms/java.svg";
import { ReactComponent as PHPLogo } from "../../platforms/php.svg";
import { ReactComponent as DockerLogo } from "../../platforms/docker.svg";

const CONTAINER_SIZE = 32;

const containerStyle: React.CSSProperties = {
  width: CONTAINER_SIZE,
  height: CONTAINER_SIZE,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  overflow: "hidden",
};

const iconStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
};

type PlatformEntry = {
  component: ComponentType<SVGProps<SVGSVGElement>>;
  keywords: string[];
};

const platformEntries: PlatformEntry[] = [
  { component: GolangLogo, keywords: ["go"] },
  { component: NodeJSLogo, keywords: ["node"] },
  { component: PythonLogo, keywords: ["python", "pypy"] },
  { component: RubyLogo, keywords: ["ruby", "rshine"] },
  { component: StaticLogo, keywords: ["static"] },
  { component: JavaLogo, keywords: ["java"] },
  { component: PHPLogo, keywords: ["php"] },
  { component: DockerLogo, keywords: ["docker"] },
];

function findPlatformEntry(platform: string): PlatformEntry | undefined {
  const lower = platform.toLowerCase();
  return platformEntries.find((entry) =>
    entry.keywords.some((kw) => lower.includes(kw))
  );
}

type PlatformIconProps = {
  platform?: string;
};

const PlatformIcon: FunctionComponent<PlatformIconProps> = ({ platform }) => {
  const entry = platform ? findPlatformEntry(platform) : undefined;

  if (!entry) {
    return null;
  }
  const Icon = entry?.component ?? DockerLogo;

  return (
    <div style={containerStyle}>
      <Icon style={iconStyle} />
    </div>
  );
};

export default PlatformIcon;
