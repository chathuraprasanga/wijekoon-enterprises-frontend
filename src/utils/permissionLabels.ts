export const PERMISSION_ACTION_LABELS: Record<string, string> = {
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
};

export const PERMISSION_ACTION_ORDER = ['read', 'create', 'update', 'delete'];

// "customer" -> "Customers", "audit-log" -> "Audit logs"
export const formatModuleLabel = (module: string) => {
  const words = module.replace(/-/g, ' ');
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}s`;
};

export const formatPermissionKey = (key: string) => {
  const [module, action] = key.split(':');
  const actionLabel = (action && PERMISSION_ACTION_LABELS[action]) ?? action;
  return module ? `${actionLabel} ${formatModuleLabel(module)}` : (actionLabel ?? key);
};
