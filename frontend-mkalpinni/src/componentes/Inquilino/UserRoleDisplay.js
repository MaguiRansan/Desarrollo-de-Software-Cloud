import React from 'react';
import { useUser } from '../../Context/UserContext';

const UserRoleDisplay = ({ className = "" }) => {
  const { userRoleName } = useUser();

  if (!userRoleName || userRoleName === 'Administrador') {
    return null;
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded ${className}`}>
      Tipo: {userRoleName}
    </div>
  );
};

export default UserRoleDisplay;
