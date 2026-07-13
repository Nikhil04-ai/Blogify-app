import React, { useEffect, useState } from 'react'
import { Container, PostForm } from '../components'
import appwriteService from '../appwrite/config'
import { useNavigate, useParams } from 'react-router-dom'

function EditPost() {
    const [post, setPosts] = useState(null)
    const { slug } = useParams()
    const navigate  = useNavigate()

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then(post => { if (post) setPosts(post) })
        } else navigate('/')
    }, [slug, navigate])

    if (!post) {
        return (
            <div className="min-h-96 flex items-center justify-center dark:bg-gray-950">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
            </div>
        )
    }

    return (
        <div className="dark:bg-gray-950 min-h-screen py-10">
            <div className="relative overflow-hidden mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5 dark:from-green-900/10 dark:to-emerald-900/10"/>
                <Container>
                    <div className="relative py-8 fade-up">
                        <h1 className="text-3xl font-black text-gray-800 dark:text-white">
                            Edit Your <span className="gradient-text">Story</span>
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Update and refine your post</p>
                    </div>
                </Container>
            </div>
            <Container>
                <PostForm post={post}/>
            </Container>
        </div>
    )
}

export default EditPost
