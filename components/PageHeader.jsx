export default function PageHeader({ title, subtitle, children, sticky = false }) {
  return (
    <div className={`bg-white border-b border-slate-200 ${sticky ? 'sticky top-0 z-30' : ''}`}>
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">{title}</h1>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
