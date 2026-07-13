import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import appwriteService from '../appwrite/config'
import { Container, PostCard } from '../components'
import PostCardSkeleton from '../components/PostCardSkeleton'

function Home() {
    const [posts, setPosts]   = useState([])
    const [loading, setLoading] = useState(true)
    const authStatus = useSelector(s => s.auth.status)

    useEffect(() => {
        appwriteService.getPosts([]).then(res => {
            if (res) setPosts(res.documents)
        }).finally(() => setLoading(false))
    }, [])

    return (
        <div className="dark:bg-gray-950 min-h-screen">

            {/* ── HERO SECTION ────────────────────────────────────────────── */}
            <section className="relative overflow-hidden py-24 sm:py-32 px-4">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br
                    from-violet-50 via-white to-cyan-50
                    dark:from-gray-950 dark:via-gray-900 dark:to-purple-950"/>

                {/* Decorative orbs */}
                <div className="orb w-[500px] h-[500px] bg-violet-200/40 dark:bg-violet-900/20
                    -top-40 -left-40"/>
                <div className="orb w-[400px] h-[400px] bg-pink-200/30 dark:bg-pink-900/15
                    top-0 right-0 translate-x-1/2"/>
                <div className="orb w-[300px] h-[300px] bg-cyan-200/30 dark:bg-cyan-900/15
                    bottom-0 left-1/3"/>

                {/* Spinning ring decoration */}
                <div className="absolute top-12 right-12 w-32 h-32 opacity-10 dark:opacity-5 hidden lg:block">
                    <div className="w-full h-full rounded-full border-4 border-dashed border-violet-500 spin-slow"/>
                </div>
                <div className="absolute bottom-12 left-12 w-20 h-20 opacity-10 dark:opacity-5 hidden lg:block">
                    <div className="w-full h-full rounded-full border-4 border-dashed border-pink-500 spin-slow"
                        style={{ animationDirection: 'reverse' }}/>
                </div>

                {/* Content */}
                <div className="relative max-w-5xl mx-auto text-center">

                    {/* Animated badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
                        bg-violet-100 dark:bg-violet-900/30
                        border border-violet-200 dark:border-violet-800/50
                        text-violet-700 dark:text-violet-300 text-sm font-semibold fade-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"/>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"/>
                        </span>
                        ✨ Write • Share • Inspire
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black
                        leading-[1.05] mb-6 fade-up" style={{ animationDelay: '0.1s' }}>
                        <span className="gradient-text-anim">Ideas</span>
                        <span className="text-gray-800 dark:text-white"> that</span>
                        <br/>
                        <span className="text-gray-800 dark:text-white">move the </span>
                        <span className="gradient-text-anim">world</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400
                        max-w-2xl mx-auto mb-10 leading-relaxed fade-up"
                        style={{ animationDelay: '0.2s' }}>
                        Discover amazing stories, share your knowledge, and connect
                        with passionate writers from around the world.
                    </p>

                    {/* CTAs */}
                    <div className="flex items-center justify-center gap-4 flex-wrap fade-up"
                        style={{ animationDelay: '0.3s' }}>
                        <Link to="/all-posts"
                            className="relative overflow-hidden px-8 py-3.5 rounded-2xl text-white font-bold
                                text-base shadow-lg hover:shadow-violet-300/50 dark:hover:shadow-violet-700/30
                                hover:-translate-y-0.5 transition-all duration-300 btn-shine"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                            Explore Posts →
                        </Link>
                        {!authStatus && (
                            <Link to="/signup"
                                className="px-8 py-3.5 border-2 border-violet-300 dark:border-violet-700
                                    text-violet-700 dark:text-violet-300 rounded-2xl font-bold text-base
                                    hover:bg-violet-50 dark:hover:bg-violet-900/20
                                    hover:-translate-y-0.5 transition-all duration-300">
                                Start Writing Free
                            </Link>
                        )}
                    </div>

                    {/* Stats bar */}
                    {!loading && posts.length > 0 && (
                        <div className="mt-14 inline-flex items-center gap-8 px-8 py-4 rounded-2xl
                            bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm
                            border border-gray-100 dark:border-gray-700/50
                            shadow-sm fade-up" style={{ animationDelay: '0.4s' }}>
                            <div className="text-center">
                                <p className="text-2xl font-black gradient-text">{posts.length}+</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Stories</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"/>
                            <div className="text-center">
                                <p className="text-2xl font-black gradient-text">∞</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Ideas</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"/>
                            <div className="text-center">
                                <p className="text-2xl font-black gradient-text">Free</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Forever</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── POSTS SECTION ───────────────────────────────────────────── */}
            <section className="py-16 dark:bg-gray-950">
                <Container>
                    {/* Section heading */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">
                                Latest Stories
                            </h2>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                {loading ? 'Loading...' : `${posts.length} posts published`}
                            </p>
                        </div>
                        {!loading && posts.length > 0 && (
                            <Link to="/all-posts"
                                className="text-sm font-semibold text-violet-600 dark:text-violet-400
                                    hover:text-violet-700 transition-colors flex items-center gap-1">
                                View all
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => <PostCardSkeleton key={i}/>)}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && posts.length === 0 && (
                        <div className="text-center py-24">
                            <div className="w-24 h-24 mx-auto mb-6 float-anim">
                                <img src="/logo.png" alt="Blogify" className="w-full h-full object-contain opacity-30"/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                                No posts yet
                            </h3>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                                Be the first to share your story on Blogify!
                            </p>
                            <Link to="/signup"
                                className="inline-block px-6 py-2.5 rounded-xl text-white font-semibold btn-shine"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                                Start Writing →
                            </Link>
                        </div>
                    )}

                    {/* Posts grid */}
                    {!loading && posts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
                            {posts.map(post => (
                                <PostCard key={post.$id} {...post}/>
                            ))}
                        </div>
                    )}
                </Container>
            </section>
        </div>
    )
}

export default Home
