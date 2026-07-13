import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from '../appwrite/config'
import PostCardSkeleton from '../components/PostCardSkeleton'
import CategoryDropdown from '../components/CategoryDropdown'

function AllPosts() {
    const [posts, setPosts]         = useState([])
    const [loading, setLoading]     = useState(true)
    const [search, setSearch]       = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [semanticTerms, setSemanticTerms] = useState([])
    const [expanding, setExpanding] = useState(false)
    const debounceRef               = useRef(null)

    useEffect(() => {
        appwriteService.getPosts([]).then(res => {
            if (res) setPosts(res.documents)
        }).finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!search.trim() || search.length < 2) { setSemanticTerms([]); return }
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            const key = import.meta.env.VITE_GEMINI_API_KEY
            if (!key || key === 'undefined') { setSemanticTerms([search.toLowerCase()]); return }
            setExpanding(true)
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
                    { method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ contents: [{ parts: [{ text: `Search query: "${search}"\nList related English synonyms and translations (especially from Hindi/Hinglish). Return ONLY comma-separated lowercase keywords, max 8.` }] }], generationConfig: { maxOutputTokens: 60 } }) }
                )
                const data = await res.json()
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
                setSemanticTerms([...new Set([search.toLowerCase(), ...text.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)])])
            } catch { setSemanticTerms([search.toLowerCase()]) }
            setExpanding(false)
        }, 600)
        return () => clearTimeout(debounceRef.current)
    }, [search])

    // ✅ Category counts — computed once per posts change
    const categoryCounts = useMemo(() => {
        return posts.reduce((acc, p) => {
            const cat = p.category || 'Other'
            acc[cat] = (acc[cat] || 0) + 1
            return acc
        }, {})
    }, [posts])

    const availableCategories = useMemo(
        () => Object.keys(categoryCounts).sort(),
        [categoryCounts]
    )

    // ✅ Combined filter: category AND search
    const filtered = posts.filter(post => {
        const matchesCategory = selectedCategory === 'All' || (post.category || 'Other') === selectedCategory
        if (!matchesCategory) return false

        if (!search.trim()) return true
        const terms = semanticTerms.length > 0 ? semanticTerms : [search.toLowerCase()]
        const hay = `${post.title} ${(post.content || '').replace(/<[^>]+>/g, '')}`.toLowerCase()
        return terms.some(t => hay.includes(t))
    })

    const clearFilters = () => { setSearch(''); setSemanticTerms([]); setSelectedCategory('All') }

    return (
        <div className="dark:bg-gray-950 min-h-screen py-12">
            <Container>
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2 fade-up">
                        Explore <span className="gradient-text">Stories</span>
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm fade-up" style={{ animationDelay: '0.1s' }}>
                        {loading ? 'Loading...' : `${filtered.length} of ${posts.length} posts`}
                    </p>
                </div>

                {/* Search + Category filter row */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 fade-up" style={{ animationDelay: '0.15s' }}>
                    {/* Search bar */}
                    <div className="relative flex-1 max-w-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-pink-400 rounded-2xl opacity-20 blur-sm"/>
                        <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-2xl
                            border border-violet-200/50 dark:border-violet-700/30 shadow-sm overflow-hidden">
                            <svg className="w-5 h-5 text-violet-400 ml-4 flex-shrink-0"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input type="text" placeholder="Search in English or Hindi..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="flex-1 px-4 py-3.5 text-sm bg-transparent text-gray-800
                                    dark:text-gray-200 outline-none placeholder:text-gray-400"/>
                            {expanding && <div className="mr-4 w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>}
                            {search && !expanding && (
                                <button onClick={() => { setSearch(''); setSemanticTerms([]) }}
                                    className="mr-3 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700
                                        flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ✅ Category dropdown */}
                    <CategoryDropdown
                        categories={availableCategories}
                        selected={selectedCategory}
                        onChange={setSelectedCategory}
                        counts={categoryCounts}
                    />
                </div>

                {/* Active filters row */}
                {(selectedCategory !== 'All' || semanticTerms.length > 1) && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        {selectedCategory !== 'All' && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                                text-white bg-gradient-to-r from-violet-500 to-pink-500">
                                {selectedCategory}
                                <button onClick={() => setSelectedCategory('All')} className="hover:scale-110 transition-transform">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </span>
                        )}
                        {semanticTerms.length > 1 && search && (
                            <>
                                <span className="text-xs text-gray-400">Also searching:</span>
                                {semanticTerms.slice(1, 5).map(term => (
                                    <span key={term} className="px-2.5 py-1 rounded-full text-xs font-medium
                                        bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400
                                        border border-violet-200 dark:border-violet-800/50">
                                        {term}
                                    </span>
                                ))}
                            </>
                        )}
                        <button onClick={clearFilters}
                            className="text-xs text-gray-400 hover:text-red-500 underline ml-1 transition-colors">
                            Clear all
                        </button>
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <PostCardSkeleton key={i}/>)}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
                        {filtered.map(post => (
                            <PostCard key={post.$id} $id={post.$id} title={post.title}
                                featuredImage={post.featuredImage} content={post.content}
                                category={post.category} sentiment={post.sentiment}/>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="text-gray-500 dark:text-gray-400 text-base font-medium">
                            {selectedCategory !== 'All' && search
                                ? <>No posts found in "<span className="text-violet-500">{selectedCategory}</span>" for "<span className="text-violet-500">{search}</span>"</>
                                : selectedCategory !== 'All'
                                    ? <>No posts found in "<span className="text-violet-500">{selectedCategory}</span>"</>
                                    : <>No posts found for "<span className="text-violet-500">{search}</span>"</>
                            }
                        </p>
                        <button onClick={clearFilters} className="mt-4 text-sm text-violet-500 hover:underline">
                            Clear filters
                        </button>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default AllPosts
