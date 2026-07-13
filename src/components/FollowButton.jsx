import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import appwriteService from '../appwrite/config'

function FollowButton({ authorId, authorName }) {
    const [following, setFollowing]     = useState(false)
    const [followDocId, setFollowDocId] = useState(null)
    const [loading, setLoading]         = useState(false)
    const [checked, setChecked]         = useState(false)
    const userData = useSelector(s => s.auth.userData)

    useEffect(() => {
        if (!userData || !authorId || userData.$id === authorId) { setChecked(true); return }
        appwriteService.isFollowing(userData.$id, authorId).then(r => {
            if (r) { setFollowing(true); setFollowDocId(r.$id) }
            setChecked(true)
        })
    }, [userData, authorId])

    if (!userData || userData.$id === authorId || !checked) return null

    const handleClick = async () => {
        setLoading(true)
        if (following) {
            const ok = await appwriteService.unfollowUser(followDocId)
            if (ok) { setFollowing(false); setFollowDocId(null) }
        } else {
            const r = await appwriteService.followUser(userData.$id, authorId)
            if (r) { setFollowing(true); setFollowDocId(r.$id) }
        }
        setLoading(false)
    }

    return (
        <button onClick={handleClick} disabled={loading}
            aria-label={following ? `Unfollow ${authorName || 'this author'}` : `Follow ${authorName || 'this author'}`}
            className={`px-5 py-2 text-sm font-bold rounded-2xl transition-all duration-200 disabled:opacity-50
                ${following
                    ? 'bg-transparent border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-500 dark:hover:border-red-700'
                    : 'text-white btn-shine shadow-md hover:shadow-lg hover:-translate-y-0.5'
                }`}
            style={!following ? { background: 'linear-gradient(135deg, #7C3AED, #EC4899)' } : {}}>
            {loading ? '...' : following ? 'Following ✓' : 'Follow'}
        </button>
    )
}

export default FollowButton
