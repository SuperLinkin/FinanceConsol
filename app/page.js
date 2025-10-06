export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <div className="max-w-[1600px] mx-auto px-12 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#101828] mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">IFRS Consolidation Hub Overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 mb-1">Total Entities</div>
            <div className="text-4xl font-bold text-[#101828]">12</div>
            <div className="text-sm text-green-600 mt-3 font-medium">↑ 2 new this month</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 mb-1">Pending Submissions</div>
            <div className="text-4xl font-bold text-[#101828]">3</div>
            <div className="text-sm text-orange-600 mt-3 font-medium">Due in 5 days</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 mb-1">Current Period</div>
            <div className="text-4xl font-bold text-[#101828]">Q4 2024</div>
            <div className="text-sm text-gray-600 mt-3 font-medium">Oct - Dec 2024</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 mb-1">Consolidation Status</div>
            <div className="text-4xl font-bold text-green-600">75%</div>
            <div className="text-sm text-gray-600 mt-3 font-medium">9 of 12 complete</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-[14px] shadow-sm overflow-hidden">
          <div className="bg-[#101828] text-white px-6 py-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-base text-[#101828] font-semibold">Entity XYZ submitted trial balance</p>
                  <p className="text-sm text-gray-600 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-base text-[#101828] font-semibold">Intercompany reconciliation completed</p>
                  <p className="text-sm text-gray-600 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-base text-[#101828] font-semibold">Pending approval: Q4 adjustments</p>
                  <p className="text-sm text-gray-600 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}