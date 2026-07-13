import React, { useState } from 'react'
import appwriteService from '../appwrite/config'
import { Link } from 'react-router-dom'
import { getCategoryStyle, getSentimentStyle } from '../utils/classifyPost'

function PostCard({ $id, title, featuredImage, content, category, sentiment }) {
    const [imgLoaded, setImgLoaded] = useState(false)

    const readingTime = content
        ? Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200))
        : 1

    const catStyle = getCategoryStyle(category)
    const sentStyle = getSentimentStyle(sentiment)

    return (
        <Link to={`/post/${$id}`} className="group block h-full">
            <article className="h-full bg-white dark:bg-gray-800/60 rounded-2xl overflow-hidden
                border border-gray-100 dark:border-gray-700/50 shadow-sm
                post-card-hover transition-all duration-300">

                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 relative">
                    {featuredImage ? (
                        <>
                            {!imgLoaded && <div className="absolute inset-0 skeleton-shine bg-gray-200 dark:bg-gray-700"/>}
                            <img
                                src={appwriteService.getFilePreview(featuredImage)}
                                alt={title}
                                loading="lazy"
                                decoding="async"
                                onLoad={() => setImgLoaded(true)}
                                className={`w-full h-full object-cover transition-all duration-700
                                    group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl font-black gradient-text opacity-30 select-none">
                                {title?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

                    {/* ✅ Category badge — top-left */}
                    {category && (
                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold
                            text-white shadow-sm bg-gradient-to-r ${catStyle.grad} flex items-center gap-1`}>
                            <span>{catStyle.icon}</span>
                            <span>{category}</span>
                        </div>
                    )}

                    {/* Reading time badge — top-right, on hover */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg
                        bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium
                        opacity-0 group-hover:opacity-100 transition-all duration-300
                        translate-y-1 group-hover:translate-y-0">
                        {readingTime} min read
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100
                        line-clamp-2 mb-2.5 leading-snug
                        group-hover:text-violet-700 dark:group-hover:text-violet-400
                        transition-colors duration-200">
                        {title}
                    </h2>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                {readingTime} min
                            </span>

                            {/* ✅ Sentiment indicator */}
                            {sentiment && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                                    ${sentStyle.bg} ${sentStyle.color}`}>
                                    {sentStyle.icon}
                                </span>
                            )}
                        </div>

                        <div className="w-6 h-6 rounded-full flex items-center justify-center
                            bg-violet-50 dark:bg-violet-900/30 text-violet-500 dark:text-violet-400
                            opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100
                            transition-all duration-300">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    )
}

export default PostCard
