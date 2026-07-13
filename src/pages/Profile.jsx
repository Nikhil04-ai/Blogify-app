import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import FollowButton from '../components/FollowButton'
import appwriteService from '../appwrite/config'

const getGradient = (str = '') => {
    const g = ['from-violet-500 to-purple-700','from-pink-500 to-rose-700',
        'from-cyan-500 to-blue-700','from-orange-500 to-red-700',
        'from-green-500 to-emerald-700','from-teal-500 to-cyan-700']
    return g[(str.charCodeAt(0) || 0) % g.length]
}

function Profile() {
    const { userId } = useParams()
    const navigate   = useNavigate()
    const currentUser = useSelector(s => s.auth.userData)
    const targetUserId = userId || currentUser?.$id
    const isOwnProfile = !userId || userId === currentUser?.$id

    const [posts, setPosts]         = useState([])
    const [loading, setLoading]     = useState(true)
    const [followers, setFollowers] = useState(0)
    const [following, setFollowing] = useState(0)
    const [bio, setBio]             = useState('')
    const [editingBio, setEditingBio] = useState(false)
    const [tempBio, setTempBio]     = useState('')
    const [activeTab, setActiveTab] = useState('posts')

    const displayName = isOwnProfile
        ? (currentUser?.name || 'User')
        : (localStorage.getItem(`megablog_name_${targetUserId}`) || 'Author')
    const handle = '@' + displayName.toLowerCase().replace(/\s+/g, '')

    // Declared before the effect below so there's no reliance on hoisting
    const loadProfile = async () => {
        setLoading(true)
        const res = await appwriteService.getPostsByUser(targetUserId)
        if (res) setPosts(isOwnProfile ? res.documents : res.documents.filter(p => p.status === 'active'))
        const [fc, fg] = await Promise.all([
            appwriteService.getFollowerCount(targetUserId),
            appwriteService.getFollowingCount(targetUserId),
        ])
        setFollowers(fc); setFollowing(fg)
        const saved = localStorage.getItem(`megablog_bio_${targetUserId}`) || ''
        setBio(saved); setTempBio(saved)
        setLoading(false)
    }

    useEffect(() => {
        if (!targetUserId) { navigate('/login'); return }
        if (isOwnProfile && currentUser?.name) {
            localStorage.setItem(`megablog_name_${currentUser.$id}`, currentUser.name)
        }
        loadProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetUserId])

    const saveBio = () => {
        localStorage.setItem(`megablog_bio_${currentUser.$id}`, tempBio)
        setBio(tempBio); setEditingBio(false)
    }

    const totalViews  = posts.reduce((s, p) => s + (p.views  || 0), 0)
    const totalLikes  = posts.reduce((s, p) => s + (p.likes  || 0), 0)
    const activePosts = posts.filter(p => p.status === 'active').length
    const topPost     = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
    const gradient    = getGradient(displayName)

    return (
        <div className="dark:bg-gray-950 min-h-screen">
            {/* Cover gradient */}
            <div className={`w-full h-32 bg-gradient-to-r ${gradient} relative`}>
                <div className="absolute inset-0 bg-black/20"/>
                {/* Back button */}
                <button onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur
                        flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <div className="absolute top-4 right-4 text-white/70 text-xs font-medium">{handle}</div>
            </div>

            <div className="max-w-xl mx-auto px-4 relative">
                {/* Avatar — overlapping cover */}
                <div className="flex items-end justify-between -mt-12 mb-4">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient}
                        flex items-center justify-center ring-4 ring-white dark:ring-gray-950 shadow-xl`}>
                        <span className="text-white text-4xl font-black select-none">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {isOwnProfile ? (
                        <div className="flex gap-2 mb-2">
                            <button onClick={() => setEditingBio(true)}
                                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700
                                    text-sm font-bold text-gray-700 dark:text-gray-200 rounded-xl
                                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Edit Profile
                            </button>
                            <Link to="/add-post"
                                className="px-4 py-2 text-white text-sm font-bold rounded-xl btn-shine transition-all"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                                + Write
                            </Link>
                        </div>
                    ) : (
                        <div className="mb-2">
                            <FollowButton authorId={targetUserId} authorName={displayName}/>
                        </div>
                    )}
                </div>

                {/* Name + Bio */}
                <div className="mb-5">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">{displayName}</h1>
                    {isOwnProfile && currentUser?.email && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{currentUser.email}</p>
                    )}
                    {editingBio ? (
                        <div className="mt-3 space-y-2">
                            <textarea value={tempBio} onChange={e => setTempBio(e.target.value)}
                                placeholder="Write something about yourself..."
                                rows={2} maxLength={150}
                                className="w-full px-4 py-3 text-sm border border-violet-300 dark:border-violet-700
                                    rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                    focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"/>
                            <div className="flex gap-2">
                                <button onClick={saveBio}
                                    className="px-5 py-1.5 text-white text-xs font-bold rounded-lg btn-shine"
                                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>Save</button>
                                <button onClick={() => { setEditingBio(false); setTempBio(bio) }}
                                    className="px-5 py-1.5 border border-gray-200 dark:border-gray-700
                                        text-xs text-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className={`text-sm mt-2 leading-snug ${bio ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 italic'}`}>
                            {bio || (isOwnProfile ? 'Add a bio to tell your story...' : '')}
                        </p>
                    )}
                </div>

                {/* Stats row */}
                <div className="flex gap-6 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                    {[
                        { label: 'Posts',     val: loading ? '—' : posts.length },
                        { label: 'Followers', val: loading ? '—' : followers },
                        { label: 'Following', val: loading ? '—' : following },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className="text-xl font-black gradient-text">{s.val}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics mini-row (own profile) */}
                {isOwnProfile && !loading && (
                    <div className="grid grid-cols-4 gap-2 mb-5">
                        {[
                            { icon: '👁️', val: totalViews,   label: 'Views',  c: 'from-blue-500 to-cyan-500' },
                            { icon: '👏', val: totalLikes,   label: 'Claps',  c: 'from-violet-500 to-purple-600' },
                            { icon: '✅', val: activePosts,  label: 'Active', c: 'from-green-500 to-emerald-600' },
                            { icon: '📝', val: posts.length, label: 'Total',  c: 'from-pink-500 to-rose-600' },
                        ].map(s => (
                            <div key={s.label}
                                className="text-center p-3 rounded-2xl bg-white dark:bg-gray-800/60
                                    border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                <div className="text-lg mb-1">{s.icon}</div>
                                <div className="text-lg font-black gradient-text">{s.val}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Top post */}
                {isOwnProfile && !loading && topPost && totalViews > 0 && (
                    <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r
                        from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20
                        border border-violet-200/50 dark:border-violet-800/30 flex items-center gap-3">
                        {topPost.featuredImage && (
                            <img src={appwriteService.getFilePreview(topPost.featuredImage)}
                                className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt=""/>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">🏆 Top Post</p>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1 mt-0.5">{topPost.title}</p>
                            <p className="text-[10px] text-gray-400">{topPost.views || 0} views · {topPost.likes || 0} claps</p>
                        </div>
                        <Link to={`/post/${topPost.$id}`} className="text-xs font-bold text-violet-500 hover:underline flex-shrink-0">View →</Link>
                    </div>
                )}

                {/* Tab bar */}
                {isOwnProfile && (
                    <div className="flex border-b border-gray-100 dark:border-gray-800 mb-0">
                        {[
                            { id: 'posts', icon: '⊞', label: 'Posts' },
                            { id: 'analytics', icon: '📊', label: 'Analytics' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-b-2 border-violet-500 text-violet-600 dark:text-violet-400 -mb-px'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}>
                                <span>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Posts grid */}
                {(activeTab === 'posts' || !isOwnProfile) && (
                    <>
                        {!isOwnProfile && <div className="border-t border-gray-100 dark:border-gray-800"/>}
                        {loading ? (
                            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="aspect-square skeleton-shine bg-gray-100 dark:bg-gray-800"/>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="flex flex-col items-center py-20 text-center">
                                <div className="w-20 h-20 float-anim mb-4">
                                    <img src="/logo.png" alt="Blogify" className="w-full h-full object-contain opacity-20"/>
                                </div>
                                <p className="font-bold text-gray-600 dark:text-gray-400 mb-1">No posts yet</p>
                                <p className="text-xs text-gray-400 mb-4">
                                    {isOwnProfile ? 'Start writing your first story!' : 'This author has no posts yet.'}
                                </p>
                                {isOwnProfile && (
                                    <Link to="/add-post"
                                        className="px-5 py-2 text-white text-sm font-bold rounded-xl btn-shine"
                                        style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                                        Write First Post →
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                                {posts.map(post => (
                                    <Link key={post.$id} to={`/post/${post.$id}`} className="group relative">
                                        <div className="aspect-square overflow-hidden bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30">
                                            {post.featuredImage ? (
                                                <img src={appwriteService.getFilePreview(post.featuredImage)}
                                                    alt={post.title} loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-2xl font-black gradient-text opacity-50">
                                                        {post.title?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0
                                                group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-2">
                                                <div className="flex gap-3 text-white text-xs font-bold">
                                                    <span>👁️ {post.views || 0}</span>
                                                    <span>👏 {post.likes || 0}</span>
                                                </div>
                                            </div>
                                            {isOwnProfile && post.status !== 'active' && (
                                                <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
                                                    <span className="text-[9px] text-amber-300 font-bold uppercase">Draft</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Analytics tab */}
                {isOwnProfile && activeTab === 'analytics' && (
                    <div className="py-4 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1,2,3].map(i => <div key={i} className="h-16 skeleton-shine bg-gray-100 dark:bg-gray-800 rounded-2xl"/>)}
                            </div>
                        ) : posts.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-12">No data yet. Start writing!</p>
                        ) : (
                            posts.map(post => (
                                <Link key={post.$id} to={`/post/${post.$id}`}>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800/60
                                        border border-gray-100 dark:border-gray-700/50
                                        hover:border-violet-200 dark:hover:border-violet-700/50 transition-colors mb-2">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0
                                            bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30">
                                            {post.featuredImage
                                                ? <img src={appwriteService.getFilePreview(post.featuredImage)}
                                                    className="w-full h-full object-cover" alt=""/>
                                                : <div className="w-full h-full flex items-center justify-center">
                                                    <span className="font-black gradient-text">{post.title?.charAt(0)}</span>
                                                  </div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{post.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[11px] text-gray-400">👁️ {post.views || 0}</span>
                                                <span className="text-[11px] text-gray-400">👏 {post.likes || 0}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                                                    ${post.status === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}>{post.status}</span>
                                            </div>
                                        </div>
                                        {/* Mini bar */}
                                        <div className="flex items-end gap-0.5 h-8 flex-shrink-0">
                                            {[post.views || 0, post.likes || 0].map((val, i) => {
                                                const maxVal = Math.max(totalViews, 1)
                                                const h = Math.max(4, Math.round((val / maxVal) * 32))
                                                return <div key={i} className={`w-2 rounded-sm ${i === 0 ? 'bg-violet-400' : 'bg-pink-400'}`} style={{ height: `${h}px` }}/>
                                            })}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                <div className="h-10"/>
            </div>
        </div>
    )
}

export default Profile
