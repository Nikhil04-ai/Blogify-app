import React from 'react'
import { Link } from 'react-router-dom'

function Logo({ width = '44px', linkTo = null }) {
    const img = (
        <img
            src="/logo.png"
            alt="Blogify"
            style={{ height: width, width: 'auto' }}
            className="object-contain"
        />
    )
    if (linkTo) {
        return <Link to={linkTo}>{img}</Link>
    }
    return img
}

export default Logo
