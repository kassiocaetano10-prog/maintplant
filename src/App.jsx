import React, { useState, useEffect, useMemo } from 'react'
import './styles/main.scss'
import { PLANT_DATA, VALVE_PHOTOS } from './data/plantData'
import { LangProvider, useLang } from './i18n/LangContext'

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
import MaintFinish from './components/MaintFinish'
import MaintHistory from './components/MaintHistory'
import Notifications from './components/Notifications'
import ReportPDF from './components/ReportPDF'
import Login from './components/Login'

const isBrowser = typeof window !== 'undefined'
const ls = (key) => isBrowser ? localStorage.getItem(key) : null
const lsSet = (key, val) => isBrowser && localStorage.setItem(key, val)
const lsRm = (key) => isBrowser && localStorage.removeItem(key)

function App() {
  // Auth
  const [user, setUser] = useState(() => {
    const saved = ls('mp_session')
    return saved ? JSON.parse(saved) : null
  })

  // Views
  const [view, setView] = useState('dash')
  const [zone, setZone] = useState('')
  const [search, setSearch] = useState('')
  const [selectedValve, setSelectedValve] = useState(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showGuide, setShowGuide] = useState(null)
  const [showFinish, setShowFinish] = useState(null)
  const [showHistory, setShowHistory] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showReport, setShowReport] = useState(false)

  // Data
  const [orders, setOrders] = useState(() => {
    const saved = ls('mp_orders')
    return saved ? JSON.parse(saved) : []
  })
  const [photos, setPhotos] = useState(() => {
    const saved = ls('mp_photos')
    return saved ? JSON.parse(saved) : {}
  })
  const [history, setHistory] = useState(() => {
    const saved = ls('mp_history')
    return saved ? JSON.parse(saved) : []
  })

  // Persist
  useEffect(() => {
    lsSet('mp_orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    lsSet('mp_history', JSON.stringify(history))
  }, [history])

  // Status calc
  const vstatus = (v) => {
    if (!v.ult_man) return 'crit'
    const today = new Date()
    const last = new Date(v.ult_man)
    const diff = (today - last) / (1000 * 60 * 60 * 24)
    return diff > 180 ? 'crit' : diff > 150 ? 'warn' : 'ok'
  }

  // Alert count
  const alertCount = useMemo(() => {
    return PLANT_DATA.valves.filter(v => vstatus(v) !== 'ok').length
  }, [])

  // Filtered valves
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

  // Handle maintenance finish
  const handleMaintFinish = (record) => {
    setHistory(prev => [record, ...prev])
    setShowFinish(null)
    // Show success feedback
    alert(`✓ Manutenção registada com sucesso!\n\nVálvula: ${record.tag}\nTécnico: ${record.technician}`)
  }

  // Handle logout
  const handleLogout = () => {
    lsRm('mp_session')
    setUser(null)
  }

  // Login gate
  if (!user) {
    return <LangProvider><Login onLogin={setUser} /></LangProvider>
  }

  return (
    <LangProvider>
    <div id="app">
      <TopBar
        zone={zone}
        setZone={setZone}
        zones={PLANT_DATA.zonas}
        alertCount={alertCount}
        onNotifications={() => setShowNotifications(true)}
        onReport={() => setShowReport(true)}
        onLogout={handleLogout}
        user={user}
      />

      {/* Zone selector - below topbar */}
      <div style={{ padding: '0 12px', marginBottom: '4px' }}>
        <select
          className="zsel"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="">⬡ Todas as zonas</option>
          {PLANT_DATA.zonas.map(z => <option key={z} value={z}>Zona {z}</option>)}
        </select>
      </div>

      <div id="content">
        {view === 'dash' && (
          <Dashboard
            valves={PLANT_DATA.valves}
            vstatus={vstatus}
            zones={PLANT_DATA.zonas}
            onZoneClick={(z) => { setZone(z); setView('valves'); }}
            history={history}
            user={user}
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

      {/* Valve Detail Modal */}
      {selectedValve && (
        <ValveDetail
          valve={selectedValve}
          onClose={() => setSelectedValve(null)}
          vstatus={vstatus}
          photo={photos[selectedValve.tag] || VALVE_PHOTOS[selectedValve.tag]}
          onStartGuide={() => { setShowGuide(selectedValve); setSelectedValve(null); }}
          onShowHistory={() => { setShowHistory(selectedValve); setSelectedValve(null); }}
        />
      )}

      {/* Order Form */}
      {showOrderForm && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          zones={PLANT_DATA.zonas}
          onSave={(order) => { setOrders([...orders, order]); setShowOrderForm(false); }}
        />
      )}

      {/* Maintenance Guide */}
      {showGuide && (
        <MaintGuide
          valve={showGuide}
          onClose={() => setShowGuide(null)}
          onFinish={() => {
            setShowFinish(showGuide);
            setShowGuide(null);
          }}
        />
      )}

      {/* Maintenance Finish - Signature */}
      {showFinish && (
        <MaintFinish
          valve={showFinish}
          onFinish={handleMaintFinish}
          onCancel={() => setShowFinish(null)}
        />
      )}

      {/* Maintenance History */}
      {showHistory && (
        <MaintHistory
          valve={showHistory}
          history={history}
          onClose={() => setShowHistory(null)}
        />
      )}

      {/* Notifications */}
      {showNotifications && (
        <Notifications
          valves={PLANT_DATA.valves}
          vstatus={vstatus}
          onClose={() => setShowNotifications(false)}
          onValveClick={(v) => { setShowNotifications(false); setSelectedValve(v); }}
        />
      )}

      {/* Report PDF */}
      {showReport && (
        <ReportPDF
          valves={PLANT_DATA.valves}
          vstatus={vstatus}
          zones={PLANT_DATA.zonas}
          history={history}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
    </LangProvider>
  )
}

export default App
