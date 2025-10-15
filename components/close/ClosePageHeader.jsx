'use client';

import UserProfileMenu from './UserProfileMenu';

export default function ClosePageHeader({ title, subtitle }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">{title}</h1>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
        <UserProfileMenu />
      </div>
    </div>
  );
}
