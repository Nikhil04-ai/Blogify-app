// Fixed category list — keeps the dropdown filter consistent (Reddit/LinkedIn-style flair)
export const CATEGORIES = [
    'Technology', 'Business', 'Health & Wellness', 'Education',
    'Entertainment', 'Lifestyle', 'Science', 'Sports', 'Travel',
    'Food', 'Finance', 'Personal Growth', 'Politics & Society',
    'Art & Design', 'Other',
]

export const SENTIMENTS = ['Positive', 'Neutral', 'Negative']

// Visual styling — gradient per category, used by PostCard / Post / dropdown
export const CATEGORY_STYLES = {
    'Technology':          { grad: 'from-blue-500 to-cyan-500',     icon: '💻' },
    'Business':            { grad: 'from-amber-500 to-orange-600',  icon: '💼' },
    'Health & Wellness':   { grad: 'from-green-500 to-emerald-600', icon: '🩺' },
    'Education':           { grad: 'from-indigo-500 to-blue-600',   icon: '📚' },
    'Entertainment':       { grad: 'from-pink-500 to-rose-600',     icon: '🎬' },
    'Lifestyle':           { grad: 'from-purple-500 to-pink-500',   icon: '🌿' },
    'Science':             { grad: 'from-cyan-500 to-teal-600',     icon: '🔬' },
    'Sports':              { grad: 'from-red-500 to-orange-600',    icon: '⚽' },
    'Travel':              { grad: 'from-sky-500 to-blue-600',      icon: '✈️' },
    'Food':                { grad: 'from-yellow-500 to-amber-600',  icon: '🍳' },
    'Finance':             { grad: 'from-emerald-500 to-green-600', icon: '💰' },
    'Personal Growth':     { grad: 'from-violet-500 to-purple-600', icon: '🌱' },
    'Politics & Society':  { grad: 'from-slate-500 to-gray-600',    icon: '🏛️' },
    'Art & Design':        { grad: 'from-fuchsia-500 to-pink-600',  icon: '🎨' },
    'Other':               { grad: 'from-gray-400 to-gray-500',     icon: '📄' },
}

export const SENTIMENT_STYLES = {
    Positive: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800/50', icon: '😊' },
    Neutral:  { color: 'text-gray-600 dark:text-gray-400',   bg: 'bg-gray-50 dark:bg-gray-800/50',   border: 'border-gray-200 dark:border-gray-700',      icon: '😐' },
    Negative: { color: 'text-red-700 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800/50',     icon: '🔥' },
}

export const getCategoryStyle = (category) => CATEGORY_STYLES[category] || CATEGORY_STYLES['Other']
export const getSentimentStyle = (sentiment) => SENTIMENT_STYLES[sentiment] || SENTIMENT_STYLES['Neutral']

/**
 * Classifies a post's category, sentiment and tags using Gemini.
 * Falls back to safe defaults if no API key or the call fails.
 */
export async function classifyPost(title, htmlContent) {
    const key = import.meta.env.VITE_GEMINI_API_KEY
    const plainContent = (htmlContent || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2500)

    if (!key || key === 'undefined') {
        return { category: 'Other', sentiment: 'Neutral', tags: [] }
    }

    const prompt = `Analyze this blog post and classify it.

Title: "${title}"
Content: "${plainContent}"

1. Pick EXACTLY ONE category from this list (copy the spelling exactly): ${CATEGORIES.join(', ')}
2. Determine the overall sentiment/tone of the writing: Positive, Neutral, or Negative
3. Generate 3-5 short relevant tags (single words or short phrases, no hashtags)

Return ONLY valid JSON, no markdown, no explanation:
{"category":"...","sentiment":"...","tags":["...","...","..."]}`

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
                }),
            }
        )
        const data = await res.json()
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const clean = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        return {
            category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Other',
            sentiment: SENTIMENTS.includes(parsed.sentiment) ? parsed.sentiment : 'Neutral',
            tags: Array.isArray(parsed.tags) ? parsed.tags.filter(Boolean).slice(0, 5) : [],
        }
    } catch {
        return { category: 'Other', sentiment: 'Neutral', tags: [] }
    }
}

export default classifyPost
