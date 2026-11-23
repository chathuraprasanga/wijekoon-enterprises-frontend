export const PERMISSION_ACTION_LABELS: Record<string, string> = {
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
};

export const PERMISSION_ACTION_ORDER = ['read', 'create', 'update', 'delete'];

const MODULE_LABELS: Record<string, string> = {
  'received-cheque': 'Receive Cheques',
  'issued-cheque': 'Issue Cheques',
  'third-party-received-cheque': 'Receive 3rd Party Cheques',
  'third-party-issued-cheque': 'Issue 3rd Party Cheques',
};

// "customer" -> "Customers", "audit-log" -> "Audit logs"
export const formatModuleLabel = (module: string) => {
  const special = MODULE_LABELS[module];
  if (special) return special;
  const words = module.replace(/-/g, ' ');
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}s`;
};

export const formatPermissionKey = (key: string) => {
  const [module, action] = key.split(':');
  const actionLabel = (action && PERMISSION_ACTION_LABELS[action]) ?? action;
  return module ? `${actionLabel} ${formatModuleLabel(module)}` : (actionLabel ?? key);
};
