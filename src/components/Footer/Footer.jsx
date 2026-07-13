import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
            {/* Gradient top border */}
            <div className="h-px w-full bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500"/>

            {/* Decorative orbs */}
            <div className="orb w-96 h-96 bg-violet-900/20 -bottom-32 -left-20"/>
            <div className="orb w-80 h-80 bg-cyan-900/15 -bottom-20 right-0"/>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/logo.png" alt="Blogify" className="h-10 w-auto"/>
                            <div>
                                <p className="text-xl font-black gradient-text">Blogify</p>
                                <p className="text-[10px] text-gray-600 tracking-widest uppercase">Write • Share • Inspire</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            A place where ideas come to life. Write your story, share your knowledge, and inspire the world.
                        </p>
                        <p className="text-xs text-gray-700">
                            &copy; {new Date().getFullYear()} Blogify. All rights reserved.
                        </p>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Company</h3>
                        <ul className="space-y-3">
                            {['About Us', 'Careers', 'Press Kit', 'Affiliate'].map(item => (
                                <li key={item}>
                                    <Link to="/" className="text-sm text-gray-500 hover:text-violet-400 transition-colors duration-200">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Support</h3>
                        <ul className="space-y-3">
                            {['Help Center', 'Contact Us', 'Guidelines', 'Feedback'].map(item => (
                                <li key={item}>
                                    <Link to="/" className="text-sm text-gray-500 hover:text-violet-400 transition-colors duration-200">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Legal</h3>
                        <ul className="space-y-3">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licensing'].map(item => (
                                <li key={item}>
                                    <Link to="/" className="text-sm text-gray-500 hover:text-violet-400 transition-colors duration-200">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom tagline */}
                <div className="mt-12 pt-6 border-t border-gray-800/60 text-center">
                    <p className="text-xs text-gray-700">
                        Made with ❤️ for writers everywhere •{' '}
                        <span className="gradient-text font-semibold">Blogify</span>
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
