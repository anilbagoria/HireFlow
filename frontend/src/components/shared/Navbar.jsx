import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { LogOut, Menu, User2, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import { useState } from 'react'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    const navLinks = user && user.role === 'recruiter'
        ? [
            { label: 'Companies', to: '/admin/companies' },
            { label: 'Jobs', to: '/admin/jobs' },
          ]
        : [
            { label: 'Home', to: '/' },
            { label: 'Jobs', to: '/jobs' },
            { label: 'Browse', to: '/browse' },
          ]

    const userInitials = user?.fullname
        ? user.fullname
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'HF'

    return (
        <div className='sticky top-0 z-50 border-b border-white/10 bg-[#06131f]/80 backdrop-blur-xl'>
            <div className='mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
                <Link to='/' className='flex items-center gap-3 transition-opacity hover:opacity-90'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'>
                        <svg viewBox='0 0 64 64' className='h-8 w-8' aria-hidden='true'>
                            <defs>
                                <linearGradient id='hireflow-mark' x1='0%' y1='0%' x2='100%' y2='100%'>
                                    <stop offset='0%' stopColor='#0ea5e9' />
                                    <stop offset='55%' stopColor='#1d4ed8' />
                                    <stop offset='100%' stopColor='#f97316' />
                                </linearGradient>
                            </defs>
                            <path d='M18 42C10.3 42 4 35.7 4 28S10.3 14 18 14c6.4 0 10.7 3.7 15.1 8.1C37.5 26.5 41.8 30 48 30c7.7 0 14-6.3 14-14S55.7 2 48 2c-6.4 0-10.7 3.7-15.1 8.1C28.5 14.5 24.2 18 18 18c-7.7 0-14 6.3-14 14s6.3 14 14 14c6.2 0 10.5-3.5 14.9-7.9C37.3 34.2 41.6 30 48 30c7.7 0 14 6.3 14 14s-6.3 14-14 14c-6.2 0-10.5-3.5-14.9-7.9C28.7 36.2 24.4 42 18 42Z' fill='none' stroke='url(#hireflow-mark)' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                    </div>
                    <h1 className='text-2xl font-extrabold tracking-tight text-white'>Hire<span className='text-[#f97316]'>Flow</span></h1>
                </Link>

                <button
                    className='inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-100 hover:bg-white/10 md:hidden'
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    aria-label='Toggle navigation menu'
                >
                    {isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
                </button>

                <div className='hidden items-center gap-10 md:flex'>
                    <ul className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-medium text-slate-200 shadow-[0_18px_60px_rgba(0,0,0,0.18)]'>
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    className='inline-flex rounded-full px-4 py-2 transition-colors hover:bg-white/10 hover:text-white'
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline" className='border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white'>Login</Button></Link>
                                <Link to="/signup"><Button className='bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white shadow-[0_12px_30px_rgba(249,115,22,0.35)] hover:from-[#fb923c] hover:to-[#f472b6]'>Signup</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className='h-10 w-10 cursor-pointer ring-2 ring-white/10 ring-offset-2 ring-offset-[#06131f]'>
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                        <AvatarFallback className='bg-gradient-to-br from-cyan-400 to-orange-500 text-sm font-semibold text-white'>{userInitials}</AvatarFallback>
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className='w-80 border-white/10 bg-[#081421] text-slate-100 shadow-[0_18px_80px_rgba(0,0,0,0.45)]'>
                                    <div className=''>
                                        <div className='flex gap-3 space-y-2'>
                                            <Avatar className='h-10 w-10 cursor-pointer'>
                                                <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                                <AvatarFallback className='bg-gradient-to-br from-cyan-400 to-orange-500 text-sm font-semibold text-white'>{userInitials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className='font-medium'>{user?.fullname}</h4>
                                                <p className='text-sm text-slate-400'>{user?.profile?.bio}</p>
                                            </div>
                                        </div>
                                        <div className='my-2 flex flex-col text-slate-300'>
                                            {
                                                user && user.role === 'student' && (
                                                    <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                        <User2 />
                                                        <Button variant='link' className='px-0 text-slate-100'> <Link to="/profile">View Profile</Link></Button>
                                                    </div>
                                                )
                                            }

                                            <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                <LogOut />
                                                <Button onClick={logoutHandler} variant='link' className='px-0 text-slate-100'>Logout</Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )
                    }

                </div>
            </div>

            {isMobileMenuOpen && (
                <div className='border-t border-white/10 bg-[#06131f]/95 px-4 py-4 space-y-4 md:hidden'>
                    <ul className='flex flex-col gap-2 font-medium'>
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className='flex rounded-xl px-3 py-3 text-slate-200 hover:bg-white/8 hover:text-white'
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button variant='outline' className='border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white'>Login</Button></Link>
                                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}><Button className='bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white'>Signup</Button></Link>
                            </div>
                        ) : (
                            <div className='flex items-center justify-between'>
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className='text-sm text-slate-300'>View Profile</Link>
                                <Button onClick={logoutHandler} variant='outline' size='sm' className='border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white'>Logout</Button>
                            </div>
                        )
                    }
                </div>
            )}

        </div>
    )
}

export default Navbar