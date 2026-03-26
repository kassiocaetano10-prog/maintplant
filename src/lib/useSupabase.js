import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { hashPassword } from './auth'
import { ls, lsSet, safeParse } from './utils'

const normalizeOrder = (row = {}) => ({
  ...row,
  zona: row.zona ?? row.zone ?? '',
  zone: row.zone ?? row.zona ?? '',
  valveTag: row.valveTag ?? row.valve_tag ?? '',
  valve_tag: row.valve_tag ?? row.valveTag ?? '',
  observacoes: row.observacoes ?? row.description ?? '',
  description: row.description ?? row.observacoes ?? '',
  createdBy: row.createdBy ?? row.created_by ?? '',
  created_by: row.created_by ?? row.createdBy ?? ''
})

const normalizeRequest = (row = {}) => ({
  ...row,
  ref: row.ref ?? row.kit ?? '',
  kit: row.kit ?? row.ref ?? '',
  description: row.description ?? row.reason ?? '',
  reason: row.reason ?? row.description ?? '',
  suggestedBy: row.suggestedBy ?? row.suggested_by ?? row.created_by ?? '',
  suggested_by: row.suggested_by ?? row.suggestedBy ?? row.created_by ?? '',
  createdAt: row.createdAt ?? row.created_at ?? null,
  created_at: row.created_at ?? row.createdAt ?? null
})

const normalizeStock = (row = {}) => ({
  ...row,
  ref: row.ref ?? row.kit ?? '',
  kit: row.kit ?? row.ref ?? '',
  minQuantity: row.minQuantity ?? row.min_quantity ?? 0,
  min_quantity: row.min_quantity ?? row.minQuantity ?? 0,
  brand: row.brand ?? row.location ?? 'Sem fabricante',
  location: row.location ?? row.brand ?? 'Sem fabricante'
})

// ─── Login ───
export async function loginUser(username, password) {
  // Hashear password no cliente antes de enviar
  const passwordHash = await hashPassword(password)

  const { data, error } = await supabase.rpc('app_login', {
    p_username: username,
    p_password_hash: passwordHash,
    p_password_plain: password  // fallback para migração (remover após hashear BD)
  })

  if (!error && data) {
    const user = Array.isArray(data) ? data[0] : data
    if (user && user.id) return user
  }

  return null
}

// ─── Valves ───
export function useValves() {
  const [valves, setValves] = useState(() => safeParse(ls('mp_valves'), []))
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadValves() }, [])

  const loadValves = async () => {
    try {
      const { data, error } = await supabase.from('valves').select('*')
      if (!error && data) {
        setValves(data)
        lsSet('mp_valves', JSON.stringify(data))
      }
    } catch { /* offline */ }
    setLoading(false)
  }
  return { valves, loading, reload: loadValves }
}

// ─── Maintenance Records ───
export function useMaintenanceRecords() {
  const [records, setRecords] = useState(() => {
    return safeParse(ls('mp_history'), [])
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
    return safeParse(ls('mp_orders'), [])
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
        const normalized = data.map(normalizeOrder)
        setOrders(normalized)
        lsSet('mp_orders', JSON.stringify(normalized))
      }
    } catch { /* offline */ }
  }

  const addOrder = useCallback(async (order) => {
    const row = {
      zone: order.zone || order.zona || '',
      valve_tag: order.valve_tag || order.valveTag || '',
      description: order.description || order.obs || order.observacoes || '',
      priority: order.priority || 'normal',
      status: order.status || 'pendente',
      created_by: order.createdBy || order.created_by || '',
      tecnico: order.tecnico || '',
      data_programada: order.data_programada || null
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(row)
      .select()
      .single()

    if (!error && data) {
      setOrders(prev => {
        const updated = [normalizeOrder(data), ...prev]
        lsSet('mp_orders', JSON.stringify(updated))
        return updated
      })
    } else {
      const localOrder = normalizeOrder({ ...order, id: `os_${Date.now()}`, created_at: new Date().toISOString() })
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
    return safeParse(ls('mp_restock_requests'), [])
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
        const normalized = data.map(normalizeRequest)
        setRequests(normalized)
        lsSet('mp_restock_requests', JSON.stringify(normalized))
      }
    } catch { /* offline */ }
  }

  const addRequest = useCallback(async (payload) => {
    const row = {
      kit: payload.kit || payload.ref || '',
      ref: payload.ref || payload.kit || '',
      reason: payload.reason || payload.description || '',
      description: payload.description || payload.reason || '',
      created_by: payload.suggestedBy || payload.suggested_by || payload.created_by || '',
      suggested_by: payload.suggested_by || payload.suggestedBy || payload.created_by || '',
      status: 'pendente'
    }

    const { data, error } = await supabase
      .from('restock_requests')
      .insert(row)
      .select()
      .single()

    if (!error && data) {
      setRequests(prev => {
        const updated = [normalizeRequest(data), ...prev]
        lsSet('mp_restock_requests', JSON.stringify(updated))
        return updated
      })
    } else {
      const local = normalizeRequest({ id: `rr_${Date.now()}`, status: 'pendente', created_at: new Date().toISOString(), ...payload })
      setRequests(prev => {
        const updated = [local, ...prev]
        lsSet('mp_restock_requests', JSON.stringify(updated))
        return updated
      })
    }
  }, [])

  const updateStatus = useCallback(async (id, status) => {
    await supabase.from('restock_requests').update({ status }).eq('id', id)
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status } : r)
      lsSet('mp_restock_requests', JSON.stringify(updated))
      return updated
    })
  }, [])

  return { requests, addRequest, updateStatus, reload: loadRequests }
}

