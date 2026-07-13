import './App.css'
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'
import authService from './appwrite/auth'
import { login, logout } from './store/authSlice'
import { Header, Footer } from './components'
import BackToTop from './components/BackToTop'
import { DarkModeProvider } from './context/DarkModeContext'

function App() {
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()

    useEffect(() => {
        authService.getCurrentUser()
            .then((userData) => {
                if (userData) {
                    dispatch(login({
                        userData: {
                            $id:               userData.$id,
                            name:              userData.name,
                            email:             userData.email,
                            emailVerification: userData.emailVerification, // ✅ track verification status
                        }
                    }))
                } else {
                    dispatch(logout())
                }
            })
            .finally(() => setLoading(false))
    }, [dispatch])

    // ✅ FIX 5: DarkModeProvider wraps EVERYTHING including loading spinner
    // so dark mode applies even during the initial auth check
    return (
        <DarkModeProvider>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm font-medium">Loading...</p>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                    <Header />
                    <main className="flex-1">
                        <Outlet />
                    </main>
                    <Footer />
                    <BackToTop />
                </div>
            )}
        </DarkModeProvider>
    )
}

export default App
