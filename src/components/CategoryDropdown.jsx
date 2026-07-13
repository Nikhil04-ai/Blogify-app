import React, { useState, useRef, useEffect } from 'react'
import { getCategoryStyle } from '../utils/classifyPost'

function CategoryDropdown({ categories, selected, onChange, counts = {} }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [])

    const selectedStyle = selected !== 'All' ? getCategoryStyle(selected) : null

    return (
        <div className="relative" ref={ref}>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold
                    bg-white dark:bg-gray-800 border border-violet-200/60 dark:border-violet-700/30
                    text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md
                    hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-200 min-w-[180px] justify-between"
            >
                <span className="flex items-center gap-2">
                    {selected === 'All' ? (
                        <>
                            <span className="text-base">🗂️</span>
                            <span>All Categories</span>
                        </>
                    ) : (
                        <>
                            <span className="text-base">{selectedStyle.icon}</span>
                            <span>{selected}</span>
                        </>
                    )}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-30 mt-2 w-72 max-h-80 overflow-y-auto
                    bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
                    border border-violet-100 dark:border-violet-800/40 p-2 fade-scale">

                    {/* All option */}
                    <button
                        onClick={() => { onChange('All'); setOpen(false) }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm
                            transition-colors duration-150
                            ${selected === 'All'
                                ? 'bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/30 dark:to-pink-900/30 text-violet-700 dark:text-violet-300 font-bold'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <span>🗂️</span>
                            <span>All Categories</span>
                        </span>
                        <span className="text-xs text-gray-400">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
                    </button>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5"/>

                    {categories.map(cat => {
                        const style = getCategoryStyle(cat)
                        return (
                            <button
                                key={cat}
                                onClick={() => { onChange(cat); setOpen(false) }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm
                                    transition-colors duration-150
                                    ${selected === cat
                                        ? 'bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/30 dark:to-pink-900/30 text-violet-700 dark:text-violet-300 font-bold'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${style.grad}
                                        flex items-center justify-center text-[10px] flex-shrink-0`}>
                                        {style.icon}
                                    </span>
                                    <span>{cat}</span>
                                </span>
                                <span className="text-xs text-gray-400">{counts[cat] || 0}</span>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CategoryDropdown