// ─── Stock ───
export function useStock() {
  const [stock, setStock] = useState(() => {
    return safeParse(ls('mp_stock'), [])
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
        const normalized = data.map(normalizeStock)
        setStock(normalized)
        lsSet('mp_stock', JSON.stringify(normalized))
      }
    } catch { /* offline */ }
  }

  const addOrIncrementStock = useCallback(async ({ ref, brand, quantity = 1, minQuantity = 1 }) => {
    const normalizedRef = (ref || '').trim()
    if (!normalizedRef) return
    const current = stock.find((item) => (item.ref || '').toLowerCase() === normalizedRef.toLowerCase())
    if (current) {
      const nextQty = Math.max(0, Number(current.quantity || 0) + Number(quantity || 0))
      const { data, error } = await supabase
        .from('stock')
        .update({
          quantity: nextQty,
          min_quantity: Number(minQuantity ?? current.minQuantity ?? current.min_quantity ?? 1),
          location: brand || current.brand || current.location || 'Sem fabricante'
        })
        .eq('id', current.id)
        .select()
      if (!error && data?.[0]) {
        const updated = stock.map((s) => (s.id === current.id ? normalizeStock(data[0]) : s))
        setStock(updated)
        lsSet('mp_stock', JSON.stringify(updated))
        return
      }
      const fallbackUpdated = stock.map((s) => (s.id === current.id ? { ...s, quantity: nextQty } : s))
      setStock(fallbackUpdated)
      lsSet('mp_stock', JSON.stringify(fallbackUpdated))
      return
    }

    const row = {
      kit: normalizedRef,
      quantity: Math.max(0, Number(quantity || 0)),
      min_quantity: Math.max(0, Number(minQuantity || 0)),
      location: brand || 'Sem fabricante'
    }
    const { data, error } = await supabase.from('stock').insert(row).select().single()
    if (!error && data) {
      const updated = [normalizeStock(data), ...stock]
      setStock(updated)
      lsSet('mp_stock', JSON.stringify(updated))
      return
    }
    const local = normalizeStock({ id: `stk_${Date.now()}`, ...row })
    const fallbackUpdated = [local, ...stock]
    setStock(fallbackUpdated)
    lsSet('mp_stock', JSON.stringify(fallbackUpdated))
  }, [stock])

  const changeStockQuantity = useCallback(async (id, diff) => {
    const current = stock.find((item) => item.id === id)
    if (!current) return
    const nextQty = Math.max(0, Number(current.quantity || 0) + Number(diff || 0))
    await supabase.from('stock').update({ quantity: nextQty }).eq('id', id)
    const updated = stock.map((item) => (item.id === id ? { ...item, quantity: nextQty } : item))
    setStock(updated)
    lsSet('mp_stock', JSON.stringify(updated))
  }, [stock])

  const removeStockItem = useCallback(async (id) => {
    await supabase.from('stock').delete().eq('id', id)
    const updated = stock.filter((item) => item.id !== id)
    setStock(updated)
    lsSet('mp_stock', JSON.stringify(updated))
  }, [stock])

  return { stock, reload: loadStock, addOrIncrementStock, changeStockQuantity, removeStockItem }
}
