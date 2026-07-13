import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import authService from '../appwrite/auth'

function VerifyEmail() {
    const [status, setStatus]     = useState('verifying')
    const [errorMsg, setErrorMsg] = useState('')
    const [searchParams]          = useSearchParams()
    const navigate                = useNavigate()

    useEffect(() => {
        const userId = searchParams.get('userId')
        const secret = searchParams.get('secret')
        if (!userId || !secret) { setStatus('error'); setErrorMsg('Invalid verification link.'); return }
        authService.verifyEmail(userId, secret).then(() => setStatus('success'))
            .catch(err => { setStatus('error'); setErrorMsg(err.message || 'Verification failed.') })
        // Intentionally run once on mount only: `secret` is a one-time-use token.
        // `searchParams` can get a new object reference on re-render even when the
        // URL hasn't changed, so including it here could re-fire this effect and
        // re-submit an already-consumed token — turning a successful verification
        // into a false "Verification Failed".
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950"/>
            <div className="orb w-80 h-80 bg-violet-200/30 dark:bg-violet-900/15 top-0 left-0"/>
            <div className="orb w-64 h-64 bg-pink-200/20 dark:bg-pink-900/10 bottom-0 right-0"/>

            <div className="relative max-w-md w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                rounded-3xl shadow-2xl shadow-violet-100/50 dark:shadow-violet-900/20
                border border-violet-100/50 dark:border-violet-900/30 p-8 text-center fade-scale">

                <div className="flex justify-center mb-4 float-anim">
                    <img src="/logo.png" alt="Blogify" className="h-14 w-auto"/>
                </div>

                {status === 'verifying' && (
                    <>
                        <div className="w-12 h-12 mx-auto mb-5 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
                        <h1 className="text-xl font-black text-gray-800 dark:text-white mb-2">Verifying your email...</h1>
                        <p className="text-gray-400 text-sm">Please wait a moment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100
                            dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
                            Email <span className="gradient-text">Verified!</span> 🎉
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                            Your email has been verified successfully. You can now log in and start your journey with Blogify!
                        </p>
                        <button onClick={() => navigate('/login')}
                            className="w-full py-3 text-white font-bold rounded-2xl btn-shine
                                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300/40 transition-all"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                            Log In to Blogify →
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-100 dark:bg-red-900/30
                            flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                        <h1 className="text-xl font-black text-gray-800 dark:text-white mb-2">Verification Failed</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{errorMsg}</p>
                        <p className="text-xs text-gray-400 mb-6">Links expire after 1 hour. Log in to request a new one.</p>
                        <button onClick={() => navigate('/login')}
                            className="w-full py-3 text-white font-bold rounded-2xl btn-shine transition-all"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default VerifyEmail
