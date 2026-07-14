import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/components/hooks/useGetAppliedJobs'

// const skills = ["Html", "Css", "Javascript", "Reactjs"]
const isResume = (user) => Boolean(user?.profile?.resume);
const getResumeUrls = (url) => {
    if (!url) return { original: url, raw: url };
    const trimmed = url.trim();
    if (trimmed.endsWith('.pdf') && trimmed.includes('/image/upload/')) {
        return {
            original: trimmed,
            raw: trimmed.replace('/image/upload/', '/raw/upload/')
        };
    }
    return { original: trimmed, raw: trimmed };
};

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const {user} = useSelector(store=>store.auth);

    return (
        <div className='relative min-h-screen bg-[#06131f] text-white'>
            <Navbar />
            <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-8'>
                <div className='flex flex-col sm:flex-row sm:justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <Avatar className='h-24 w-24 border border-white/10'>
                            <AvatarImage src={user?.profile?.profilePhoto} alt='profile' />
                            <AvatarFallback className='bg-gradient-to-br from-cyan-400 to-orange-500 text-lg font-semibold text-white'>HF</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className='font-medium text-2xl text-white'>{user?.fullname}</h1>
                            <p className='text-slate-400'>{user?.profile?.bio}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)} className='text-right border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white' variant='outline'><Pen /></Button>
                </div>
                <div className='my-5'>
                    <div className='flex items-center gap-3 my-2'>
                        <Mail className='text-cyan-300' />
                        <span className='text-slate-200'>{user?.email}</span>
                    </div>
                    <div className='flex items-center gap-3 my-2'>
                        <Contact className='text-cyan-300' />
                        <span className='text-slate-200'>{user?.phoneNumber}</span>
                    </div>
                </div>
                <div className='my-5'>
                    <h1 className='font-semibold text-white'>Skills</h1>
                    <div className='flex flex-wrap items-center gap-1'>
                        {
                            user?.profile?.skills.length !== 0 ? user?.profile?.skills.map((item, index) => <Badge key={index} className='border border-white/10 bg-white/5 text-cyan-200'>{item}</Badge>) : <span className='text-slate-400'>NA</span>
                        }
                    </div>
                </div>
                <div className='grid w-full max-w-sm items-center gap-1.5'>
                    <Label className='text-md font-bold text-white'>Resume</Label>
                    {
                        isResume(user) ? (
                            <a
                                href={getResumeUrls(user?.profile?.resume).raw}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='w-full text-left text-cyan-300 hover:underline'
                            >
                                {user?.profile?.resumeOriginalName}
                            </a>
                        ) : (
                            <span className='text-slate-400'>NA</span>
                        )
                    }
                </div>
            </div>
            </div>
            <div className='mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8'>
            <div className='rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.35)]'>
                <h1 className='my-5 text-lg font-bold text-white'>Applied Jobs</h1>
                {/* Applied Job Table   */}
                <AppliedJobTable />
            </div>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen}/>
        </div>
    )
}

export default Profile