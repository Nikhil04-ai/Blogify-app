import React, { useState, useEffect } from 'react'
import { Container, LogoutBtn } from '../index'
import Logo from '../Logo'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useDarkMode } from '../../context/DarkModeContext'

const getGradient = (str = '') => {
    const g = [
        'from-violet-500 to-purple-600','from-pink-500 to-rose-600',
        'from-cyan-500 to-blue-600',    'from-orange-500 to-red-600',
        'from-green-500 to-emerald-600','from-teal-500 to-cyan-600',
    ]
    return g[(str.charCodeAt(0) || 0) % g.length]
}

function Header() {
    const authStatus  = useSelector(s => s.auth.status)
    const currentUser = useSelector(s => s.auth.userData)
    const navigate    = useNavigate()
    const location    = useLocation()
    const [menuOpen, setMenuOpen]   = useState(false)
    const [scrolled, setScrolled]   = useState(false)
    const { isDark, toggleDark }    = useDarkMode()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const navItems = [
        { name: 'Home',      slug: '/',          active: true },
        { name: 'Login',     slug: '/login',     active: !authStatus },
        { name: 'Sign Up',   slug: '/signup',    active: !authStatus },
        { name: 'All Posts', slug: '/all-posts', active: authStatus },
        { name: 'Write',     slug: '/add-post',  active: authStatus },
    ]
    const activeItems = navItems.filter(i => i.active)

    const isActive = (slug) => location.pathname === slug

    const darkBtn = (
        <button onClick={toggleDark} aria-label="Toggle dark mode"
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400
                hover:bg-violet-50 dark:hover:bg-violet-900/20
                hover:text-violet-600 dark:hover:text-violet-400 transition-all">
            {isDark
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
            }
        </button>
    )

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300
            ${scrolled
                ? 'shadow-lg shadow-violet-100/30 dark:shadow-violet-900/20 backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 border-b border-violet-100/50 dark:border-violet-900/30'
                : 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-transparent'
            }`}>
            <Container>
                <nav className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 group">
                        <div className="float-anim" style={{ animationDuration: '4s' }}>
                            <Logo width="38px"/>
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-xl font-black gradient-text">Blogify</span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5 tracking-widest uppercase">
                                Write • Share • Inspire
                            </span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <ul className="hidden md:flex items-center gap-1">
                        {activeItems.map(item => (
                            <li key={item.name}>
                                <button onClick={() => navigate(item.slug)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                        ${isActive(item.slug)
                                            ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-400'
                                        }`}>
                                    {item.name}
                                </button>
                            </li>
                        ))}
                        {authStatus && <li><LogoutBtn /></li>}
                        <li>{darkBtn}</li>

                        {/* Saved */}
                        {authStatus && (
                            <li>
                                <button onClick={() => navigate('/saved')} title="Saved Posts"
                                    className={`p-2 rounded-xl transition-all
                                        ${isActive('/saved')
                                            ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                                        }`}>
                                    <svg className="w-5 h-5"
                                        fill={isActive('/saved') ? 'currentColor' : 'none'}
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                                    </svg>
                                </button>
                            </li>
                        )}

                        {/* Profile avatar */}
                        {authStatus && currentUser && (
                            <li>
                                <button onClick={() => navigate('/profile')}
                                    title={currentUser.name}
                                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(currentUser.name || '')}
                                        flex items-center justify-center ring-2 transition-all duration-200
                                        ${isActive('/profile')
                                            ? 'ring-violet-500'
                                            : 'ring-transparent hover:ring-violet-400'
                                        }`}>
                                    <span className="text-white text-sm font-bold select-none">
                                        {(currentUser.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </button>
                            </li>
                        )}
                    </ul>

                    {/* Mobile right icons */}
                    <div className="md:hidden flex items-center gap-1">
                        {darkBtn}
                        {authStatus && (
                            <button onClick={() => { navigate('/saved'); setMenuOpen(false) }}
                                className="p-2 rounded-xl text-gray-500 hover:text-violet-600 hover:bg-violet-50 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                                </svg>
                            </button>
                        )}
                        {authStatus && currentUser && (
                            <button onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(currentUser.name || '')}
                                    flex items-center justify-center ring-2 ring-transparent hover:ring-violet-400`}>
                                <span className="text-white text-xs font-bold">
                                    {(currentUser.name || 'U').charAt(0).toUpperCase()}
                                </span>
                            </button>
                        )}
                        <button onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-xl text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-all">
                            {menuOpen
                                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                                  </svg>
                            }
                        </button>
                    </div>
                </nav>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden pb-4 border-t border-violet-100/50 dark:border-violet-900/20 fade-scale">
                        <ul className="flex flex-col gap-1 pt-2">
                            {activeItems.map(item => (
                                <li key={item.name}>
                                    <button onClick={() => { navigate(item.slug); setMenuOpen(false) }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                            ${isActive(item.slug)
                                                ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700'
                                            }`}>
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                            {authStatus && <li><LogoutBtn /></li>}
                        </ul>
                    </div>
                )}
            </Container>
        </header>
    )
}

export default Header
