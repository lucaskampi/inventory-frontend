import React, { useEffect, useState, useMemo } from 'react'
import type { Entity } from '../types/entities'
import { listEntities, deleteEntity } from '../api/entities'

export default function Home() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEntities()
  }, [])

  async function fetchEntities() {
    setLoading(true)
    try {
      const data = await listEntities()
      setEntities(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this entity?')) return
    try {
      await deleteEntity(id)
      setEntities((s) => s.filter((e) => e.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  function handleEdit(entity: Entity) {
    // open edit modal — to be implemented
    console.log('edit', entity)
  }

  // Table internal state (previously in EntityTable)
  const [searchName, setSearchName] = useState('')
  const [searchType, setSearchType] = useState('')
  const [searchDesc, setSearchDesc] = useState('')
  const PAGE_SIZES = [5, 10, 25]
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1])
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    return entities.filter((e) => {
      if (searchName && !(e.name || '').toLowerCase().includes(searchName.toLowerCase())) return false
      if (searchType && !e.type.toLowerCase().includes(searchType.toLowerCase())) return false
      if (searchDesc && !(e.description || '').toLowerCase().includes(searchDesc.toLowerCase())) return false
      return true
    })
  }, [entities, searchName, searchType, searchDesc])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = page * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  function gotoPage(p: number) {
    setPage(Math.max(0, Math.min(pageCount - 1, p)))
  }

  return (
    <div className="min-h-screen p-6 bg-slate-900 text-gray-100">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Home</h1>
          </div>
          <div>
            <button className="text-gray-300 hover:text-white">⚙️</button>
          </div>
        </div>
      </header>

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

      <main>
        <div className="mb-4">
          {/* Inlined EntityTable */}
          <div className="text-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Entities</h3>
              <div className="flex gap-2">
                <button title="Toggle view" className="text-gray-400 hover:text-gray-200 bg-transparent p-2 rounded">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>
                </button>
                <button title="Refresh" onClick={() => fetchEntities()} className="text-gray-400 hover:text-gray-200 bg-transparent p-2 rounded">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 12a8 8 0 10-2.5 5.5L20 20"/><path d="M20 4v6h-6"/></svg>
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 shadow-sm">
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 w-1/3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Name</span>
                        <input
                          placeholder=""
                          value={searchName}
                          onChange={(e) => {
                            setSearchName(e.target.value)
                            setPage(0)
                          }}
                          className="ml-1 px-2 py-1 rounded bg-gray-900 text-gray-200 border border-gray-700"
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 w-1/5">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Type</span>
                        <input
                          placeholder=""
                          value={searchType}
                          onChange={(e) => {
                            setSearchType(e.target.value)
                            setPage(0)
                          }}
                          className="ml-1 px-2 py-1 rounded bg-gray-900 text-gray-200 border border-gray-700"
                        />
                      </div>
                    </th>
                    <th className="text-left p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Description</span>
                        <input
                          placeholder=""
                          value={searchDesc}
                          onChange={(e) => {
                            setSearchDesc(e.target.value)
                            setPage(0)
                          }}
                          className="ml-1 px-2 py-1 rounded bg-gray-900 text-gray-200 border border-gray-700 w-full"
                        />
                      </div>
                    </th>
                    <th className="text-right p-3 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-gray-400">
                        No entities found
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((e) => (
                      <tr key={e.id} className="border-t border-gray-700">
                        <td className="p-3">{e.name || '—'}</td>
                        <td className="p-3">{e.type}</td>
                        <td className="p-3">{e.description || '—'}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleEdit(e)} title="Edit" className="text-blue-400 hover:text-blue-300 p-1 mr-2">
                            <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21v-3a4 4 0 014-4h9"/><path d="M16.5 6.5 19.5 9.5 8 21H5v-3L16.5 6.5z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(e.id)} title="Delete" className="text-red-400 hover:text-red-300 p-1">
                            <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex justify-end items-center mt-3 gap-3">
                <div className="text-gray-400">Items per page:</div>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(0)
                  }}
                  className="bg-gray-900 text-gray-200 border border-gray-700 px-2 py-1 rounded"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <div className="text-gray-400">{filtered.length} of {filtered.length}</div>

                <div className="flex gap-2">
                  <button onClick={() => gotoPage(0)} disabled={page === 0} className="text-gray-400 disabled:opacity-50">|&lt;</button>
                  <button onClick={() => gotoPage(page - 1)} disabled={page === 0} className="text-gray-400 disabled:opacity-50">&lt;</button>
                  <button onClick={() => gotoPage(page + 1)} disabled={page >= pageCount - 1} className="text-gray-400 disabled:opacity-50">&gt;</button>
                  <button onClick={() => gotoPage(pageCount - 1)} disabled={page >= pageCount - 1} className="text-gray-400 disabled:opacity-50">&gt;|</button>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('Add')}
              aria-label="Add New Item"
              className="fixed right-5 bottom-5 bg-blue-500 hover:bg-blue-400 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl"
            >
              +
            </button>
          </div>
        </div>
        {loading && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div></div>}
      </main>
    </div>
  )
}
