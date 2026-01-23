export default function Cards({ entities }: { entities: any[] }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-400">Total Entities</div>
          <div className="text-2xl font-bold">{entities.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-400">Test ($)</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-400">Test D0</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-400">Test D-1</div>
          <div className="text-2xl font-bold">0</div>
        </div>
    </section>
  )
}