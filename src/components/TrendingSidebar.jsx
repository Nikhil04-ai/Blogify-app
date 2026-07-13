import { useState, useEffect } from 'react'

function TrendingSidebar({ onTopicSelect }) {
    const [topics, setTopics]     = useState([])
    const [loading, setLoading]   = useState(true)
    const [lastFetched, setLastFetched] = useState(null)

    const categorize = (title) => {
        const t = title.toLowerCase()
        if (t.includes('ai') || t.includes('ml') || t.includes('gpt') || t.includes('llm')) return 'AI'
        if (t.includes('react') || t.includes('next') || t.includes('js') || t.includes('web')) return 'Web'
        if (t.includes('startup') || t.includes('funding') || t.includes('vc')) return 'Startup'
        if (t.includes('python') || t.includes('rust') || t.includes('golang')) return 'Dev'
        if (t.includes('security') || t.includes('hack') || t.includes('breach')) return 'Security'
        return 'Tech'
    }

    const fetchTrending = async () => {
        setLoading(true)
        try {
            const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
            const ids = await idsRes.json()
            const top8 = ids.slice(0, 8)
            const stories = await Promise.all(
                top8.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
            )
            setTopics(
                stories.filter(s => s && s.title).map(s => ({
                    id: s.id, title: s.title, score: s.score,
                    url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
                    type: categorize(s.title),
                }))
            )
            setLastFetched(new Date())
        } catch (e) {
            console.warn('TrendingSidebar: Hacker News fetch failed, using fallback topics', e)
            setTopics([
                { id: 1, title: 'AI tools replacing developer workflows in 2026', score: 890, type: 'AI' },
                { id: 2, title: 'React vs Next.js — which to learn first?', score: 743, type: 'Web' },
                { id: 3, title: 'Open source alternatives to paid SaaS', score: 621, type: 'Tech' },
                { id: 4, title: 'India startup ecosystem funding report', score: 534, type: 'Startup' },
                { id: 5, title: 'Appwrite vs Firebase vs Supabase comparison', score: 478, type: 'Backend' },
            ])
        }
        setLoading(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchTrending() }, [])

    const categoryColor = {
        AI:       'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        Web:      'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
        Startup:  'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
        Dev:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        Security: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
        Tech:     'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-300',
        Backend:  'bg-pink-100   text-pink-700   dark:bg-pink-900/30   dark:text-pink-400',
    }

    return (
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"/>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"/>
                    </span>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">🔥 Trending Right Now</h3>
                </div>
                <button onClick={fetchTrending} disabled={loading}
                    className="text-xs text-violet-500 dark:text-violet-400 hover:underline disabled:opacity-40">
                    Refresh
                </button>
            </div>

            {/* Topics */}
            <div className="p-3">
                {loading ? (
                    <div className="space-y-3 p-2">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-10 skeleton-shine bg-gray-100 dark:bg-gray-700 rounded-xl"/>)}
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {topics.map((topic, idx) => (
                            <button key={topic.id} onClick={() => onTopicSelect(topic.title)}
                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20
                                    transition-colors group border border-transparent hover:border-violet-100 dark:hover:border-violet-800">
                                <div className="flex items-start gap-2">
                                    <span className="text-xs text-gray-300 dark:text-gray-600 font-mono w-4 flex-shrink-0 mt-0.5">{idx + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug
                                            group-hover:text-violet-700 dark:group-hover:text-violet-400 line-clamp-2">
                                            {topic.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${categoryColor[topic.type] || categoryColor.Tech}`}>
                                                {topic.type}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">▲ {topic.score?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-violet-400 flex-shrink-0 mt-0.5"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                {lastFetched && (
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-3">
                        via Hacker News · {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>

            {/* Tip */}
            <div className="mx-3 mb-3 px-3 py-2.5 bg-gradient-to-r from-violet-50 to-pink-50
                dark:from-violet-900/20 dark:to-pink-900/20 rounded-xl">
                <p className="text-[11px] text-violet-600 dark:text-violet-400 leading-relaxed">
                    💡 Click a topic to auto-fill the title in your editor
                </p>
            </div>
        </div>
    )
}

export default TrendingSidebar
