import React, { useState, useEffect } from 'react'
import appwriteService from '../appwrite/config'

function PostActions({ postId, initialLikes = 0, initialDislikes = 0, title = '' }) {
    const [likes, setLikes]       = useState(initialLikes)
    const [dislikes, setDislikes] = useState(initialDislikes)
    const [liked, setLiked]       = useState(false)
    const [disliked, setDisliked] = useState(false)
    const [saved, setSaved]       = useState(false)
    const [copied, setCopied]     = useState(false)
    const [bump, setBump]         = useState(false)

    useEffect(() => {
        setLiked(JSON.parse(localStorage.getItem('megablog-liked') || '[]').includes(postId))
        setSaved(JSON.parse(localStorage.getItem('megablog-saved') || '[]').includes(postId))
        setDisliked(JSON.parse(localStorage.getItem('megablog-disliked') || '[]').includes(postId))
    }, [postId])

    const toggleLocalArr = (key, id) => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]')
        const next = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]
        localStorage.setItem(key, JSON.stringify(next))
        return next.includes(id)
    }

    const handleLike = async () => {
        const nowLiked = !liked
        const newCount = nowLiked ? likes + 1 : Math.max(0, likes - 1)
        setBump(nowLiked); setLiked(nowLiked); setLikes(newCount)
        toggleLocalArr('megablog-liked', postId)
        if (nowLiked && disliked) {
            const newDis = Math.max(0, dislikes - 1)
            setDisliked(false); setDislikes(newDis)
            toggleLocalArr('megablog-disliked', postId)
            appwriteService.updateDislikes(postId, newDis)
        }
        await appwriteService.updateLikes(postId, newCount)
        setTimeout(() => setBump(false), 500)
    }

    const handleDislike = async () => {
        const nowDisliked = !disliked
        const newDis = nowDisliked ? dislikes + 1 : Math.max(0, dislikes - 1)
        setDisliked(nowDisliked); setDislikes(newDis)
        toggleLocalArr('megablog-disliked', postId)
        if (nowDisliked && liked) {
            const newLikes = Math.max(0, likes - 1)
            setLiked(false); setLikes(newLikes)
            toggleLocalArr('megablog-liked', postId)
            appwriteService.updateLikes(postId, newLikes)
        }
        await appwriteService.updateDislikes(postId, newDis)
    }

    const handleShare = async () => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (isMobile && navigator.share) {
            try {
                await navigator.share({ title, url: window.location.href })
                return
            } catch {
                // User cancelled the native share sheet, or it's unsupported —
                // fall through to the clipboard-copy fallback below.
            }
        }
        try { await navigator.clipboard.writeText(window.location.href) }
        catch {
            const el = document.createElement('input')
            el.value = window.location.href
            document.body.appendChild(el); el.select()
            document.execCommand('copy'); document.body.removeChild(el)
        }
        setCopied(true); setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = () => { setSaved(p => !p); toggleLocalArr('megablog-saved', postId) }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Like + Dislike pill */}
            <div className="flex items-center rounded-2xl overflow-hidden
                border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <button onClick={handleLike} title={liked ? 'Unlike' : 'Like'}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-200 select-none
                        ${liked
                            ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                        }`}>
                    <span className={`text-base transition-transform duration-300 ${bump ? 'scale-150' : 'scale-100'}`}>👍</span>
                    <span>{likes.toLocaleString()}</span>
                </button>
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-600"/>
                <button onClick={handleDislike} title={disliked ? 'Remove dislike' : 'Dislike'}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-all select-none
                        ${disliked
                            ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}>
                    <span className="text-base">👎</span>
                    {dislikes > 0 && <span className="text-xs">{dislikes.toLocaleString()}</span>}
                </button>
            </div>

            {/* Share */}
            <button onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl
                    border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                    text-gray-700 dark:text-gray-300 shadow-sm
                    hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-200 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                {copied ? '✅ Link Copied!' : 'Share'}
            </button>

            {/* Save */}
            <button onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl shadow-sm transition-all
                    ${saved
                        ? 'text-white'
                        : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                    }`}
                style={saved ? { background: 'linear-gradient(135deg, #7C3AED, #EC4899)' } : {}}>
                <svg className={`w-4 h-4 ${saved ? 'fill-white' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                {saved ? 'Saved ✓' : 'Save'}
            </button>
        </div>
    )
}

export default PostActions
