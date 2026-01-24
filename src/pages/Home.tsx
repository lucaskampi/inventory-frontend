import { useEffect, useState } from 'react'
import type { Entity } from '../types/entity'
import { listEntities, deleteEntity} from '../api/entities'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Cards from '../components/Cards'
import Table from '../components/Table'
import AddPopup from '../components/AddPopup'

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

  async function handleCreateSuccess(e: Entity) {
    // insert at top
    setEntities((s) => [e, ...s])
  }

  function handleEdit(entity: Entity) {
    // open edit modal — to be implemented
    console.log('edit', entity)
  }

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
        {loading && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div></div>}
      </main>
      <Footer />
    </div>
  )
}
