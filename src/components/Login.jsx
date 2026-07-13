import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import { Input } from '../components'
import { useDispatch } from 'react-redux'
import authService from '../appwrite/auth'
import { useForm } from 'react-hook-form'

function Login() {
    const navigate  = useNavigate()
    const dispatch  = useDispatch()
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit } = useForm()

    const login = async (data) => {
        setError('')
        setLoading(true)
        try {
            const session = await authService.login(data)
            if (session) {
                const userData = await authService.getCurrentUser()
                if (userData) {
                    dispatch(authLogin({
                        userData: {
                            $id: userData.$id, name: userData.name,
                            email: userData.email, emailVerification: userData.emailVerification,
                        }
                    }))
                }
                navigate('/')
            }
        } catch (error) {
            // Appwrite throws this when the browser already holds a valid,
            // active session (e.g. after a brief server hiccup left our
            // Redux state out of sync with the real session). Rather than
            // showing a confusing raw error, just log the user in with the
            // session that's already there.
            if (error.type === 'user_session_already_exists') {
                try {
                    const userData = await authService.getCurrentUser()
                    if (userData) {
                        dispatch(authLogin({
                            userData: {
                                $id: userData.$id, name: userData.name,
                                email: userData.email, emailVerification: userData.emailVerification,
                            }
                        }))
                        navigate('/')
                        setLoading(false)
                        return
                    }
                } catch {
                    // Fall through to showing the error below if this recovery
                    // attempt also fails.
                }
                setError('You already have an active session on this device. Please refresh the page.')
            } else {
                setError(error.message)
            }
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center w-full min-h-[80vh] px-4 py-12
            relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950"/>
            <div className="orb w-80 h-80 bg-violet-200/30 dark:bg-violet-900/20 top-0 left-0"/>
            <div className="orb w-64 h-64 bg-pink-200/20 dark:bg-pink-900/15 bottom-0 right-0"/>

            <div className="relative mx-auto w-full max-w-md fade-scale">
                {/* Card */}
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl
                    shadow-2xl shadow-violet-100/50 dark:shadow-violet-900/20
                    border border-violet-100/50 dark:border-violet-900/30 p-8 sm:p-10">

                    {/* Logo + Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4 float-anim">
                            <img src="/logo.png" alt="Blogify" className="h-16 w-auto"/>
                        </div>
                        <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100">
                            Welcome back to{' '}
                            <span className="gradient-text">Blogify</span>
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Don&apos;t have an account?{' '}
                            <Link to="/signup"
                                className="font-semibold text-violet-600 hover:text-violet-500 hover:underline">
                                Sign up free
                            </Link>
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20
                            border border-red-200 dark:border-red-800/50 rounded-xl
                            text-red-600 dark:text-red-400 text-sm text-center flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(login)} className="space-y-5">
                        <Input label="Email Address" type="email" placeholder="you@example.com"
                            {...register('email', { required: true })}/>

                        <div>
                            <Input label="Password" type="password" placeholder="Your password"
                                {...register('password', { required: true })}/>
                            <div className="flex justify-end mt-1.5">
                                <Link to="/forgot-password"
                                    className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-2xl text-white font-bold text-base
                                btn-shine transition-all duration-300 disabled:opacity-50
                                hover:shadow-lg hover:shadow-violet-300/40 hover:-translate-y-0.5"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                            {loading
                                ? <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                    Signing in...
                                  </span>
                                : 'Sign In →'
                            }
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            By signing in, you agree to Blogify&apos;s{' '}
                            <Link to="/" className="text-violet-500 hover:underline">Terms</Link>
                            {' '}&amp;{' '}
                            <Link to="/" className="text-violet-500 hover:underline">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
