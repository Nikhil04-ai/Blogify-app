import React, { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext()

export function DarkModeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        // Read from localStorage on first load
        return localStorage.getItem('megablog-theme') === 'dark'
    })

    useEffect(() => {
        const root = document.documentElement
        if (isDark) {
            root.classList.add('dark')
            localStorage.setItem('megablog-theme', 'dark')
        } else {
            root.classList.remove('dark')
            localStorage.setItem('megablog-theme', 'light')
        }
    }, [isDark])

    const toggleDark = () => setIsDark(prev => !prev)

    return (
        <DarkModeContext.Provider value={{ isDark, toggleDark }}>
            {children}
        </DarkModeContext.Provider>
    )
}

export const useDarkMode = () => useContext(DarkModeContext)
