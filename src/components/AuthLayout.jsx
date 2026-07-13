import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function Protected({ children, authentication = true }) {
    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(s => s.auth.status)
    const userData   = useSelector(s => s.auth.userData)

    useEffect(() => {
        if (authentication && !authStatus) navigate('/login')
        else if (!authentication && authStatus) navigate('/')
        else if (authentication && authStatus && userData?.emailVerification === false) navigate('/email-not-verified')
        setLoader(false)
    }, [authStatus, navigate, authentication, userData])

    if (loader) {
        return (
            <div className="min-h-96 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}/>
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }}/>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </div>
                </div>
            </div>
        )
    }
    return <>{children}</>
}
