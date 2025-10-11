'use client';

import { Plus, Trash2, Shield, Check } from 'lucide-react';

export default function RolesPermissionsTab({
  customRoles,
  permissions,
  currentUser,
  onCreateRole,
  onDeleteRole
}) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Custom Roles & Permissions</h3>
          <p className="text-sm text-gray-600">Create custom roles with specific permissions</p>
        </div>
        <button
          onClick={onCreateRole}
          className="flex items-center gap-2 bg-[#101828] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
        >
          <Plus size={20} />
          Create Custom Role
        </button>
      </div>

      {/* Roles List */}
      <div className="space-y-4 mb-8">
        {customRoles.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <Shield size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No custom roles yet. Create one to get started!</p>
          </div>
        ) : (
          customRoles.map(role => (
            <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      role.isSystemRole
                        ? role.roleSlug === 'primary_admin' ? 'bg-yellow-100 text-yellow-800' :
                          role.roleSlug === 'admin' ? 'bg-purple-100 text-purple-800' :
                          role.roleSlug === 'manager' ? 'bg-blue-100 text-blue-800' :
                          role.roleSlug === 'user' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {role.roleName}
                    </span>
                    {role.isSystemRole && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        System Role
                      </span>
                    )}
                    {!role.isSystemRole && (
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        Custom Role
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{role.description}</p>

                  {/* Permission Count */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield size={14} />
                    <span>{role.permissionCount} {role.permissionCount === 1 ? 'permission' : 'permissions'} granted</span>
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
                {!role.isSystemRole && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDeleteRole(role.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete role"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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
