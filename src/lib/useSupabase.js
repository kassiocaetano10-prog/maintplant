import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const isBrowser = typeof window !== 'undefined'
const ls = (key) => isBrowser ? localStorage.getItem(key) : null
const lsSet = (key, val) => isBrowser && localStorage.setItem(key, val)

// ─── Login ───
export async function loginUser(username, password) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, name, role')
    .eq('username', username)
    .eq('password', password)
    .single()

  if (error || !data) return null
  return data
}

// ─── Maintenance Records ───
export function useMaintenanceRecords() {
  const [records, setRecords] = useState(() => {
    const saved = ls('mp_history')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(true)

  // Carregar do Supabase ao iniciar
  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .order('date', { ascending: false })

      if (!error && data) {
        setRecords(data)
        lsSet('mp_history', JSON.stringify(data))
      }
    } catch {
      // Offline — usa localStorage
    }
    setLoading(false)
  }

  const addRecord = useCallback(async (record) => {
    // Gravar no Supabase
    const row = {
      tag: record.tag,
      date: record.date,
      technician: record.technician,
      type: record.type,
      service: record.service,
      kit_changed: record.kitChanged,
      notes: record.notes,
      signature: record.signature
    }

    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(row)
      .select()
      .single()

    if (!error && data) {
      setRecords(prev => {
        const updated = [data, ...prev]
        lsSet('mp_history', JSON.stringify(updated))
        return updated
      })
      return data
    } else {
      // Fallback: gravar no localStorage
      const localRecord = { ...record, id: `local_${Date.now()}` }
      setRecords(prev => {
        const updated = [localRecord, ...prev]
        lsSet('mp_history', JSON.stringify(updated))
        return updated
      })
      return localRecord
    }
  }, [])

  return { records, addRecord, loading, reload: loadRecords }
}

// ─── Orders ───
export function useOrders() {
  const [orders, setOrders] = useState(() => {
    const saved = ls('mp_orders')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data)
        lsSet('mp_orders', JSON.stringify(data))
      }
    } catch { /* offline */ }
  }

  const addOrder = useCallback(async (order) => {
    const row = {
      zone: order.zone,
      valve_tag: order.valve_tag || order.valveTag,
      description: order.description,
      priority: order.priority || 'normal',
      status: order.status || 'pendente',
      created_by: order.createdBy || order.created_by
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(row)
      .select()
      .single()

    if (!error && data) {
      setOrders(prev => {
        const updated = [data, ...prev]
        lsSet('mp_orders', JSON.stringify(updated))
        return updated
      })
    } else {
      const localOrder = { ...order, id: `os_${Date.now()}`, created_at: new Date().toISOString() }
      setOrders(prev => {
        const updated = [localOrder, ...prev]
        lsSet('mp_orders', JSON.stringify(updated))
        return updated
      })
    }
  }, [])

  const deleteOrder = useCallback(async (id) => {
    await supabase.from('orders').delete().eq('id', id)
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== id)
      lsSet('mp_orders', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateOrderStatus = useCallback(async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, status } : o)
      lsSet('mp_orders', JSON.stringify(updated))
      return updated
    })
  }, [])

  return { orders, addOrder, deleteOrder, updateOrderStatus, reload: loadOrders }
}

// ─── Restock Requests ───
export function useRestockRequests() {
  const [requests, setRequests] = useState(() => {
    const saved = ls('mp_restock_requests')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('restock_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setRequests(data)
        lsSet('mp_restock_requests', JSON.stringify(data))
      }
    } catch { /* offline */ }
  }

  const addRequest = useCallback(async (payload) => {
    const { data, error } = await supabase
      .from('restock_requests')
      .insert(payload)
      .select()
      .single()

    if (!error && data) {
      setRequests(prev => [data, ...prev])
    } else {
      const local = { id: `rr_${Date.now()}`, status: 'pendente', created_at: new Date().toISOString(), ...payload }
      setRequests(prev => [local, ...prev])
    }
  }, [])

  const updateStatus = useCallback(async (id, status) => {
    await supabase.from('restock_requests').update({ status }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }, [])

  return { requests, addRequest, updateStatus, reload: loadRequests }
}

// ─── Stock ───
export function useStock() {
  const [stock, setStock] = useState(() => {
    const saved = ls('mp_stock')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    loadStock()
  }, [])

  const loadStock = async () => {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('kit', { ascending: true })

      if (!error && data) {
        setStock(data)
        lsSet('mp_stock', JSON.stringify(data))
      }
    } catch { /* offline */ }
  }

  return { stock, setStock, reload: loadStock }
}
