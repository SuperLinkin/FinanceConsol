import UserProfileButton from './UserProfileButton';

export default function PageHeader({ title, subtitle, children, sticky = false, icon: Icon }) {
  return (
    <div className={`bg-white border-b border-slate-200 ${sticky ? 'sticky top-0 z-30' : ''}`}>
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon size={20} className="text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#101828]">{title}</h1>
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {children}
          <UserProfileButton />
        </div>
      </div>
    </div>
  );
}
