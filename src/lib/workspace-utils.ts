export const CURRENT_WORKSPACE = "currentWorkspace";
export const keyWorkspaceBuilder = (
  counterWorkspace: string,
  userId?: string,
) => {
  return `${userId}-${counterWorkspace}`;
};
export const getWorkspaceHeader = (headers: Headers) => {
  return headers.get(CURRENT_WORKSPACE);
};
