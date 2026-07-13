import React, { useState } from 'react'
import appwriteService from '../appwrite/config'
import { useSelector } from 'react-redux'

const callGemini = async (prompt, maxTokens = 600) => {
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
    if (!GEMINI_KEY || GEMINI_KEY === 'undefined') {
        throw new Error('Add VITE_GEMINI_API_KEY to your .env file, then restart the server')
    }
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: maxTokens },
            }),
        }
    )
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Gemini API error ${res.status}`)
    }
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

function PerformancePredictor({ title, content }) {
    const [result, setResult]   = useState(null)
    const [loading, setLoading] = useState(false)
    const [open, setOpen]       = useState(false)
    const userData = useSelector(s => s.auth.userData)

    const wordCount = content
        ? content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
        : 0

    const runPrediction = async () => {
        if (!title?.trim()) return
        setLoading(true); setOpen(true); setResult(null)

        let avgViews = 0, postCount = 0
        if (userData) {
            const posts = await appwriteService.getPostsByUser(userData.$id)
            if (posts?.documents?.length) {
                postCount = posts.documents.length
                avgViews = Math.round(posts.documents.reduce((s, p) => s + (p.views || 0), 0) / postCount)
            }
        }

        const hour    = new Date().getHours()
        const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]

        const prompt = `You are a blog analytics expert. Predict performance for this blog post.

Post Title: "${title}"
Word Count: ${wordCount}
Publishing Time: ${dayName} at ${hour}:00 IST
Author's Past Posts: ${postCount}
Author's Average Views Per Post: ${avgViews}

Analyze and return ONLY valid JSON, no markdown backticks:
{
  "viewsMin": 80,
  "viewsMax": 150,
  "confidence": "Medium",
  "titleScore": 7,
  "titleFeedback": "one line feedback on the title",
  "betterTitle": "improved version of the title with stronger hook",
  "bestTimeToPost": "Tuesday or Wednesday, 8PM-10PM IST",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "viralPotential": "Low"
}`

        try {
            const raw   = await callGemini(prompt, 600)
            const clean = raw.replace(/```json|```/g, '').trim()
            setResult(JSON.parse(clean))
        } catch (e) {
            setResult({ error: e.message })
        }
        setLoading(false)
    }

    const scoreColor = (s) => s >= 8 ? 'text-green-600 dark:text-green-400' : s >= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'
    const viralBg = {
        High:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        Low:    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    }

    return (
        <div className="mt-4">
            <button onClick={runPrediction} disabled={!title?.trim() || loading}
                className="flex items-center gap-2 px-4 py-3 w-full justify-center
                    bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/15 dark:to-pink-900/15
                    border border-violet-200 dark:border-violet-700/40 text-violet-700 dark:text-violet-400
                    text-sm font-bold rounded-2xl hover:shadow-md transition-all disabled:opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                {loading ? 'Predicting…' : '📈 Predict Performance Before Publishing'}
            </button>

            {open && (
                <div className="mt-3 bg-white dark:bg-gray-800/60 rounded-2xl border border-violet-200 dark:border-violet-800/40 shadow-sm overflow-hidden">
                    {loading && (
                        <div className="p-6 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
                            <p className="text-sm text-gray-500 dark:text-gray-400">AI is analyzing your post…</p>
                        </div>
                    )}

                    {!loading && result?.error && (
                        <div className="p-5">
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
                                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && result && !result.error && (
                        <div>
                            <div className="flex items-center justify-between px-5 py-3
                                bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/15 dark:to-pink-900/15
                                border-b border-violet-100 dark:border-violet-800/30">
                                <span className="text-sm font-bold text-violet-800 dark:text-violet-300">📊 Performance Prediction</span>
                                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <p className="text-xl font-black text-gray-800 dark:text-gray-100">{result.viewsMin}–{result.viewsMax}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Expected Views</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <p className={`text-xl font-black ${scoreColor(result.titleScore)}`}>{result.titleScore}/10</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Title Score</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-bold ${viralBg[result.viralPotential] || viralBg.Low}`}>
                                            {result.viralPotential}
                                        </span>
                                        <p className="text-[11px] text-gray-400 mt-1">Viral Potential</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/50">
                                    <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 mb-1">📝 Title Feedback</p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300">{result.titleFeedback}</p>
                                    {result.betterTitle && (
                                        <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                                            <p className="text-[11px] text-yellow-600 dark:text-yellow-400 font-medium">💡 Better Title:</p>
                                            <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200 mt-0.5">"{result.betterTitle}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1.5">✅ Strengths</p>
                                        <ul className="space-y-1">
                                            {result.strengths?.map((s, i) => (
                                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-1.5">
                                                    <span className="text-green-500 flex-shrink-0">•</span>{s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1.5">🔧 Improve</p>
                                        <ul className="space-y-1">
                                            {result.improvements?.map((s, i) => (
                                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-1.5">
                                                    <span className="text-orange-400 flex-shrink-0">•</span>{s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 p-3 bg-violet-50 dark:bg-violet-900/15 rounded-xl">
                                    <span className="text-base">⏰</span>
                                    <div>
                                        <p className="text-xs font-bold text-violet-700 dark:text-violet-400">Best Time to Publish</p>
                                        <p className="text-xs text-violet-600 dark:text-violet-300 mt-0.5">{result.bestTimeToPost}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PerformancePredictor
