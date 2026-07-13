import React, { useState, useEffect } from 'react'
import appwriteService from '../appwrite/config'

function LikeButton({ postId, initialLikes = 0 }) {
    const [likes, setLikes]       = useState(initialLikes)
    const [liked, setLiked]       = useState(false)
    const [animating, setAnimating] = useState(false)

    useEffect(() => {
        const likedPosts = JSON.parse(localStorage.getItem('megablog-liked') || '[]')
        setLiked(likedPosts.includes(postId))
    }, [postId])

    const handleClap = async () => {
        if (liked) return
        setAnimating(true)
        setLiked(true)
        setLikes(prev => prev + 1)

        const likedPosts = JSON.parse(localStorage.getItem('megablog-liked') || '[]')
        localStorage.setItem('megablog-liked', JSON.stringify([...likedPosts, postId]))

        await appwriteService.likePost(postId, likes)
        setTimeout(() => setAnimating(false), 700)
    }

    return (
        <button
            onClick={handleClap}
            disabled={liked}
            title={liked ? 'You clapped!' : 'Clap for this post'}
            className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 text-sm font-medium
                transition-all duration-300 select-none
                ${liked
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 cursor-default'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer'
                }
                ${animating ? 'scale-110' : 'scale-100'}
            `}
        >
            <span className={`text-xl transition-transform duration-300 ${animating ? 'animate-bounce' : 'group-hover:scale-110'}`}>
                👏
            </span>
            <span className="font-semibold">{likes}</span>
            <span>{liked ? 'Clapped!' : 'Clap'}</span>
        </button>
    )
}

export default LikeButton
