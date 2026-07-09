import React, { useRef, useState } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const categoryRowRef = useRef(null);

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    const scrollCategories = (direction) => {
        if (!categoryRowRef.current) return;
        const scrollAmount = 280;
        categoryRowRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }

    const categories = [
        "Frontend Developer",
        "Backend Developer",
        "Data Science",
        "Full Stack Developer",
        "UI/UX Designer",
        "Product Manager",
        "DevOps Engineer",
        "Mobile App Developer",
    ]

    return (
        <div className='px-4 sm:px-6 lg:px-8'>
            <section className='relative mx-auto max-w-6xl overflow-hidden px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20'>
                <div className='absolute inset-0 rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.2),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.15),transparent_30%),linear-gradient(180deg,rgba(11,24,36,0.96),rgba(7,19,31,0.92))] shadow-[0_30px_120px_rgba(0,0,0,0.45)]' />
                <div className='absolute inset-0 rounded-[2.5rem] opacity-50 [background-image:radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]' />
                <div className='relative z-10 flex flex-col items-center text-center'>
                    <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.18)]'>
                        <Sparkles className='h-4 w-4 text-[#f97316]' />
                        No. 1 Job Hunt Website
                    </span>

                    <h1 className='mt-6 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl lg:text-7xl'>
                        <span className='block text-slate-200/90'>Search, Apply &</span>
                        <span className='block bg-gradient-to-r from-cyan-300 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent'>Get Your Dream Jobs</span>
                    </h1>

                    <p className='mt-5 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base'>Unlock your full potential with an exclusive selection of hand-picked roles from global industry leaders. Your refined career journey begins here.</p>

                    <div className='mt-8 flex w-full max-w-3xl items-center gap-2 rounded-full border border-white/10 bg-white/6 px-2 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:px-3'>
                        <input
                            type="text"
                            placeholder='Find your dream jobs'
                            onChange={(e) => setQuery(e.target.value)}
                            className='h-12 w-full rounded-full border-0 bg-transparent px-4 text-sm text-white placeholder:text-slate-400 focus:outline-none sm:text-base'

                        />
                        <Button onClick={searchJobHandler} className='h-12 rounded-full bg-gradient-to-r from-[#ff5f6d] to-[#ff8a4c] px-5 text-white shadow-[0_12px_30px_rgba(255,123,96,0.35)] hover:from-[#ff7180] hover:to-[#ff9a65]'>
                            <Search className='h-5 w-5' />
                        </Button>
                    </div>

                    <div className='mt-7 flex w-full max-w-4xl items-center justify-center gap-3 sm:gap-4'>
                        <button
                            type='button'
                            onClick={() => scrollCategories('left')}
                            className='hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-flex'
                            aria-label='Previous category'
                        >
                            <ChevronLeft className='h-4 w-4' />
                        </button>
                        <div ref={categoryRowRef} className='flex flex-1 flex-nowrap gap-3 overflow-x-auto scroll-smooth px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    onClick={() => {
                                        dispatch(setSearchedQuery(category));
                                        navigate('/browse');
                                    }}
                                    variant='outline'
                                    className='h-10 shrink-0 rounded-full border border-white/12 bg-white/5 px-5 text-sm text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:border-[#f97316]/40 hover:bg-white/10 hover:text-white'
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                        <button
                            type='button'
                            onClick={() => scrollCategories('right')}
                            className='hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-flex'
                            aria-label='Next category'
                        >
                            <ChevronRight className='h-4 w-4' />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HeroSection