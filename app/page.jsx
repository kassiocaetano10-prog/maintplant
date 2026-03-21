'use client';

import React, { useState, useEffect, useMemo } from 'react'
import { VALVE_PHOTOS } from '../src/data/plantData'

// Components
import TopBar from '../src/components/TopBar'
import NavBar from '../src/components/NavBar'
import Dashboard from '../src/components/Dashboard'
import Valves from '../src/components/Valves'
import Agenda from '../src/components/Agenda'
import Panel from '../src/components/Panel'
import Compras from '../src/components/Compras'
import ValveDetail from '../src/components/ValveDetail'
import OrderForm from '../src/components/OrderForm'
import MaintGuide from '../src/components/MaintGuide'

export default function Home() {
  const [view, setView] = useState('dash')
  const [zone, setZone] = useState('')
  const [search, setSearch] = useState('')
  const [selectedValve, setSelectedValve] = useState(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showGuide, setShowGuide] = useState(null) // valve object
  
  const [valves, setValves] = useState([])
  const [zones, setZones] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [photos, setPhotos] = useState({})

  useEffect(() => {
    // Load local data (photos)
    const savedPhotos = localStorage.getItem('mp_photos')
    if (savedPhotos) setPhotos(JSON.parse(savedPhotos))
    
    // Fetch DB data
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [vRes, oRes] = await Promise.all([
        fetch('/api/valves'),
        fetch('/api/orders')
      ])
      const vData = await vRes.json()
      const oData = await oRes.json()
      
      setValves(vData.valves || [])
      setZones(vData.zones || [])
      setOrders(oData || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOrder = async (order) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
      if (res.ok) {
        fetchData() // Refresh
        setShowOrderForm(false)
      }
    } catch (error) {
      console.error('Failed to save order:', error)
    }
  }

  const handleDeleteOrder = async (id) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
  }

  const vstatus = (v) => {
    if (!v.ult_man) return 'crit'
    const today = new Date()
    const last = new Date(v.ult_man)
    const diff = (today - last) / (1000 * 60 * 60 * 24)
    return diff > 180 ? 'crit' : diff > 150 ? 'warn' : 'ok'
  }

  const filteredValves = useMemo(() => {
    return valves.filter(v => {
      const matchesZone = !zone || v.zona === zone
      const q = search.toLowerCase()
      const matchesSearch = !q || 
        v.tag.toLowerCase().includes(q) || 
        v.zona.toLowerCase().includes(q) || 
        (v.kit || '').toLowerCase().includes(q) || 
        (v.marca || '').toLowerCase().includes(q)
      return matchesZone && matchesSearch
    })
  }, [valves, zone, search])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--cy)' }}>
        <div style={{ fontFamily: 'Orbitron', letterSpacing: '2px' }}>CARREGANDO DADOS...</div>
      </div>
    )
  }

  return (
    <>
      <TopBar 
        zone={zone} 
        setZone={setZone} 
        zones={zones} 
      />

      <div id="content">
        {view === 'dash' && (
          <Dashboard 
            valves={valves} 
            vstatus={vstatus} 
            zones={zones}
            onZoneClick={(z) => { setZone(z); setView('valves'); }}
          />
        )}
        {view === 'valves' && (
          <Valves 
            valves={filteredValves} 
            search={search} 
            setSearch={setSearch} 
            vstatus={vstatus}
            onValveClick={setSelectedValve}
            photos={photos}
          />
        )}
        {view === 'agenda' && (
          <Agenda 
            orders={orders} 
            setOrders={(newList) => { /* Logic handled by API mostly, but setOrders used for delete in component? */ }} 
            onDeleteOrder={handleDeleteOrder}
            zones={zones} 
            onNewOrder={() => setShowOrderForm(true)}
            valves={valves}
            vstatus={vstatus}
          />
        )}
        {view === 'painel' && (
          <Panel 
            valves={valves} 
            vstatus={vstatus} 
            zones={zones} 
            orders={orders}
          />
        )}
        {view === 'compras' && (
          <Compras 
            valves={valves} 
          />
        )}
      </div>

      <NavBar view={view} setView={setView} />

      {selectedValve && (
        <ValveDetail 
          valve={selectedValve} 
          onClose={() => setSelectedValve(null)}
          vstatus={vstatus}
          photo={photos[selectedValve.tag] || VALVE_PHOTOS[selectedValve.tag]}
          onStartGuide={() => { setShowGuide(selectedValve); setSelectedValve(null); }}
        />
      )}

      {showOrderForm && (
        <OrderForm 
          onClose={() => setShowOrderForm(false)} 
          zones={zones}
          onSave={handleSaveOrder}
        />
      )}

      {showGuide && (
        <MaintGuide 
          valve={showGuide} 
          onClose={() => setShowGuide(null)}
          onFinish={() => {
            // Update valve maintenance date logic would go here
            fetchData()
            setShowGuide(null);
          }}
        />
      )}
    </>
  )
}
