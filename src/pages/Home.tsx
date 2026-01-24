import { useEffect, useState } from 'react'
import type { Entity } from '../types/entity'
import { listEntities, deleteEntity} from '../api/entities'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Cards from '../components/Cards'
import Table from '../components/Table'
import AddPopup from '../components/AddPopup'
import EditPopup from '../components/EditPopup'

export default function Home() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEntities()
  }, [])

  async function fetchEntities() {
    setLoading(true)
    setError(null)
    try {
      const data = await listEntities()
      setEntities(data)
    } catch (err) {
      console.error(err)
      setError((err as Error)?.message || 'Failed to load entities')
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
      setError((err as Error)?.message || 'Failed to delete entity')
    }
  }

  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)

  async function handleCreateSuccess(e: Entity) {
    // insert at top
    setEntities((s) => [e, ...s])
  }

  function handleEdit(entity: Entity) {
    setEditingEntity(entity)
    setShowEdit(true)
  }

  function handleSaved(entity: Entity) {
    setEntities((s) => {
      const idx = s.findIndex((x) => x.id === entity.id)
      if (idx === -1) return [entity, ...s]
      const copy = [...s]
      copy[idx] = entity
      return copy
    })
    setEditingEntity(null)
    setShowEdit(false)
  }

  // reorder handler removed — cards no longer include Reorder action

  // Table behavior moved to `Table` component.

  return (
    <div className="min-h-screen p-6 bg-slate-900 text-gray-100">
      <Header />
      <Cards entities={entities} />
      <main>
        <div className="mb-4">
          <Table
            entities={entities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefresh={fetchEntities}
            loading={loading}
            error={error}
            onAdd={() => setShowAdd(true)}
          />
        </div>
        <AddPopup isOpen={showAdd} onClose={() => setShowAdd(false)} onCreated={handleCreateSuccess} />
        {editingEntity && (
          <EditPopup isOpen={showEdit} entity={editingEntity} onClose={() => setShowEdit(false)} onSaved={handleSaved} />
        )}
        {loading && (
          <div className="flex justify-center py-8" role="status" aria-label="home-loading">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30" />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
