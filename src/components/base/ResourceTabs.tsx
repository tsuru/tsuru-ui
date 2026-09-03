import { FunctionComponent, ReactNode } from "react";
import { Tabs, Tab, Box, Badge, alpha, useTheme } from "@mui/material";

export type TabConfig<T extends string> = {
  value: T;
  label: string;
  icon: ReactNode;
};

type ResourceTabsProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  tabs: TabConfig<T>[];
  badgeCounts?: Partial<Record<T, number>>;
};

function ResourceTabs<T extends string>({
  value,
  onChange,
  tabs,
  badgeCounts = {},
}: ResourceTabsProps<T>) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        mb: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        borderRadius: "12px 12px 0 0",
      }}
    >
      <Tabs
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 56,
          "& .MuiTab-root": {
            minHeight: 56,
            textTransform: "none",
            fontSize: "0.9rem",
            fontWeight: 500,
            gap: 1,
            px: 2.5,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
            "&.Mui-selected": {
              fontWeight: 600,
            },
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        }}
      >
        {tabs.map((tab) => {
          const badge = badgeCounts[tab.value];
          return (
            <Tab
              key={tab.value}
              value={tab.value}
              icon={
                <Badge
                  badgeContent={badge}
                  color="primary"
                  max={999}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.65rem",
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  {tab.icon}
                </Badge>
              }
              label={tab.label}
              iconPosition="start"
            />
          );
        })}
      </Tabs>
    </Box>
  );
}

export default ResourceTabs as <T extends string>(
  props: ResourceTabsProps<T>
) => ReturnType<FunctionComponent<ResourceTabsProps<T>>>;
