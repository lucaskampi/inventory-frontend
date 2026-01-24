import { useMemo, useState } from 'react'
import { formatNumberBR } from '../utils/number'
import type { Entity } from '../types/entity'

export function formatPrice(p?: number | null) {
  if (p === null || p === undefined) return '—'
  if (typeof p === 'number' && Number.isFinite(p)) return formatNumberBR(p)
  if (typeof p === 'string') {
    const n = Number(p)
    if (!Number.isNaN(n) && Number.isFinite(n)) return formatNumberBR(n)
  }
  return '—'
}

type Props = {
  entities: Entity[]
  onEdit: (e: Entity) => void
  onDelete: (id: number) => void
  onRefresh?: () => void
  onAdd?: () => void
  pageSizes?: number[]
  initialPageSize?: number
  loading?: boolean
  error?: string | null
}

export default function Table({
  entities,
  onEdit,
  onDelete,
  onRefresh,
  onAdd,
  pageSizes = [5, 10, 25],
  initialPageSize = 10,
  loading = false,
  error = null,
}: Props) {
  const [searchName, setSearchName] = useState('')
  const [searchType, setSearchType] = useState('')
  const [searchDesc, setSearchDesc] = useState('')
  const [pageSize, setPageSize] = useState(initialPageSize)
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
    <div className="text-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Entities</h3>
        <div className="flex items-center">
          {onAdd && (
            <button
              title="Add"
              onClick={() => onAdd && onAdd()}
              className="mr-2 px-3 py-1 rounded bg-blue-500 hover:bg-blue-400 text-white"
            >
              +
            </button>
          )}
          <button
            title="Refresh"
            onClick={() => onRefresh && onRefresh()}
            disabled={loading}
            className="text-gray-400 hover:text-gray-200 ml-2 px-2 py-1 rounded bg-gray-900 disabled:opacity-50"
          >
            ⟳
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-800 text-red-100 rounded">{error}</div>
      )}

      <div className="bg-gray-800 rounded-lg p-3 shadow-sm">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 w-1/4">
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
              <th className="text-left p-3 w-1/6">
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
              <th className="text-right p-3 w-32">Price</th>
              <th className="text-right p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-gray-400">
                  {loading ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/30"></div>
                      Loading...
                    </div>
                  ) : (
                    'No entities found'
                  )}
                </td>
              </tr>
            ) : (
              pageItems.map((e) => (
                <tr key={e.id} className="border-t border-gray-700">
                  <td className="p-3">{e.name || '—'}</td>
                  <td className="p-3">{e.type}</td>
                  <td className="p-3">{e.description || '—'}</td>
                  <td className="p-3 text-right">{formatPrice(e.price)}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => onEdit(e)} title="Edit" disabled={loading} className="text-blue-400 hover:text-blue-300 p-1 mr-2 disabled:opacity-50">
                      <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21v-3a4 4 0 014-4h9"/><path d="M16.5 6.5 19.5 9.5 8 21H5v-3L16.5 6.5z"/></svg>
                    </button>
                    <button onClick={() => onDelete(e.id)} title="Delete" disabled={loading} className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50">
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
            {pageSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="text-gray-400">Showing {filtered.length} of {entities.length}</div>

          <div className="flex gap-2">
            <button onClick={() => gotoPage(0)} disabled={page === 0} className="text-gray-400 disabled:opacity-50">|&lt;</button>
            <button onClick={() => gotoPage(page - 1)} disabled={page === 0} className="text-gray-400 disabled:opacity-50">&lt;</button>
            <button onClick={() => gotoPage(page + 1)} disabled={page >= pageCount - 1} className="text-gray-400 disabled:opacity-50">&gt;</button>
            <button onClick={() => gotoPage(pageCount - 1)} disabled={page >= pageCount - 1} className="text-gray-400 disabled:opacity-50">&gt;|</button>
          </div>
        </div>
      </div>

      
    </div>
  )
}
