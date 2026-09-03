// Mirror of the tsuru API's SchemeInfo/SchemeData (types/auth/auth.go),
// returned by GET /1.18/auth/schemes.
type AuthSchemeData = {
  // OIDC fields
  clientID?: string;
  scopes?: string[];
  authURL?: string;
  tokenURL?: string;
  // Local callback port for the CLI login flow; meaningless in a browser.
  port?: string;

  // OAuth fields. The URL carries a literal __redirect_url__ placeholder the
  // client replaces with its own callback.
  authorizeUrl?: string;
};

type AuthScheme = {
  name: string;
  default?: boolean;
  data: AuthSchemeData;
};

export type { AuthScheme, AuthSchemeData };
