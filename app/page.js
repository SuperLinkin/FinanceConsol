export default function Home() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Financial Consolidation System</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Entities</div>
          <div className="text-3xl font-bold text-gray-900">12</div>
          <div className="text-xs text-green-600 mt-2">↑ 2 new this month</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Pending Submissions</div>
          <div className="text-3xl font-bold text-gray-900">3</div>
          <div className="text-xs text-orange-600 mt-2">Due in 5 days</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Current Period</div>
          <div className="text-3xl font-bold text-gray-900">Q4 2024</div>
          <div className="text-xs text-gray-500 mt-2">Oct - Dec 2024</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Consolidation Status</div>
          <div className="text-3xl font-bold text-green-600">75%</div>
          <div className="text-xs text-gray-500 mt-2">9 of 12 complete</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">Entity XYZ submitted trial balance</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">Intercompany reconciliation completed</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">Pending approval: Q4 adjustments</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}