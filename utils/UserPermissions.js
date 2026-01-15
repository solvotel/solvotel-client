export const CheckUserPermission = (permissions) => {
  const canCreate = permissions?.includes('write');
  const canUpdate = permissions?.includes('update');
  const canDelete = permissions?.includes('delete');

  return {
    canCreate,
    canUpdate,
    canDelete,
  };
};
