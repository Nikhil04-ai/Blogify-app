import React, { useState } from 'react'

const getVideoId = (url) => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
        /(?:youtu\.be\/)([^&\n?#]+)/,
        /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

const callGemini = async (prompt) => {
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
    if (!GEMINI_KEY || GEMINI_KEY === 'undefined') {
        throw new Error('VITE_GEMINI_API_KEY is not set in your .env file. Restart the dev server after adding it.')
    }
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
            }),
        }
    )
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Gemini API error: ${res.status}`)
    }
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

function YoutubeImporter({ onGenerated }) {
    const [url, setUrl]             = useState('')
    const [step, setStep]           = useState('idle')
    const [videoMeta, setVideoMeta] = useState(null)
    const [error, setError]         = useState('')
    const [hookStyle, setHookStyle] = useState('listicle')

    const hookStyles = [
        { id: 'listicle',   label: '📋 Listicle',  example: '"7 Things I Learned from…"' },
        { id: 'story',      label: '📖 Story',      example: '"How I Discovered…"' },
        { id: 'contrarian', label: '🔥 Contrarian', example: '"Why Everyone Is Wrong About…"' },
        { id: 'howto',      label: '🛠️ How-To',     example: '"Complete Guide to…"' },
        { id: 'news',       label: '📰 News Style', example: '"Breaking: Everything Changes in…"' },
    ]

    const handleFetch = async () => {
        setError('')
        const videoId = getVideoId(url)
        if (!videoId) { setError('Please enter a valid YouTube URL (e.g. youtube.com/watch?v=...)'); return }
        setStep('fetching')
        try {
            const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
            if (!res.ok) throw new Error('Video not found or is private')
            const meta = await res.json()
            setVideoMeta({ ...meta, videoId })
            setStep('preview')
        } catch (e) {
            setError(e.message)
            setStep('error')
        }
    }

    const handleGenerate = async () => {
        setStep('generating')
        setError('')
        const prompt = `You are a viral blog writer. Convert this YouTube video into a trending blog post.

Video Title: "${videoMeta.title}"
Channel: "${videoMeta.author_name}"
Hook Style requested: ${hookStyle} (${hookStyles.find(h => h.id === hookStyle)?.example})

Requirements:
- Use the ${hookStyle} hook style for the title
- Write 700-900 words
- Use HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>
- Make it feel like an original article, not a video summary
- Trending angle for a 2026 audience

Return ONLY valid JSON, no markdown backticks, no explanation:
{"title":"catchy blog title","content":"<h2>...</h2><p>...</p>...","tags":["tag1","tag2","tag3","tag4","tag5"],"hook":"one-line angle used"}`

        try {
            const raw    = await callGemini(prompt)
            const clean  = raw.replace(/```json|```/g, '').trim()
            const parsed = JSON.parse(clean)
            onGenerated({
                title:   parsed.title   || videoMeta.title,
                content: parsed.content || '',
                status:  'active',
                _tags:   parsed.tags    || [],
                _hook:   parsed.hook    || '',
            })
            setStep('done')
        } catch (e) {
            setError(e.message)
            setStep('error')
        }
    }

    const reset = () => { setStep('idle'); setUrl(''); setVideoMeta(null); setError('') }

    return (
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden mb-6">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700/50
                bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10">
                <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">YouTube → Blog Post Generator</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paste a video URL and AI will write a trending post</p>
                </div>
            </div>

            <div className="p-5">
                {/* IDLE / ERROR */}
                {(step === 'idle' || step === 'error') && (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input type="text" placeholder="https://youtube.com/watch?v=..."
                                value={url} onChange={e => setUrl(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFetch()}
                                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700
                                    rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                                    focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 placeholder:text-gray-400"/>
                            <button onClick={handleFetch} disabled={!url.trim()}
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm
                                    font-bold rounded-xl transition-colors disabled:opacity-40 whitespace-nowrap">
                                Fetch Video
                            </button>
                        </div>
                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
                                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* FETCHING */}
                {step === 'fetching' && (
                    <div className="flex items-center gap-3 py-2">
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"/>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Fetching video info…</span>
                    </div>
                )}

                {/* PREVIEW */}
                {step === 'preview' && videoMeta && (
                    <div className="space-y-4">
                        <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                            <img src={videoMeta.thumbnail_url} alt="thumbnail" className="w-24 h-16 object-cover rounded-lg flex-shrink-0"/>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">{videoMeta.title}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">by {videoMeta.author_name}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Choose the Blog's Hook / Angle
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {hookStyles.map(h => (
                                    <button key={h.id} onClick={() => setHookStyle(h.id)}
                                        className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all
                                            ${hookStyle === h.id
                                                ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-600'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{h.label}</span>
                                        <span className="block text-gray-400 dark:text-gray-500 mt-0.5">{h.example}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handleGenerate}
                                className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl btn-shine transition-all hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                                ✨ Generate Blog Post
                            </button>
                            <button onClick={reset}
                                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm
                                    text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* GENERATING */}
                {step === 'generating' && (
                    <div className="space-y-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">AI is writing your blog post…</span>
                        </div>
                        {['Analyzing the video angle', 'Crafting the hook-style title', 'Generating the full post'].map((msg, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 ml-8">
                                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 300}ms` }}/>
                                {msg}
                            </div>
                        ))}
                    </div>
                )}

                {/* DONE */}
                {step === 'done' && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                            Blog post ready! The form has been filled in.
                        </div>
                        <button onClick={reset} className="text-xs text-violet-500 hover:underline">New Import</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default YoutubeImporter
