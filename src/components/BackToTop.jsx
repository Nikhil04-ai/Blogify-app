import React, { useState, useEffect } from 'react'

function BackToTop() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const fn = () => setVisible(window.scrollY > 320)
        window.addEventListener('scroll', fn, { passive: true })
        return () => window.removeEventListener('scroll', fn)
    }, [])

    if (!visible) return null

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full
                text-white shadow-lg hover:shadow-xl hover:-translate-y-1
                transition-all duration-300 active:scale-90 btn-shine"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
        >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
        </button>
    )
}

export default BackToTop
