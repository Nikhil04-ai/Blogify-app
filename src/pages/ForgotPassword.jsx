import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import authService from '../appwrite/auth'

function ForgotPassword() {
    const [email, setEmail]       = useState('')
    const [sent, setSent]         = useState(false)
    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState('')
    const [cooldown, setCooldown] = useState(0)

    const startCooldown = () => {
        setCooldown(60)
        const iv = setInterval(() => setCooldown(p => { if (p <= 1) { clearInterval(iv); return 0 } return p - 1 }), 1000)
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); if (!email.trim()) return
        setLoading(true); setError('')
        try { await authService.sendPasswordReset(email.trim()); setSent(true); startCooldown() }
        catch (err) { setError(err.message || 'Something went wrong.') }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950"/>
            <div className="orb w-80 h-80 bg-pink-200/30 dark:bg-pink-900/15 top-0 right-0"/>
            <div className="orb w-64 h-64 bg-violet-200/20 dark:bg-violet-900/10 bottom-0 left-0"/>

            <div className="relative max-w-md w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                rounded-3xl shadow-2xl shadow-pink-100/50 dark:shadow-violet-900/20
                border border-pink-100/50 dark:border-violet-900/30 p-8 fade-scale">

                <div className="text-center mb-7">
                    <div className="flex justify-center mb-3 float-anim">
                        <img src="/logo.png" alt="Blogify" className="h-14 w-auto"/>
                    </div>
                    {!sent ? (
                        <>
                            <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-1">
                                Forgot <span className="gradient-text">Password?</span>
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enter your email and we'll send a reset link.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100
                                dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                            </div>
                            <h1 className="text-xl font-black text-gray-800 dark:text-white mb-1">Check Your Email!</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reset link sent to:</p>
                            <p className="text-sm font-bold gradient-text">{email}</p>
                        </>
                    )}
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>}

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 pl-1">Email Address</label>
                            <input type="email" placeholder="you@example.com" value={email}
                                onChange={e => setEmail(e.target.value)} required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                                    bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-gray-400 transition-all"/>
                        </div>
                        <button type="submit" disabled={loading || !email.trim()}
                            className="w-full py-3 text-white font-bold rounded-2xl btn-shine disabled:opacity-50
                                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300/40 transition-all flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Sending...</> : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                            Link expires in 1 hour. Check Spam/Junk folder.
                        </p>
                        <button onClick={async () => { if(cooldown>0) return; setLoading(true); try{await authService.sendPasswordReset(email.trim());startCooldown()}catch(e){setError(e.message)} setLoading(false) }}
                            disabled={cooldown > 0 || loading}
                            className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400
                                font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm disabled:opacity-50">
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Reset Email'}
                        </button>
                    </div>
                )}

                <Link to="/login"
                    className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-violet-500 transition-colors mt-5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back to Login
                </Link>
            </div>
        </div>
    )
}

export default ForgotPassword
