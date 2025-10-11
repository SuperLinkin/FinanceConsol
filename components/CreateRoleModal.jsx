'use client';

import { Check, X } from 'lucide-react';

export default function CreateRoleModal({
  permissions,
  selectedPermissions,
  onTogglePermission,
  onSubmit,
  onClose
}) {
  return (
    <div className="fixed right-0 top-0 h-full w-[800px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Create Custom Role</h3>
            <p className="text-sm text-slate-300 mt-1">Configure role permissions and access levels</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  name="roleName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                  placeholder="e.g., Financial Analyst"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                  placeholder="Describe the purpose and scope of this role..."
                />
              </div>
            </div>

          {/* Permissions Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions * (Select at least one)
            </label>
            <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
              {permissions.map(category => (
                <div key={category.categoryName} className="border-b border-gray-200 last:border-b-0">
                  <div className="bg-gray-50 px-4 py-2">
                    <h4 className="font-medium text-gray-900 text-sm">{category.categoryName}</h4>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {category.permissions.map(perm => (
                      <label
                        key={perm.id}
                        className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => onTogglePermission(perm.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {perm.name}
                            </span>
                          </div>
                          {perm.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Count */}
            <div className="mt-2 text-sm text-gray-600">
              <Check size={14} className="inline mr-1" />
              {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
            </div>
          </div>

            {/* Save Button */}
            <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={selectedPermissions.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Role
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
