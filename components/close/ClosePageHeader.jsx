'use client';

import UserProfileMenu from './UserProfileMenu';

export default function ClosePageHeader({ title, subtitle }) {
  return (
    <div className="bg-[#101828] text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-300">{subtitle}</p>
        </div>
        <UserProfileMenu />
      </div>
    </div>
  );
}
