import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import authService from '../appwrite/auth'

function EmailNotVerified() {
    const [sent, setSent]         = useState(false)
    const [sending, setSending]   = useState(false)
    const [error, setError]       = useState('')
    const [cooldown, setCooldown] = useState(0)
    const dispatch = useDispatch()
    const userData = useSelector(s => s.auth.userData)

    const startCooldown = () => {
        setCooldown(60)
        const iv = setInterval(() => setCooldown(p => { if (p <= 1) { clearInterval(iv); return 0 } return p - 1 }), 1000)
    }

    const resend = async () => {
        if (cooldown > 0) return
        setSending(true); setError('')
        try { await authService.sendVerificationEmail(); setSent(true); startCooldown() }
        catch (e) { setError(e.message || 'Failed to send email.') }
        setSending(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950"/>
            <div className="orb w-80 h-80 bg-amber-200/30 dark:bg-amber-900/10 top-0 right-0"/>
            <div className="orb w-64 h-64 bg-violet-200/20 dark:bg-violet-900/10 bottom-0 left-0"/>

            <div className="relative max-w-md w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                rounded-3xl shadow-2xl shadow-amber-100/50 dark:shadow-violet-900/20
                border border-amber-100/50 dark:border-violet-900/30 p-8 text-center fade-scale">

                <div className="flex justify-center mb-4 float-anim">
                    <img src="/logo.png" alt="Blogify" className="h-14 w-auto"/>
                </div>
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br
                    from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30
                    flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                </div>

                <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Verify Your Email</h1>
                {userData?.email && <p className="text-sm font-bold gradient-text mb-3">{userData.email}</p>}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    A verification link was sent to your email. Click it to activate your Blogify account.
                </p>

                <div className="text-left bg-violet-50/50 dark:bg-violet-900/10 border border-violet-200/50 dark:border-violet-800/30 rounded-2xl p-4 mb-5 space-y-2.5">
                    {['Open your email inbox','Find email from Blogify or Appwrite','Click "Verify Email" button','Logout and log back in'].map((s, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>{i+1}</span>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{s}</p>
                        </div>
                    ))}
                </div>

                {sent && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl text-sm text-green-700 dark:text-green-400">✅ Verification email sent!</div>}
                {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">{error}</div>}

                <button onClick={resend} disabled={sending || cooldown > 0}
                    className="w-full py-3 text-white font-bold rounded-2xl btn-shine mb-3 disabled:opacity-50
                        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300/40 transition-all flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                    {sending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Sending...</>
                     : cooldown > 0 ? `Resend in ${cooldown}s` : '📨 Resend Verification Email'}
                </button>

                <button onClick={async () => { await authService.logout(); dispatch(logout()) }}
                    className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400
                        font-medium rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                    Logout &amp; Use Different Account
                </button>
            </div>
        </div>
    )
}

export default EmailNotVerified
