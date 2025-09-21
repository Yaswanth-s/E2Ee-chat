import React from 'react'
import Chat from './components/Chat'

export default function App(){
  // Simple demo; in real app, implement auth and provide JWT token to Chat component
  const demoUser = { id: 1, username: 'alice' };
  return <div style={{padding:20}}><h2>E2EE Chat (Vite)</h2><Chat apiBase="http://localhost:8000/api" token="" user={demoUser} /></div>
}
