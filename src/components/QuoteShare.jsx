import React, { useState, useEffect } from 'react'

function QuoteShare() {
    const [popup, setPopup] = useState({ visible: false, x: 0, y: 0, text: '' })
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const handleMouseUp = () => {
            const selection = window.getSelection()
            const selectedText = selection?.toString().trim()

            // ✅ FIX 1: Minimum 15 chars — accidental clicks pe popup na aaye
            if (!selectedText || selectedText.length < 15) {
                setPopup(p => ({ ...p, visible: false }))
                return
            }

            // Only trigger inside the post content area
            // (Post.jsx adds a data-quotable attribute to the content div)
            try {
                const range  = selection.getRangeAt(0)
                const anchor = range.commonAncestorContainer

                // Check if selection is inside [data-quotable] element
                const inQuotable = anchor.nodeType === 1
                    ? anchor.closest('[data-quotable]')
                    : anchor.parentElement?.closest('[data-quotable]')

                if (!inQuotable) {
                    setPopup(p => ({ ...p, visible: false }))
                    return
                }

                const rect = range.getBoundingClientRect()
                setPopup({
                    visible: true,
                    x: rect.left + rect.width / 2 + window.scrollX,
                    y: rect.top + window.scrollY - 52,
                    text: selectedText,
                })
            } catch {
                setPopup(p => ({ ...p, visible: false }))
            }
        }

        const handleMouseDown = (e) => {
            if (!e.target.closest('[data-quote-popup]')) {
                setPopup(p => ({ ...p, visible: false }))
            }
        }

        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousedown', handleMouseDown)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousedown', handleMouseDown)
        }
    }, [])

    if (!popup.visible) return null

    const pageUrl = window.location.href

    const shareTwitter = () => {
        const t = encodeURIComponent(`"${popup.text.slice(0, 200)}"\n\n${pageUrl}`)
        window.open(`https://twitter.com/intent/tweet?text=${t}`, '_blank')
    }

    const shareWhatsApp = () => {
        const t = encodeURIComponent(`"${popup.text}"\n\nRead more: ${pageUrl}`)
        window.open(`https://wa.me/?text=${t}`, '_blank')
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(`"${popup.text}" — ${pageUrl}`)
        setCopied(true)
        setTimeout(() => { setCopied(false); setPopup(p => ({ ...p, visible: false })) }, 1200)
    }

    return (
        <div
            data-quote-popup
            className="fixed z-[100] flex items-center gap-1
                bg-gray-900 dark:bg-gray-100 rounded-xl shadow-2xl p-1.5"
            style={{
                left: popup.x,
                top:  popup.y,
                transform: 'translateX(-50%)',
            }}
        >
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2
                border-[5px] border-transparent border-t-gray-900 dark:border-t-gray-100" />

            <button onClick={shareTwitter}
                className="px-2.5 py-1.5 text-xs font-medium text-white dark:text-gray-900
                    hover:bg-white/10 dark:hover:bg-black/10 rounded-md transition-colors whitespace-nowrap">
                𝕏 Tweet
            </button>
            <div className="w-px h-4 bg-gray-600 dark:bg-gray-300" />
            <button onClick={shareWhatsApp}
                className="px-2.5 py-1.5 text-xs font-medium text-white dark:text-gray-900
                    hover:bg-white/10 dark:hover:bg-black/10 rounded-md transition-colors whitespace-nowrap">
                💬 WhatsApp
            </button>
            <div className="w-px h-4 bg-gray-600 dark:bg-gray-300" />
            <button onClick={handleCopy}
                className="px-2.5 py-1.5 text-xs font-medium text-white dark:text-gray-900
                    hover:bg-white/10 dark:hover:bg-black/10 rounded-md transition-colors whitespace-nowrap">
                {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
        </div>
    )
}

export default QuoteShare
