import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ArrowRight, CalendarDays, MapPin, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    const companyInitial = job?.company?.name ? job.company.name[0].toUpperCase() : 'H'

    return (
        <div
            onClick={() => navigate(`/description/${job._id}`)}
            className='group cursor-pointer rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(9,26,38,0.95),rgba(6,20,31,0.95))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#f97316]/30 hover:shadow-[0_28px_90px_rgba(8,145,178,0.15)]'
        >
            <div className='flex items-start justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <Avatar className='h-11 w-11 border border-white/10 bg-white/5'>
                        <AvatarImage src={job?.company?.logo} alt={job?.company?.name} />
                        <AvatarFallback className='bg-gradient-to-br from-cyan-400 to-orange-500 text-sm font-semibold text-white'>
                            {companyInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className='break-words font-semibold text-white'>{job?.company?.name}</h1>
                        <p className='text-sm text-slate-400'>Global</p>
                    </div>
                </div>
                <button
                    className='rounded-full border border-white/10 bg-white/5 p-2 text-[#f59e0b] transition hover:bg-white/10 hover:text-[#fbbf24]'
                    aria-label='Save job'
                >
                    <Star className='h-4 w-4' />
                </button>
            </div>

            <div>
                <h1 className='mt-4 break-words text-xl font-bold tracking-tight text-white'>{job?.title}</h1>
                <p className='mt-2 line-clamp-2 break-words text-sm leading-6 text-slate-300'>{job?.description}</p>
            </div>

            <div className='mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300'>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2'>
                    <MapPin className='h-4 w-4 text-cyan-300' />
                    {job?.location}
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2'>
                    <span className='text-cyan-300'>₹</span>
                    {job?.salary} LPA
                </span>
            </div>

            <div className='mt-5 flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2 text-sm text-slate-400'>
                    <CalendarDays className='h-4 w-4' />
                    <span>{daysAgoFunction(job?.createdAt) === 0 ? 'Today' : `${daysAgoFunction(job?.createdAt)} days ago`}</span>
                </div>
                <button className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff5f6d] to-[#ff8a4c] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,123,96,0.28)] transition hover:from-[#ff7180] hover:to-[#ff9a65]'>
                    Apply Now
                    <ArrowRight className='h-4 w-4' />
                </button>
            </div>
        </div>
    )
}

export default LatestJobCards