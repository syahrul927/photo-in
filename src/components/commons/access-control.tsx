import React, { createContext, useContext } from "react";
import {
  Role,
  Feature,
  Permission,
  rolePermissions,
} from "../../config/permissions";

interface AccessControlContextValue {
  hasAccess: boolean;
}

const AccessControlContext = createContext<AccessControlContextValue>({
  hasAccess: false,
});

export const useAccessControl = () => useContext(AccessControlContext);

interface AccessControlProps {
  role: Role;
  feature: Feature;
  permission: Permission;
  hideWhenNoAccess?: boolean;
  children: React.ReactNode;
}

const AccessControl: React.FC<AccessControlProps> = ({
  role,
  feature,
  permission,
  hideWhenNoAccess = true,
  children,
}) => {
  const hasAccess =
    rolePermissions[role]?.[feature]?.includes(permission) ?? false;

  if (!hasAccess && hideWhenNoAccess) {
    return null;
  }

  return (
    <AccessControlContext.Provider value={{ hasAccess }}>
      {children}
    </AccessControlContext.Provider>
  );
};

export default AccessControl;
