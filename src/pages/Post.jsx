import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import appwriteService from "../appwrite/config"
import { Button, Container } from "../components"
import parse from "html-react-parser"
import { useSelector } from "react-redux"
import PostActions from "../components/PostActions"
import Comments from "../components/Comments"
import QuoteShare from "../components/QuoteShare"
import FollowButton from "../components/FollowButton"
import { getCategoryStyle, getSentimentStyle } from "../utils/classifyPost"

const getGradient = (str = '') => {
    const g = ['from-violet-400 to-purple-600','from-pink-400 to-rose-600','from-cyan-400 to-blue-600','from-orange-400 to-red-600','from-green-400 to-emerald-600']
    return g[(str.charCodeAt(0) || 0) % g.length]
}

export default function Post() {
    const [post, setPost]       = useState(null)
    const [imgOpen, setImgOpen] = useState(null)
    const { slug }              = useParams()
    const navigate              = useNavigate()
    const userData              = useSelector(s => s.auth.userData)
    const isAuthor              = post && userData ? post.userId === userData.$id : false

    const readingTime = post?.content
        ? Math.max(1, Math.ceil(post.content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200))
        : 1

    const authorName = post
        ? (post.authorName?.trim() || localStorage.getItem(`megablog_name_${post.userId}`) || 'Author')
        : 'Author'

    const catStyle  = post?.category  ? getCategoryStyle(post.category)   : null
    const sentStyle = post?.sentiment ? getSentimentStyle(post.sentiment) : null

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then(p => {
                if (p) { setPost(p); appwriteService.incrementViews(p.$id, p.views || 0) }
                else navigate("/")
            })
        } else navigate("/")
    }, [slug, navigate])

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then(s => {
            if (s) { appwriteService.deleteFile(post.featuredImage); navigate("/") }
        })
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
            </div>
        )
    }

    return (
        <div className="dark:bg-gray-950 min-h-screen pb-20">
            <QuoteShare/>

            {/* Lightbox */}
            {imgOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setImgOpen(null)}>
                    <img src={imgOpen} alt="full view"
                        className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
                        onClick={e => e.stopPropagation()}/>
                    <button onClick={() => setImgOpen(null)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur
                            flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            )}

            {/* Hero image — always shows the COMPLETE image (object-contain never crops), 
                capped height so oversized images don't dominate the page. Letterbox gaps 
                (when the image's aspect ratio doesn't match the box) are filled with a 
                blurred copy of the same image so it looks intentional, not empty. */}
            <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                {post.featuredImage ? (
                    <>
                        {/* Blurred fill background */}
                        <div
                            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-50"
                            style={{ backgroundImage: `url(${appwriteService.getFilePreview(post.featuredImage)})` }}
                            aria-hidden="true"
                        />
                        {/* Foreground: complete image, letterboxed to fit within the cap */}
                        <div className="relative flex items-center justify-center max-h-[480px] overflow-hidden">
                            <img src={appwriteService.getFilePreview(post.featuredImage)}
                                alt={post.title}
                                className="w-full max-h-[480px] object-contain"/>
                        </div>
                        {/* Gradient overlay bottom — purely decorative fade, doesn't clip the image itself */}
                        <div className="absolute bottom-0 left-0 right-0 h-32
                            bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none"/>
                    </>
                ) : (
                    <div className={`w-full h-48 bg-gradient-to-br ${getGradient(post.title)}
                        flex items-center justify-center`}>
                        <span className="text-white/40 text-8xl font-black">{post.title?.charAt(0)}</span>
                    </div>
                )}

                {/* Edit/Delete */}
                {isAuthor && (
                    <div className="absolute right-4 top-4 flex gap-2">
                        <Link to={`/edit-post/${post.$id}`}>
                            <Button bgColor="bg-green-500" className="shadow-lg">Edit</Button>
                        </Link>
                        <Button bgColor="bg-red-500" onClick={deletePost} className="shadow-lg">Delete</Button>
                    </div>
                )}
            </div>

            <Container>
                <div className="max-w-3xl mx-auto -mt-4 relative">

                    {/* ✅ Category + Sentiment badges */}
                    {(post.category || post.sentiment) && (
                        <div className="flex items-center gap-2 mb-4 fade-up">
                            {post.category && (
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                                    text-white bg-gradient-to-r ${catStyle.grad} shadow-sm`}>
                                    <span>{catStyle.icon}</span>
                                    <span>{post.category}</span>
                                </span>
                            )}
                            {post.sentiment && (
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                                    border ${sentStyle.bg} ${sentStyle.color} ${sentStyle.border}`}>
                                    <span>{sentStyle.icon}</span>
                                    <span>{post.sentiment}</span>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white
                        leading-tight mb-6 fade-up">
                        {post.title}
                    </h1>

                    {/* ✅ Tags */}
                    {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6 fade-up">
                            {post.tags.map((tag, i) => (
                                <span key={i}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium
                                        bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Author row */}
                    <div className="flex items-center justify-between flex-wrap gap-4
                        pb-8 border-b border-gray-100 dark:border-gray-800 mb-8 fade-up"
                        style={{ animationDelay: '0.1s' }}>
                        <Link to={`/profile/${post.userId}`} className="flex items-center gap-3 group">
                            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getGradient(authorName)}
                                flex items-center justify-center flex-shrink-0
                                ring-2 ring-white dark:ring-gray-950 shadow-md
                                group-hover:scale-110 transition-transform duration-200`}>
                                <span className="text-white font-bold select-none">
                                    {authorName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200
                                    group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {authorName}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        {readingTime} min read
                                    </span>
                                    <span>·</span>
                                    <span>{(post.views || 0) + 1} views</span>
                                </div>
                            </div>
                        </Link>
                        <FollowButton authorId={post.userId} authorName={authorName}/>
                    </div>

                    {/* Content */}
                    <div data-quotable
                        className="browser-css prose-blogify text-gray-700 dark:text-gray-300
                            leading-relaxed prose prose-gray dark:prose-invert max-w-none fade-up"
                        style={{ animationDelay: '0.15s' }}>
                        {parse(post.content)}
                    </div>

                    {/* Gallery */}
                    {post.gallery?.length > 0 && (
                        <div className="mt-12 fade-up">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500
                                uppercase tracking-widest mb-4">
                                📷 Gallery ({post.gallery.length})
                            </h3>
                            <div className={`grid gap-2 ${
                                post.gallery.length === 1 ? 'grid-cols-1' :
                                post.gallery.length === 2 ? 'grid-cols-2' :
                                'grid-cols-2 sm:grid-cols-3'}`}>
                                {post.gallery.map((fileId, i) => (
                                    <button key={i} onClick={() => setImgOpen(appwriteService.getFilePreview(fileId))}
                                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-zoom-in
                                            ring-1 ring-gray-100 dark:ring-gray-700">
                                        <img src={appwriteService.getFilePreview(fileId)}
                                            alt={`Gallery ${i + 1}`} loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                        <div className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/10 transition-colors"/>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 fade-up">
                        <PostActions postId={post.$id} initialLikes={post.likes || 0}
                            initialDislikes={post.dislikes || 0} title={post.title}/>
                    </div>

                    {/* Comments */}
                    <Comments postId={post.$id}/>
                </div>
            </Container>
        </div>
    )
}
