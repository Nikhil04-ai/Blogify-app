import React, { useState } from 'react'
import authService from '../appwrite/auth'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from './index'
import { useForm } from 'react-hook-form'

function Signup() {
    const navigate  = useNavigate()
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const signup = async (data) => {
        setError('')
        setLoading(true)
        try {
            const session = await authService.createAccount(data)
            if (session) {
                await authService.sendVerificationEmail()
                await authService.logout()
                navigate(`/check-email?email=${encodeURIComponent(data.email)}`)
            }
        } catch (error) {
            setError(error.message)
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center w-full min-h-[80vh] px-4 py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950"/>
            <div className="orb w-80 h-80 bg-pink-200/30 dark:bg-pink-900/15 top-0 right-0"/>
            <div className="orb w-64 h-64 bg-violet-200/30 dark:bg-violet-900/20 bottom-0 left-0"/>

            <div className="relative mx-auto w-full max-w-md fade-scale">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl
                    shadow-2xl shadow-pink-100/50 dark:shadow-violet-900/20
                    border border-pink-100/50 dark:border-violet-900/30 p-8 sm:p-10">

                    {/* Logo + Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4 float-anim">
                            <img src="/logo.png" alt="Blogify" className="h-16 w-auto"/>
                        </div>
                        <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100">
                            Join{' '}<span className="gradient-text">Blogify</span>{' '}today
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login"
                                className="font-semibold text-violet-600 hover:text-violet-500 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50
                            rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(signup)} className="space-y-4">
                        <div>
                            <Input label="Full Name" placeholder="Your full name"
                                {...register('name', { required: 'Name is required' })}/>
                            {errors.name && <p className="text-xs text-red-500 mt-1 pl-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <Input label="Email Address" type="email" placeholder="you@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    validate: v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Enter a valid email'
                                })}/>
                            {errors.email && <p className="text-xs text-red-500 mt-1 pl-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Input label="Password" type="password" placeholder="Minimum 8 characters"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 8, message: 'At least 8 characters required' }
                                })}/>
                            {errors.password && <p className="text-xs text-red-500 mt-1 pl-1">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 mt-2 rounded-2xl text-white font-bold text-base
                                btn-shine transition-all duration-300 disabled:opacity-50
                                hover:shadow-lg hover:shadow-pink-300/40 hover:-translate-y-0.5"
                            style={{ background: 'linear-gradient(135deg, #EC4899, #7C3AED)' }}>
                            {loading
                                ? <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                    Creating account...
                                  </span>
                                : 'Create Free Account →'
                            }
                        </button>
                    </form>

                    <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
                        📧 A verification email will be sent. Verify to start writing!
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup
