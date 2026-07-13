import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, PostCard } from '../components'
import appwriteService from '../appwrite/config'
import PostCardSkeleton from '../components/PostCardSkeleton'

function Saved() {
    const [posts, setPosts]     = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const ids = JSON.parse(localStorage.getItem('megablog-saved') || '[]')
        if (!ids.length) { setLoading(false); return }
        Promise.all(ids.map(id => appwriteService.getPost(id)))
            .then(r => setPosts(r.filter(Boolean)))
            .finally(() => setLoading(false))
    }, [])

    const removeSaved = (postId) => {
        const saved = JSON.parse(localStorage.getItem('megablog-saved') || '[]')
        localStorage.setItem('megablog-saved', JSON.stringify(saved.filter(id => id !== postId)))
        setPosts(prev => prev.filter(p => p.$id !== postId))
    }

    return (
        <div className="dark:bg-gray-950 min-h-screen py-12">
            <Container>
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="fade-up">
                        <h1 className="text-4xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"
                                style={{ fill: 'url(#savedGrad)' }}>
                                <defs>
                                    <linearGradient id="savedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#7C3AED"/>
                                        <stop offset="100%" stopColor="#EC4899"/>
                                    </linearGradient>
                                </defs>
                                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                            </svg>
                            <span>Saved <span className="gradient-text">Stories</span></span>
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                            {loading ? 'Loading...' : `${posts.length} saved post${posts.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    {posts.length > 0 && (
                        <button onClick={() => { localStorage.setItem('megablog-saved', '[]'); setPosts([]) }}
                            className="text-xs font-semibold text-red-400 hover:text-red-600
                                border border-red-200 dark:border-red-800/50 px-4 py-2 rounded-xl
                                hover:bg-red-50 dark:hover:bg-red-900/20 transition-all fade-up">
                            Clear All
                        </button>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <PostCardSkeleton key={i}/>)}
                    </div>
                )}

                {/* Empty */}
                {!loading && posts.length === 0 && (
                    <div className="flex flex-col items-center py-28 text-center fade-scale">
                        <div className="w-28 h-28 float-anim mb-6">
                            <img src="/logo.png" alt="Blogify" className="w-full h-full object-contain opacity-20"/>
                        </div>
                        <h2 className="text-2xl font-black text-gray-600 dark:text-gray-400 mb-2">
                            Nothing saved yet
                        </h2>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
                            While reading a post, hit the <strong>Save</strong> button to bookmark it here for later.
                        </p>
                        <Link to="/all-posts"
                            className="px-7 py-3 text-white font-bold rounded-2xl btn-shine hover:-translate-y-0.5 transition-all"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                            Explore Stories →
                        </Link>
                    </div>
                )}

                {/* Posts grid */}
                {!loading && posts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
                        {posts.map(post => (
                            <div key={post.$id} className="relative group">
                                <PostCard $id={post.$id} title={post.title}
                                    featuredImage={post.featuredImage} content={post.content}
                                    category={post.category} sentiment={post.sentiment}/>
                                {/* Remove button */}
                                <button onClick={() => removeSaved(post.$id)}
                                    title="Remove from saved"
                                    className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full
                                        bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-md
                                        flex items-center justify-center
                                        text-gray-400 hover:text-red-500 transition-all
                                        opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    )
}

export default Saved
