import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

function CheckEmail() {
    const [searchParams] = useSearchParams()
    const navigate       = useNavigate()
    const email          = searchParams.get('email') || 'your email address'

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950"/>
            <div className="orb w-80 h-80 bg-violet-200/30 dark:bg-violet-900/15 top-0 left-0"/>
            <div className="orb w-64 h-64 bg-pink-200/20 dark:bg-pink-900/10 bottom-0 right-0"/>

            <div className="relative max-w-md w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                rounded-3xl shadow-2xl shadow-violet-100/50 dark:shadow-violet-900/20
                border border-violet-100/50 dark:border-violet-900/30 p-8 text-center fade-scale">

                {/* Logo */}
                <div className="flex justify-center mb-2 float-anim">
                    <img src="/logo.png" alt="Blogify" className="h-16 w-auto"/>
                </div>

                {/* Email icon */}
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7C3AED20, #EC4899 20)' }}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100
                        dark:from-violet-900/40 dark:to-pink-900/40 flex items-center justify-center">
                        <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
                    Verify Your <span className="gradient-text">Email</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Verification link sent to:</p>
                <p className="text-sm font-bold gradient-text mb-5">{email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    Click the link in the email to verify your account before logging in.
                </p>

                {/* Steps */}
                <div className="text-left bg-violet-50/50 dark:bg-violet-900/10
                    border border-violet-200/50 dark:border-violet-800/30 rounded-2xl p-4 mb-6 space-y-3">
                    {['Open your email inbox',
                      'Find email from Blogify or Appwrite',
                      'Click the "Verify Email" button',
                      'Come back here and log in'].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                                {i + 1}
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{step}</p>
                        </div>
                    ))}
                </div>

                <button onClick={() => navigate('/login')}
                    className="w-full py-3 text-white font-bold rounded-2xl btn-shine mb-4
                        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300/40 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                    I&apos;ve Verified — Log In →
                </button>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30 text-left mb-4">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-1">📁 Can't find the email?</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500">Check your <strong>Spam</strong> or <strong>Junk</strong> folder. May take a few minutes.</p>
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Still nothing?{' '}
                    <Link to="/login" className="text-violet-500 hover:underline font-medium">
                        Log in to resend verification
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default CheckEmail
