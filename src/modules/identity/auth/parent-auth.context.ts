export type ParentAuthContext = {
  parentId: string;
  sessionId: string;
  jti: string;
};

export const PARENT_AUTH_REQUEST_KEY = 'parentAuth' as const;
