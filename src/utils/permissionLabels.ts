export const PERMISSION_ACTION_LABELS: Record<string, string> = {
  read: 'View',
  create: 'Add',
  update: 'Edit',
  delete: 'Delete',
};

export const PERMISSION_ACTION_ORDER = ['read', 'create', 'update', 'delete'];

export const formatModuleLabel = (module: string) =>
  `${module.charAt(0).toUpperCase()}${module.slice(1)}s`;

export const formatPermissionKey = (key: string) => {
  const [module, action] = key.split(':');
  const actionLabel = (action && PERMISSION_ACTION_LABELS[action]) ?? action;
  return module ? `${actionLabel} ${formatModuleLabel(module)}` : (actionLabel ?? key);
};
