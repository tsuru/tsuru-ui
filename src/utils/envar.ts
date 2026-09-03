const SENSITIVE_KEYWORDS = [
  "KEY",
  "TOKEN",
  "SECRET",
  "PASSWORD",
  "CREDENTIAL",
  "API_KEY",
  "APIKEY",
];

export const isSensitiveName = (name: string): boolean => {
  const upperName = name.toUpperCase();
  return SENSITIVE_KEYWORDS.some((keyword) => upperName.includes(keyword));
};
