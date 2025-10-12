'use client';

import { Plus, Trash2, Shield, Check } from 'lucide-react';

export default function RolesPermissionsTab({
  customRoles,
  permissions,
  currentUser,
  onCreateRole,
  onDeleteRole
}) {
  // Separate system roles from custom roles
  const systemRoles = customRoles.filter(role => role.isSystemRole);
  const userCustomRoles = customRoles.filter(role => !role.isSystemRole);

  return (
    <div className="p-6">
      {/* Default System Roles Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Default System Roles</h3>
            <p className="text-sm text-gray-600">Pre-configured roles with standard permissions</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {systemRoles.length === 0 ? (
            <div className="col-span-2 text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
              <Shield size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">No system roles configured. Contact your administrator to set up default roles.</p>
            </div>
          ) : (
            systemRoles.map(role => (
              <div key={role.id} className="border-2 border-gray-300 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${
                      role.roleSlug === 'primary_admin' ? 'bg-yellow-100 text-yellow-800' :
                      role.roleSlug === 'admin' ? 'bg-purple-100 text-purple-800' :
                      role.roleSlug === 'manager' ? 'bg-blue-100 text-blue-800' :
                      role.roleSlug === 'user' ? 'bg-green-100 text-green-800' :
                      role.roleSlug === 'viewer' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {role.roleName}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">
                      System
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-3">{role.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={14} />
                  <span className="font-medium">{role.permissionCount} permissions</span>
                </div>

                {/* Show permissions */}
                {role.permissions && role.permissions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 4).map(perm => (
                      <span
                        key={perm.id}
                        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                      >
                        <Check size={10} />
                        {perm.name}
                      </span>
                    ))}
                    {role.permissions.length > 4 && (
                      <span className="text-xs text-gray-500 px-2 py-0.5">
                        +{role.permissions.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom Roles Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Custom Roles</h3>
            <p className="text-sm text-gray-600">Create roles tailored to your organization's needs</p>
          </div>
          <button
            onClick={onCreateRole}
            className="flex items-center gap-2 bg-[#101828] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            <Plus size={20} />
            Create Custom Role
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {userCustomRoles.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Shield size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium mb-2">No custom roles yet</p>
              <p className="text-gray-500 text-sm">Create a custom role to define specific permissions for your team</p>
            </div>
          ) : (
            userCustomRoles.map(role => (
              <div key={role.id} className="border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 text-sm font-bold rounded-full bg-indigo-100 text-indigo-800">
                        {role.roleName}
                      </span>
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-medium">
                        Custom
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{role.description || 'No description provided'}</p>

                    {/* Permission Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield size={14} />
                      <span className="font-medium">{role.permissionCount} {role.permissionCount === 1 ? 'permission' : 'permissions'}</span>
                    </div>

                    {/* Show permissions */}
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.permissions.slice(0, 6).map(perm => (
                          <span
                            key={perm.id}
                            className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                          >
                            <Check size={12} />
                            {perm.name}
                          </span>
                        ))}
                        {role.permissions.length > 6 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{role.permissions.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDeleteRole(role.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete role"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Permission Reference */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Available Permissions</h4>
        <div className="space-y-6">
          {permissions.map(category => (
            <div key={category.categoryName} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">{category.categoryName}</h5>
              {category.description && (
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {category.permissions.map(perm => (
                  <div key={perm.id} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-900">{perm.name}</span>
                      {perm.description && (
                        <p className="text-xs text-gray-500">{perm.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
