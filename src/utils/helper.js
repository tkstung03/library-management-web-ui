export const checkUserHasRequiredRole = (userPermissions, permission) => userPermissions.includes(permission);

export const checkIdIsNumber = (id) => {
    return !isNaN(id) && /^-?\d+$/.test(id);
};
