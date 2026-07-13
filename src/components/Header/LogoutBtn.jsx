import React from 'react'
import { useDispatch } from 'react-redux'
import authService from '../../appwrite/auth'
import { logout } from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = () => {
        authService.logout().then(() => dispatch(logout()))
    }
    return (
        <button onClick={logoutHandler}
            className="px-4 py-2 text-sm font-semibold text-red-500
                hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200">
            Logout
        </button>
    )
}

export default LogoutBtn
