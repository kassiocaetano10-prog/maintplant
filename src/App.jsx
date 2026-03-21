import React, { useState, useEffect, useMemo } from 'react'
import './styles/main.scss'
import { PLANT_DATA, VALVE_PHOTOS } from './data/plantData'

// Components
import TopBar from './components/TopBar'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import Valves from './components/Valves'
import Agenda from './components/Agenda'
import Panel from './components/Panel'
import Compras from './components/Compras'
import ValveDetail from './components/ValveDetail'
import OrderForm from './components/OrderForm'
import MaintGuide from './components/MaintGuide'

function App() {
  const [view, setView] = useState('dash')
  const [zone, setZone] = useState('')
  const [search, setSearch] = useState('')
  const [selectedValve, setSelectedValve] = useState(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showGuide, setShowGuide] = useState(null) // valve tag
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('mp_orders')
    return saved ? JSON.parse(saved) : []
  })
  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem('mp_photos')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem('mp_orders', JSON.stringify(orders))
  }, [orders])

  const vstatus = (v) => {
    if (!v.ult_man) return 'crit'
    const today = new Date()
    const last = new Date(v.ult_man)
    const diff = (today - last) / (1000 * 60 * 60 * 24)
    return diff > 180 ? 'crit' : diff > 150 ? 'warn' : 'ok'
  }

  const filteredValves = useMemo(() => {
    return PLANT_DATA.valves.filter(v => {
      const matchesZone = !zone || v.zona === zone
      const q = search.toLowerCase()
      const matchesSearch = !q || 
        v.tag.toLowerCase().includes(q) || 
        v.zona.toLowerCase().includes(q) || 
        (v.kit || '').toLowerCase().includes(q) || 
        (v.marca || '').toLowerCase().includes(q)
      return matchesZone && matchesSearch
    })
  }, [zone, search])

  return (
    <div id="app">
      <TopBar 
        zone={zone} 
        setZone={setZone} 
        zones={PLANT_DATA.zonas} 
      />

      <div id="content">
        {view === 'dash' && (
          <Dashboard 
            valves={PLANT_DATA.valves} 
            vstatus={vstatus} 
            zones={PLANT_DATA.zonas}
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
            setOrders={setOrders} 
            zones={PLANT_DATA.zonas} 
            onNewOrder={() => setShowOrderForm(true)}
            valves={PLANT_DATA.valves}
            vstatus={vstatus}
          />
        )}
        {view === 'painel' && (
          <Panel 
            valves={PLANT_DATA.valves} 
            vstatus={vstatus} 
            zones={PLANT_DATA.zonas} 
            orders={orders}
          />
        )}
        {view === 'compras' && (
          <Compras 
            valves={PLANT_DATA.valves} 
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
          zones={PLANT_DATA.zonas}
          onSave={(order) => { setOrders([...orders, order]); setShowOrderForm(false); }}
        />
      )}

      {showGuide && (
        <MaintGuide 
          valve={showGuide} 
          onClose={() => setShowGuide(null)}
          onFinish={() => {
            // Update valve maintenance date logic would go here
            // Since PLANT_DATA is static in this version, we'll just toast
            setShowGuide(null);
          }}
        />
      )}
    </div>
  )
}

export default App
