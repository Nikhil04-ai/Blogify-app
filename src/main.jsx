import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from './components'

import Home             from './pages/Home.jsx'
import Login            from './pages/Login.jsx'
import Signup           from './pages/Signup.jsx'
import AllPosts         from './pages/AllPosts.jsx'
import AddPost          from './pages/AddPost.jsx'
import EditPost         from './pages/EditPost.jsx'
import Post             from './pages/Post.jsx'
import Analytics        from './pages/Analytics.jsx'
import Profile          from './pages/Profile.jsx'
import Saved            from './pages/Saved.jsx'
import VerifyEmail      from './pages/VerifyEmail.jsx'
import EmailNotVerified from './pages/EmailNotVerified.jsx'
import CheckEmail       from './pages/CheckEmail.jsx'
import ForgotPassword   from './pages/ForgotPassword.jsx'
import ResetPassword    from './pages/ResetPassword.jsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            // ── Public routes ──────────────────────────────────────────────
            { path: '/',
              element: <AuthLayout authentication={false}><Home /></AuthLayout> },
            { path: '/login',
              element: <AuthLayout authentication={false}><Login /></AuthLayout> },
            { path: '/signup',
              element: <AuthLayout authentication={false}><Signup /></AuthLayout> },
            { path: '/post/:slug',
              element: <Post /> },
            { path: '/profile/:userId',
              element: <Profile /> },

            // ── Auth flow pages (no AuthLayout — special handling) ─────────
            { path: '/check-email',       element: <CheckEmail /> },
            { path: '/verify-email',      element: <VerifyEmail /> },
            { path: '/email-not-verified',element: <EmailNotVerified /> },
            { path: '/forgot-password',   element: <ForgotPassword /> },
            { path: '/reset-password',    element: <ResetPassword /> },

            // ── Protected routes (require login + verified email) ──────────
            { path: '/all-posts',
              element: <AuthLayout authentication={true}><AllPosts /></AuthLayout> },
            { path: '/add-post',
              element: <AuthLayout authentication={true}><AddPost /></AuthLayout> },
            { path: '/edit-post/:slug',
              element: <AuthLayout authentication={true}><EditPost /></AuthLayout> },
            { path: '/analytics',
              element: <AuthLayout authentication={true}><Analytics /></AuthLayout> },
            { path: '/profile',
              element: <AuthLayout authentication={true}><Profile /></AuthLayout> },
            { path: '/saved',
              element: <AuthLayout authentication={true}><Saved /></AuthLayout> },
        ],
    },
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>
)
