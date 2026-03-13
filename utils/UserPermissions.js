export const CheckUserPermission = (permissions = []) => {
  const grantAll = permissions?.includes('all');

  const canCreate = grantAll || permissions?.includes('write');
  const canUpdate = grantAll || permissions?.includes('update');
  const canDelete = grantAll || permissions?.includes('delete');

  return {
    canCreate,
    canUpdate,
    canDelete,
  };
};
