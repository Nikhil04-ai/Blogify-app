import React from 'react'

function PostCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl overflow-hidden
            border border-gray-100 dark:border-gray-700/50 shadow-sm">
            <div className="aspect-video skeleton-shine bg-gradient-to-br
                from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600"/>
            <div className="p-4 space-y-3">
                <div className="h-3.5 skeleton-shine bg-gray-200 dark:bg-gray-700 rounded-lg"/>
                <div className="h-3.5 skeleton-shine bg-gray-200 dark:bg-gray-700 rounded-lg w-4/5"/>
                <div className="h-3 skeleton-shine bg-gray-100 dark:bg-gray-700/60 rounded-lg w-1/3 mt-2"/>
            </div>
        </div>
    )
}

export default PostCardSkeleton
