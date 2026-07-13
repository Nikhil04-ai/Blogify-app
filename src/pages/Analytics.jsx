import React, { useState, useEffect } from 'react'
import { Container } from '../components'
import { useSelector } from 'react-redux'
import appwriteService from '../appwrite/config'
import { useNavigate, Link } from 'react-router-dom'

function Analytics() {
    const [posts, setPosts]     = useState([])
    const [loading, setLoading] = useState(true)
    const userData   = useSelector(s => s.auth.userData)
    const navigate   = useNavigate()

    useEffect(() => {
        if (!userData) { navigate('/login'); return }
        appwriteService.getPostsByUser(userData.$id).then(r => {
            if (r) setPosts(r.documents)
            setLoading(false)
        })
    }, [userData, navigate])

    const totalViews  = posts.reduce((s, p) => s + (p.views  || 0), 0)
    const totalLikes  = posts.reduce((s, p) => s + (p.likes  || 0), 0)
    const activePosts = posts.filter(p => p.status === 'active').length
    const topPost     = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0))[0]

    const stats = [
        { label: 'Total Posts',  value: posts.length,  icon: '📝', grad: 'from-violet-500 to-purple-600' },
        { label: 'Active Posts', value: activePosts,   icon: '✅', grad: 'from-green-500 to-emerald-600' },
        { label: 'Total Views',  value: totalViews,    icon: '👁️', grad: 'from-blue-500 to-cyan-600' },
        { label: 'Total Claps',  value: totalLikes,    icon: '👏', grad: 'from-pink-500 to-rose-600' },
    ]

    return (
        <div className="dark:bg-gray-950 min-h-screen py-12">
            <Container>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div className="fade-up">
                        <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-1">
                            Your <span className="gradient-text">Analytics</span>
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">See how your content is performing</p>
                    </div>
                    <Link to="/add-post"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white
                            font-semibold text-sm btn-shine hover:-translate-y-0.5 transition-all fade-up"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                        + Write New Post
                    </Link>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
                    {stats.map(s => (
                        <div key={s.label} className="relative overflow-hidden rounded-2xl p-5
                            bg-white dark:bg-gray-800/60
                            border border-gray-100 dark:border-gray-700/50 shadow-sm
                            hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-10
                                bg-gradient-to-br ${s.grad} translate-x-6 -translate-y-6`}/>
                            <div className="text-2xl mb-3">{s.icon}</div>
                            <div className={`text-3xl font-black bg-gradient-to-br ${s.grad}
                                -webkit-background-clip-text`}
                                style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {loading ? '—' : s.value}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Top post */}
                {!loading && topPost && totalViews > 0 && (
                    <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r
                        from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20
                        border border-violet-200/50 dark:border-violet-800/30
                        flex items-center justify-between gap-4 fade-up">
                        <div className="flex items-center gap-4 min-w-0">
                            {topPost.featuredImage && (
                                <img src={appwriteService.getFilePreview(topPost.featuredImage)}
                                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm" alt=""/>
                            )}
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-0.5">
                                    🏆 Top Performing Post
                                </p>
                                <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1 text-sm">
                                    {topPost.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {topPost.views || 0} views · {topPost.likes || 0} claps
                                </p>
                            </div>
                        </div>
                        <Link to={`/post/${topPost.$id}`}
                            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex-shrink-0">
                            View →
                        </Link>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white dark:bg-gray-800/60 rounded-2xl
                    border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden fade-up">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50
                        flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 dark:text-gray-200">All Posts</h2>
                        <span className="text-xs text-gray-400">{posts.length} total</span>
                    </div>

                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-12 skeleton-shine bg-gray-100 dark:bg-gray-700 rounded-xl"/>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400 text-sm">No posts yet.{' '}
                                <Link to="/add-post" className="text-violet-500 hover:underline font-medium">
                                    Write your first!
                                </Link>
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 dark:bg-gray-700/30 text-left">
                                        <th className="px-6 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Title</th>
                                        <th className="px-4 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Views</th>
                                        <th className="px-4 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Claps</th>
                                        <th className="px-4 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Status</th>
                                        <th className="px-4 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {posts.map(post => (
                                        <tr key={post.$id}
                                            className="hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link to={`/post/${post.$id}`}
                                                    className="font-semibold text-gray-800 dark:text-gray-200
                                                        hover:text-violet-600 dark:hover:text-violet-400 line-clamp-1 transition-colors">
                                                    {post.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 font-medium">
                                                {post.views || 0}
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 font-medium">
                                                {post.likes || 0}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                                                    ${post.status === 'active'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Link to={`/edit-post/${post.$id}`}
                                                    className="text-xs font-bold text-violet-500 hover:text-violet-700 transition-colors">
                                                    Edit →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    )
}

export default Analytics
