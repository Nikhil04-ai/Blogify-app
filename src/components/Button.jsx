import React from 'react'

function Button({
    children,
    type    = 'button',
    bgColor = '',          // leave empty → Blogify gradient default
    textColor = 'text-white',
    className = '',
    ...props
}) {
    // If a specific bgColor is passed (e.g. bg-green-500, bg-red-500) use it
    // Otherwise use the Blogify gradient
    const colorClasses = bgColor
        ? `${bgColor} ${textColor}`
        : 'text-white btn-shine'

    const gradientStyle = bgColor ? {} : {
        background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    }

    return (
        <button
            type={type}
            style={gradientStyle}
            className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm
                transition-all duration-200 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:opacity-90 shadow-sm hover:shadow-lg
                ${colorClasses} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
