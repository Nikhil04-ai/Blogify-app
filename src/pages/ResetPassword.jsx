import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import authService from '../appwrite/auth'

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const userId = searchParams.get('userId')
    const secret = searchParams.get('secret')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm]   = useState('')
    const [loading, setLoading]   = useState(false)
    const [success, setSuccess]   = useState(false)
    const [error, setError]       = useState('')
    const [showPass, setShowPass] = useState(false)

    const passwordsMatch = password === confirm
    const isStrong = password.length >= 8

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('')
        if (!isStrong) { setError('Password must be at least 8 characters.'); return }
        if (!passwordsMatch) { setError('Passwords do not match.'); return }
        if (!userId || !secret) { setError('Invalid reset link.'); return }
        setLoading(true)
        try { await authService.resetPassword(userId, secret, password); setSuccess(true) }
        catch (err) { setError(err.message || 'Reset failed. The link may have expired.') }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950"/>
            <div className="orb w-80 h-80 bg-violet-200/30 dark:bg-violet-900/15 top-0 left-0"/>
            <div className="orb w-64 h-64 bg-cyan-200/20 dark:bg-cyan-900/10 bottom-0 right-0"/>

            <div className="relative max-w-md w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                rounded-3xl shadow-2xl shadow-violet-100/50 dark:shadow-violet-900/20
                border border-violet-100/50 dark:border-violet-900/30 p-8 fade-scale">

                <div className="flex justify-center mb-5 float-anim">
                    <img src="/logo.png" alt="Blogify" className="h-14 w-auto"/>
                </div>

                {!success ? (
                    <>
                        <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-1 text-center">
                            Set <span className="gradient-text">New Password</span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                            Choose a strong password for your account.
                        </p>

                        {(!userId || !secret) && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-center">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Invalid or expired reset link.</p>
                                <Link to="/forgot-password" className="text-xs text-violet-500 hover:underline mt-1 block">Request a new link →</Link>
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                                {error}
                                {error.toLowerCase().includes('expir') && (
                                    <Link to="/forgot-password" className="block text-xs text-violet-500 hover:underline mt-1">Request new link →</Link>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 pl-1">New Password</label>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} placeholder="Minimum 8 characters"
                                        value={password} onChange={e => setPassword(e.target.value)} required
                                        className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-700
                                            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-gray-400 transition-all"/>
                                    <button type="button" onClick={() => setShowPass(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {showPass
                                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                                : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                                            }
                                        </svg>
                                    </button>
                                </div>
                                {password && (
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <div className={`h-1 flex-1 rounded-full ${isStrong ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-red-300'}`}/>
                                        <span className={`text-xs ${isStrong ? 'text-green-500' : 'text-red-400'}`}>{isStrong ? '✓ Strong enough' : 'Too short'}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 pl-1">Confirm Password</label>
                                <input type={showPass ? 'text' : 'password'} placeholder="Re-enter your new password"
                                    value={confirm} onChange={e => setConfirm(e.target.value)} required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                                        bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-gray-400 transition-all"/>
                                {confirm && !passwordsMatch && <p className="text-xs text-red-500 mt-1 pl-1">Passwords do not match</p>}
                                {confirm && passwordsMatch && <p className="text-xs text-green-500 mt-1 pl-1">✓ Passwords match</p>}
                            </div>

                            <button type="submit" disabled={loading || !isStrong || !passwordsMatch || !userId || !secret}
                                className="w-full py-3 text-white font-bold rounded-2xl btn-shine disabled:opacity-50
                                    hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300/40 transition-all flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                                {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Resetting...</> : 'Reset Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100
                            dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Password Reset! 🎉</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your password has been updated. You can now log in.</p>
                        <button onClick={() => navigate('/login')}
                            className="w-full py-3 text-white font-bold rounded-2xl btn-shine
                                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300/40 transition-all"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                            Continue to Login →
                        </button>
                    </div>
                )}

                {!success && (
                    <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-violet-500 transition-colors mt-5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back to Login
                    </Link>
                )}
            </div>
        </div>
    )
}

export default ResetPassword
