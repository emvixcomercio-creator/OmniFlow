import React from 'react'
import { Inbox, LayoutDashboard, Users, Settings, Zap, ZapOff, ChevronDown, Compass, LogOut } from 'lucide-react'
import GuidedTour from '../tour/GuidedTour'
import { useApp } from '../../store/AppContext'
import Avatar from '../common/Avatar'
import { TICKET_STATUS } from '../../lib/constants'

function NavButton({ active, icon: Icon, label, badge, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`relative group w-full flex flex-col items-center gap-1 py-3 rounded-xl transition-colors ${
        active ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-medium">{label}</span>
      {badge > 0 && (
        <span className="absolute top-1.5 right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

export default function AppShell({ children }) {
  const { state, dispatch, isSupervisor } = useApp()
  const [tourOpen, setTourOpen] = React.useState(() => {
    try { return localStorage.getItem('omniflow.tour.seen') !== '1' } catch { return true }
  })

  const closeTour = () => {
    setTourOpen(false)
    try { localStorage.setItem('omniflow.tour.seen', '1') } catch { /* modo privado */ }
  }

  const pending = state.tickets.filter(
    (t) => t.status === TICKET_STATUS.WAITING || t.status === TICKET_STATUS.BOT,
  ).length

  return (
    <div className="h-full flex bg-slate-100">
      {/* Rail de navegação */}
      <nav className="w-[76px] shrink-0 bg-slate-900 flex flex-col items-center py-3 gap-2">
        <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold mb-2 shrink-0">
          OF
        </div>

        <div className="w-full px-2 space-y-1 flex-1">
          <NavButton
            active={state.view === 'inbox'}
            icon={Inbox}
            label="Inbox"
            badge={pending}
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'inbox' })}
          />
          <NavButton
            active={state.view === 'supervisor'}
            icon={LayoutDashboard}
            label="Gestor"
            disabled={!isSupervisor}
            onClick={() => isSupervisor && dispatch({ type: 'SET_VIEW', view: 'supervisor' })}
          />
          <NavButton
            active={state.view === 'team'}
            icon={Users}
            label="Equipe"
            disabled={!isSupervisor}
            onClick={() => isSupervisor && dispatch({ type: 'SET_VIEW', view: 'team' })}
          />
        </div>

        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIMULATION' })}
          title={state.simulation ? 'Pausar simulação em tempo real' : 'Retomar simulação'}
          className={`w-[52px] py-2 rounded-xl flex flex-col items-center gap-0.5 text-[9px] font-semibold transition-colors ${
            state.simulation
              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          {state.simulation ? <Zap size={16} /> : <ZapOff size={16} />}
          {state.simulation ? 'AO VIVO' : 'PAUSADO'}
        </button>

        <button
          onClick={() => setTourOpen(true)}
          title="Como funciona (tour guiado)"
          className="w-[52px] py-2 rounded-xl flex flex-col items-center gap-0.5 text-[9px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Compass size={16} />
          TOUR
        </button>

        <button className="w-full flex flex-col items-center gap-1 py-2 text-slate-500 hover:text-white">
          <Settings size={18} />
        </button>

        <UserSwitcher />
      </nav>

      <main className="flex-1 min-w-0 flex flex-col">{children}</main>

      <GuidedTour
        open={tourOpen}
        onClose={closeTour}
        onFinish={() => window.dispatchEvent(new CustomEvent('omniflow:open-channel-setup'))}
      />
    </div>
  )
}

function UserSwitcher() {
  const { state, dispatch, currentUser } = useApp()
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative w-full flex justify-center pb-1">
      <button onClick={() => setOpen((v) => !v)} className="relative">
        <Avatar name={currentUser.name} color={currentUser.avatarColor} size="md" presence={currentUser.status} />
        <ChevronDown size={12} className="absolute -right-1 -top-1 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-14 left-2 z-40 w-64 card shadow-xl p-1.5 animate-pop-in">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Entrar como
            </p>
            {state.users.map((u) => (
              <button
                key={u.id}
                onClick={() => { dispatch({ type: 'SET_CURRENT_USER', userId: u.id }); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-slate-100 ${
                  u.id === currentUser.id ? 'bg-brand-50' : ''
                }`}
              >
                <Avatar name={u.name} color={u.avatarColor} size="sm" presence={u.status} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {u.role === 'AGENT' ? 'Atendente' : u.role === 'SUPERVISOR' ? 'Supervisor(a)' : 'Admin'}
                  </p>
                </div>
              </button>
            ))}

            <div className="border-t border-slate-200 mt-1 pt-1">
              <button
                onClick={() => { dispatch({ type: 'LOGOUT' }); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left text-slate-600 hover:bg-slate-100"
              >
                <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <LogOut size={14} />
                </span>
                <span className="text-sm font-medium">Sair do painel</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
