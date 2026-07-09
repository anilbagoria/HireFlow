import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Bookmark, MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Job = ({job}) => {
    const navigate = useNavigate();
    // const jobId = "lsekdhjgdsnfvsdkjf";
    const [isSaved, setIsSaved] = useState(false);
    const savedJobsStorageKey = 'hireflow_saved_jobs';

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference/(1000*24*60*60));
    }

    useEffect(() => {
        try {
            const savedJobs = JSON.parse(localStorage.getItem(savedJobsStorageKey) || '[]');
            setIsSaved(savedJobs.includes(job?._id));
        } catch (error) {
            setIsSaved(false);
        }
    }, [job?._id]);

    const toggleSaveJob = () => {
        try {
            const savedJobs = JSON.parse(localStorage.getItem(savedJobsStorageKey) || '[]');
            const nextSavedJobs = isSaved
                ? savedJobs.filter((savedJobId) => savedJobId !== job?._id)
                : Array.from(new Set([...savedJobs, job?._id]));

            localStorage.setItem(savedJobsStorageKey, JSON.stringify(nextSavedJobs));
            setIsSaved(!isSaved);
            toast.success(isSaved ? 'Removed from saved jobs' : 'Saved for later');
        } catch (error) {
            toast.error('Could not update saved jobs');
        }
    }
    
    return (
        <div className='rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-slate-400'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                <Button
                    variant='outline'
                    className={`rounded-full border-white/10 ${isSaved ? 'bg-[#f97316]/20 text-[#fdba74]' : 'bg-white/5 text-slate-100'} hover:bg-white/10 hover:text-white`}
                    size='icon'
                    onClick={toggleSaveJob}
                    aria-label={isSaved ? 'Remove saved job' : 'Save job for later'}
                >
                    <Bookmark className='h-4 w-4' />
                </Button>
            </div>

            <div className='flex items-center gap-2 my-2'>
                <Button className='p-6 border-white/10 bg-white/5' variant='outline' size='icon'>
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                        <AvatarFallback className='bg-gradient-to-br from-cyan-400 to-orange-500 text-white'>H</AvatarFallback>
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-medium text-lg text-white'>{job?.company?.name}</h1>
                    <p className='flex items-center gap-1 text-sm text-slate-400'><MapPin className='h-3.5 w-3.5' /> {job?.location}</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2 break-words text-white'>{job?.title}</h1>
                <p className='text-sm text-slate-300 line-clamp-3 break-words'>{job?.description}</p>
            </div>
            <div className='flex flex-wrap items-center gap-2 mt-4'>
                <Badge className='border border-white/10 bg-white/5 text-cyan-200 font-semibold' variant='ghost'>{job?.position} Positions</Badge>
                <Badge className='border border-white/10 bg-white/5 text-orange-200 font-semibold' variant='ghost'>{job?.jobType}</Badge>
                <Badge className='border border-white/10 bg-white/5 text-fuchsia-200 font-semibold' variant='ghost'>{job?.salary}LPA</Badge>
            </div>
            <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-4'>
                <Button onClick={()=> navigate(`/description/${job?._id}`)} variant='outline' className='w-full sm:w-auto border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white'>Details</Button>
                <Button
                    className={`w-full sm:w-auto ${isSaved ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white hover:from-[#fb923c] hover:to-[#f472b6]'}`}
                    onClick={toggleSaveJob}
                >
                    {isSaved ? 'Saved' : 'Save For Later'}
                </Button>
            </div>
        </div>
    )
}

export default Job