export type ResourceType = "NOTE" | "AUDIOBOOK";

export type LibraryPlan = {
  id: string;
  title: string;
  description: string | null;
  pricePaise: number;
  freeLimit: number;
};

export type LibraryResource = {
  id: string;
  type: ResourceType;
  title: string;
  description: string | null;
  coverUrl: string | null;
  isFree: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  locked: boolean;
  fileUrl: string | null;
};

export type LibraryPayload = {
  plan: LibraryPlan;
  subscribed: boolean;
  resources: LibraryResource[];
};
