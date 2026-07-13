import React, { useId } from 'react'

function Select({ options, label, className = '', ...props }, ref) {
    const id = useId()
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block mb-1.5 pl-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <select id={id} ref={ref}
                className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800
                    text-gray-800 dark:text-gray-200 text-sm cursor-pointer
                    border border-gray-200 dark:border-gray-700 outline-none
                    focus:ring-2 focus:ring-violet-400 focus:border-violet-400
                    transition-all duration-200 ${className}`}
                {...props}>
                {options?.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    )
}
export default React.forwardRef(Select)
