import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import appwriteService from '../appwrite/config'
import conf from '../conf/conf'

function Comments({ postId }) {
    const [comments, setComments]   = useState([])
    const [loading, setLoading]     = useState(true)
    const [content, setContent]     = useState('')
    const [submitting, setSubmitting] = useState(false)

    const userData = useSelector(state => state.auth.userData)

    // Declared before the effect below so there's no reliance on hoisting
    const fetchComments = async () => {
        setLoading(true)
        const result = await appwriteService.getComments(postId)
        if (result) setComments(result.documents)
        setLoading(false)
    }

    useEffect(() => {
        fetchComments()

        // ── Appwrite Realtime: new comments appear without refresh ─────────────
        let unsubscribe
        try {
            unsubscribe = appwriteService.client.subscribe(
                `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteCommentsCollectionId}.documents`,
                (response) => {
                    const events = response.events || []
                    if (events.some(e => e.includes('.create'))) {
                        if (response.payload?.postId === postId) {
                            // Dedup check — prevents duplicate when optimistic update already added it
                            setComments(prev =>
                                prev.some(c => c.$id === response.payload.$id)
                                    ? prev
                                    : [response.payload, ...prev]
                            )
                        }
                    }
                    if (events.some(e => e.includes('.delete'))) {
                        setComments(prev => prev.filter(c => c.$id !== response.payload.$id))
                    }
                }
            )
        } catch (subscribeError) {
            // Realtime subscription not available — comments still load via fetchComments() above
            console.log('Comments realtime subscription unavailable', subscribeError)
        }

        return () => { if (unsubscribe) unsubscribe() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim() || !userData) return
        setSubmitting(true)

        const result = await appwriteService.addComment({
            postId,
            userId:   userData.$id,
            userName: userData.name,
            content:  content.trim(),
        })

        if (result) {
            // Optimistic: already added via realtime; avoid duplicate if not realtime
            setComments(prev =>
                prev.some(c => c.$id === result.$id) ? prev : [result, ...prev]
            )
            setContent('')
        }
        setSubmitting(false)
    }

    const handleDelete = async (commentId) => {
        await appwriteService.deleteComment(commentId)
        // realtime will remove it; fallback below
        setComments(prev => prev.filter(c => c.$id !== commentId))
    }

    return (
        <div className="mt-14 pt-10 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Comments <span className="text-gray-400 dark:text-gray-500 font-normal text-base">({comments.length})</span>
            </h3>

            {/* ── Comment form ── */}
            {userData ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                            <span className="text-white text-sm font-bold">
                                {userData.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Share your thoughts..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600
                                    bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                    text-sm resize-none focus:outline-none focus:ring-2
                                    focus:ring-violet-300 dark:focus:ring-violet-600
                                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                                    transition-all"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={submitting || !content.trim()}
                                    style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
                                    className="px-5 py-2 text-white text-sm font-bold rounded-xl btn-shine transition-all
                                        disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                                >
                                    {submitting ? 'Posting…' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    <Link to="/login" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">Login</Link>
                    {' '}to leave a comment.
                </div>
            )}

            {/* ── Comments list ── */}
            {loading ? (
                <div className="space-y-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-1/4" />
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                    No comments yet — be the first! 💬
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map(comment => (
                        <div key={comment.$id} className="flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-white text-sm font-bold">
                                    {comment.userName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {comment.userName}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {new Date(comment.$createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    {userData?.$id === comment.userId && (
                                        <button
                                            onClick={() => handleDelete(comment.$id)}
                                            className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Comments
