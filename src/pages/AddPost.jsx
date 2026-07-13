import React, { useState, useRef, useEffect } from 'react'
import { Container, PostForm } from '../components'
import YoutubeImporter from '../components/YoutubeImporter'
import TrendingSidebar from '../components/TrendingSidebar'
import PerformancePredictor from '../components/PerformancePredictor'

function AddPost() {
    const [importedPost, setImportedPost] = useState(null)
    const [liveTitle, setLiveTitle]       = useState('')
    const [liveContent, setLiveContent]   = useState('')
    const [mode, setMode]                 = useState('write')
    const [formKey, setFormKey]           = useState('default')
    const formRef = useRef(null)

    useEffect(() => {
        if (importedPost?.title)   setLiveTitle(importedPost.title)
        if (importedPost?.content) setLiveContent(importedPost.content)
    }, [importedPost])

    const handleTopicSelect = (topic) => {
        setImportedPost({ title: topic, content: '', status: 'active' })
        setFormKey('topic-' + Date.now())
        setLiveTitle(topic)
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }

    const handleYoutubeGenerated = (data) => {
        setImportedPost({ title: data.title || '', content: data.content || '', status: 'active' })
        setFormKey('yt-' + Date.now())
        setLiveTitle(data.title || '')
        setLiveContent(data.content || '')
        setMode('write')
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
    }

    const clearImport = () => { setImportedPost(null); setFormKey('default'); setLiveTitle(''); setLiveContent('') }

    return (
        <div className="dark:bg-gray-950 min-h-screen py-10">
            {/* Page header */}
            <div className="relative overflow-hidden mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-pink-600/5 dark:from-violet-900/10 dark:to-pink-900/10"/>
                <Container>
                    <div className="relative py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="fade-up">
                            <h1 className="text-3xl font-black text-gray-800 dark:text-white">
                                Create a <span className="gradient-text">Story</span>
                            </h1>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                Write manually or import from YouTube
                            </p>
                        </div>

                        {/* Mode toggle */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl self-start sm:self-auto fade-up" style={{ animationDelay: '0.1s' }}>
                            <button onClick={() => setMode('write')}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all
                                    ${mode === 'write'
                                        ? 'bg-white dark:bg-gray-700 text-violet-700 dark:text-violet-300 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-violet-600'
                                    }`}>
                                ✍️ Write
                            </button>
                            <button onClick={() => setMode('import')}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all
                                    ${mode === 'import'
                                        ? 'bg-white dark:bg-gray-700 text-violet-700 dark:text-violet-300 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-violet-600'
                                    }`}>
                                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                YouTube Import
                            </button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                {mode === 'import' && <YoutubeImporter onGenerated={handleYoutubeGenerated}/>}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Form */}
                    <div className="flex-1 min-w-0">
                        {importedPost?.title && (
                            <div className="mb-4 px-4 py-3 rounded-2xl bg-gradient-to-r
                                from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20
                                border border-violet-200/50 dark:border-violet-800/30
                                flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-violet-500">✓</span>
                                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 truncate">
                                        Pre-filled: "{importedPost.title}"
                                    </p>
                                </div>
                                <button onClick={clearImport}
                                    className="text-xs text-violet-500 hover:underline flex-shrink-0 ml-2">Clear</button>
                            </div>
                        )}
                        <div ref={formRef}>
                            <PostForm key={formKey} post={importedPost || undefined}/>
                        </div>
                        <PerformancePredictor title={liveTitle} content={liveContent}/>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="lg:sticky lg:top-20 space-y-4">
                            <TrendingSidebar onTopicSelect={handleTopicSelect}/>
                            {/* Tips */}
                            <div className="bg-white dark:bg-gray-800/60 rounded-2xl
                                border border-gray-100 dark:border-gray-700/50 shadow-sm p-4">
                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    💡 Writing Tips
                                </p>
                                <ul className="space-y-2.5">
                                    {[
                                        'Use numbers in title ("5 Ways...")',
                                        'Hook readers in the first line',
                                        'Use subheadings to break content',
                                        '700–1200 words is ideal length',
                                        'End with a clear call to action',
                                    ].map((tip, i) => (
                                        <li key={i} className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="gradient-text font-bold flex-shrink-0">{i + 1}.</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default AddPost
