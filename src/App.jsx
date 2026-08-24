import React from 'react'
import AppShell from './components/layout/AppShell'
import InboxPage from './pages/InboxPage'
import SupervisorPage from './pages/SupervisorPage'
import TeamPage from './pages/TeamPage'
import LoginPage from './pages/LoginPage'
import WelcomeChoice from './pages/WelcomeChoice'
import { useApp } from './store/AppContext'

export default function App() {
  const { state, isSupervisor } = useApp()

  if (!state.entryMode) return <WelcomeChoice />
  if (!state.authed) return <LoginPage />

  const page = () => {
    if (state.view === 'supervisor' && isSupervisor) return <SupervisorPage />
    if (state.view === 'team' && isSupervisor) return <TeamPage />
    return <InboxPage />
  }

  return <AppShell>{page()}</AppShell>
}
