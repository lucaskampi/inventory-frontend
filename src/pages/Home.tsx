import React, { useEffect, useState, useMemo } from 'react'
import type { Entity } from '../types/entities'
import { listEntities, deleteEntity } from '../api/entities'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Cards from '../components/Cards'
import Table from '../components/Table'

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
            onAdd={() => alert('Add')}
          />
        </div>
        {loading && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div></div>}
      </main>
      <Footer />
    </div>
  )
}
