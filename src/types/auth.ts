type Token = {
  token: string;
  token_id: string;
  description: string;
  created_at: string;
  expires_at: string;
  last_access: string;
  creator_email: string;
  team: string;
  roles?: Array<TokenRoleAssigned>;
};

type TokenRoleAssigned = {
  Name: string;
  ContextValue: string;
};

type UserInfo = {
  Email: string;
  Roles: Array<UserRole>;
  Groups?: Array<string>;
  Permissions: Array<UserPermission>;
};

type UserAssignable = {
  Name: string;
  ContextType: string;
  ContextValue: string;
  Group?: string;
};

type UserRole = UserAssignable;
type UserPermission = UserAssignable;

type Team = {
  name: string;
  permissions: Array<string>;
  tags: Array<string>;
};

type TeamUser = {
  email: string;
  roles: Array<string>;
};

type TeamGroup = {
  group: string;
  roles: Array<string>;
};

export type {
  Token,
  TokenRoleAssigned,
  UserInfo,
  UserRole,
  UserAssignable,
  Team,
  TeamUser,
  TeamGroup,
};
