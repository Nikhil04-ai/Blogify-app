import React, { useId } from 'react'

const Input = React.forwardRef(function Input({ label, type = 'text', className = '', ...props }, ref) {
    const id = useId()
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id}
                    className="block mb-1.5 pl-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <input
                id={id} type={type} ref={ref}
                className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800
                    text-gray-800 dark:text-gray-200 text-sm
                    border border-gray-200 dark:border-gray-700 outline-none
                    focus:ring-2 focus:ring-violet-400 focus:border-violet-400
                    dark:focus:ring-violet-600 dark:focus:border-violet-600
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    transition-all duration-200 disabled:opacity-50 ${className}`}
                {...props}
            />
        </div>
    )
})

export default Input
