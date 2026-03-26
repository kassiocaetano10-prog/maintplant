import React, { useState, useEffect, useMemo, useCallback } from 'react'
import './styles/main.scss'
import { PLANT_DATA, VALVE_PHOTOS } from './data/plantData'
import { LangProvider, useLang } from './i18n/LangContext'
import { useMaintenanceRecords, useOrders, useRestockRequests, useStock, useValves } from './lib/useSupabase'

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
import Toast from './components/Toast'
import ConfirmModal from './components/ConfirmModal'

import { getSession, clearSession } from './lib/auth'
import { ls, safeParse } from './lib/utils'

function App() {
  // Auth — com verificação de expiração
  const [user, setUser] = useState(() => getSession())

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

  // Data from Supabase (with localStorage fallback)
  const { valves, loading: valvesLoading } = useValves()
  const { records: history, addRecord: addMaintRecord } = useMaintenanceRecords()
  const { orders, addOrder, deleteOrder, updateOrderStatus } = useOrders()
  const { requests: restockRequests, addRequest: addRestockRequest, updateStatus: updateRestockStatus } = useRestockRequests()
  const { stock, addOrIncrementStock, changeStockQuantity, removeStockItem } = useStock()

  const [photos, setPhotos] = useState(() => {
    return safeParse(ls('mp_photos'), {})
  })

  // Toast & Confirm Modal
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmModal({
        message,
        onConfirm: () => { setConfirmModal(null); resolve(true) },
        onCancel: () => { setConfirmModal(null); resolve(false) }
      })
    })
  }, [])

  // Derive zones dynamically from loaded valves (fallback plantData if none)
  const activeZonas = useMemo(() => {
    if (valves && valves.length > 0) {
      return [...new Set(valves.map(v => v.zona))].filter(Boolean).sort()
    }
    return PLANT_DATA.zonas
  }, [valves])

  // Status calc — memoizado para evitar recriação de Date() em cada chamada
  const todayMs = useMemo(() => Date.now(), [])
  const MS_PER_DAY = 86400000

  const vstatus = useMemo(() => {
    return (v) => {
      if (!v.ult_man) return 'crit'
      const diff = (todayMs - new Date(v.ult_man).getTime()) / MS_PER_DAY
      return diff > 180 ? 'crit' : diff > 150 ? 'warn' : 'ok'
    }
  }, [todayMs])

  // Alert count — depende de vstatus
  const alertCount = useMemo(() => {
    return (valves || PLANT_DATA.valves).filter(v => vstatus(v) !== 'ok').length
  }, [vstatus, valves])

  // Filtered valves
  const filteredValves = useMemo(() => {
    const list = valves?.length > 0 ? valves : PLANT_DATA.valves;
    return list.filter(v => {
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

  // Handle maintenance finish — save to Supabase
  const handleMaintFinish = async (record) => {
    await addMaintRecord(record)
    setShowFinish(null)
    showToast(`Manutenção registada: ${record.tag} — ${record.technician}`, 'success')
  }

  // Verificar expiração da sessão a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const session = getSession()
      if (!session && user) {
        setUser(null)
      }
    }, 60000) // 1 minuto
    return () => clearInterval(interval)
  }, [user])

  // Handle logout
  const handleLogout = () => {
    clearSession()
    setUser(null)
  }

  const allowedViews = useMemo(() => {
    const allowedViewsByRole = {
      admin: ['dash', 'valves', 'agenda', 'painel', 'compras'],
      chefe: ['dash', 'valves', 'agenda', 'painel', 'compras'],
      compras: ['compras'],
      tecnico: ['valves', 'agenda']
    }
    return allowedViewsByRole[user?.role] || ['valves', 'agenda']
  }, [user?.role])

  useEffect(() => {
    if (user && !allowedViews.includes(view)) {
      setView(allowedViews[0])
    }
  }, [user, view, allowedViews])

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
        zones={activeZonas}
        alertCount={alertCount}
        onNotifications={() => setShowNotifications(true)}
        onReport={() => (user?.role === 'admin' || user?.role === 'chefe') && setShowReport(true)}
        onLogout={handleLogout}
        user={user}
      />

      <div id="content">
        {view === 'dash' && allowedViews.includes('dash') && (
          <Dashboard
            valves={valves?.length > 0 ? valves : PLANT_DATA.valves}
            vstatus={vstatus}
            zones={activeZonas}
            onZoneClick={(z) => { setZone(z); setView('valves'); }}
            history={history}
            user={user}
          />
        )}
        {view === 'valves' && allowedViews.includes('valves') && (
          <Valves
            valves={filteredValves}
            search={search}
            setSearch={setSearch}
            vstatus={vstatus}
            onValveClick={setSelectedValve}
            photos={photos}
            zone={zone}
            setZone={setZone}
            zones={activeZonas}
          />
        )}
        {view === 'agenda' && allowedViews.includes('agenda') && (
          <Agenda
            orders={orders}
            onDeleteOrder={deleteOrder}
            onUpdateOrderStatus={updateOrderStatus}
            zones={activeZonas}
            onNewOrder={() => setShowOrderForm(true)}
            valves={valves?.length > 0 ? valves : PLANT_DATA.valves}
            vstatus={vstatus}
            user={user}
            restockRequests={restockRequests}
            onCreateRestockRequest={addRestockRequest}
            onUpdateRestockRequestStatus={updateRestockStatus}
            showToast={showToast}
            showConfirm={showConfirm}
          />
        )}
        {view === 'painel' && allowedViews.includes('painel') && (
          <Panel
            valves={valves?.length > 0 ? valves : PLANT_DATA.valves}
            vstatus={vstatus}
            zones={activeZonas}
            orders={orders}
          />
        )}
        {view === 'compras' && allowedViews.includes('compras') && (
          <Compras
            valves={valves?.length > 0 ? valves : PLANT_DATA.valves}
            user={user}
            stock={stock}
            addOrIncrementStock={addOrIncrementStock}
            changeStockQuantity={changeStockQuantity}
            removeStockItem={removeStockItem}
            restockRequests={restockRequests}
            showToast={showToast}
            showConfirm={showConfirm}
          />
        )}
      </div>

      <NavBar view={view} setView={setView} user={user} />

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
      {showOrderForm && (user?.role === 'admin' || user?.role === 'chefe') && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          zones={activeZonas}
          valves={valves?.length > 0 ? valves : PLANT_DATA.valves}
          showToast={showToast}
          onSave={(order) => {
            addOrder({
              ...order,
              createdBy: user?.name || user?.username || 'Sistema'
            });
            setShowOrderForm(false);
          }}
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
          showToast={showToast}
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
          valves={valves?.length > 0 ? valves : PLANT_DATA.valves}
          vstatus={vstatus}
          onClose={() => setShowNotifications(false)}
          onValveClick={(v) => { setShowNotifications(false); setSelectedValve(v); }}
        />
      )}

      {/* Report PDF */}
      {showReport && (user?.role === 'admin' || user?.role === 'chefe') && (
        <ReportPDF
          valves={valves?.length > 0 ? valves : PLANT_DATA.valves}
          vstatus={vstatus}
          zones={activeZonas}
          history={history}
          onClose={() => setShowReport(false)}
          showToast={showToast}
        />
      )}
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm modal */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}
    </div>
    </LangProvider>
  )
}

export default App
