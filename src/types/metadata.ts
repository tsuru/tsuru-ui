type Metadata = {
  labels: Array<MetadataNameValue>;
  annotations: Array<MetadataNameValue>;
};

type MetadataNameValue = {
  name: string;
  value: string;
};

export type { Metadata, MetadataNameValue };
