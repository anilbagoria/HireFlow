import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setAllAppliedJobs, setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, MapPin, Users, BriefcaseBusiness } from 'lucide-react';

const JobDescription = () => {
    const {singleJob, allAppliedJobs} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const getApplicantId = (application) => application?.applicant?._id || application?.applicant || application?.applicantId;
    const isIntiallyApplied = singleJob?.applications?.some(application => getApplicantId(application) === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {withCredentials:true});
            
            if(res.data.success){
                setIsApplied(true); // Update the local state
                const updatedSingleJob = {...singleJob, applications:[...singleJob.applications,{applicant:user?._id}]}
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    const unapplyJobHandler = async () => {
        try {
            const res = await axios.delete(`${APPLICATION_API_END_POINT}/unapply/${jobId}`, { withCredentials: true });

            if (res.data.success) {
                setIsApplied(false);
                const updatedApplications = singleJob?.applications?.filter((application) => getApplicantId(application) !== user?._id) || [];
                dispatch(setSingleJob({ ...singleJob, applications: updatedApplications }));
                const updatedAppliedJobs = allAppliedJobs.filter((appliedJob) => appliedJob?.job?._id !== jobId);
                dispatch(setAllAppliedJobs(updatedAppliedJobs));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to unapply job.");
        }
    }

    useEffect(()=>{
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => getApplicantId(application) === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob(); 
    },[jobId,dispatch, user?._id]);

    return (
        <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='mb-4 flex items-center justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => navigate(-1)}
                    className='inline-flex items-center gap-2 border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white'
                >
                    <ArrowLeft className='h-4 w-4' />
                    Back
                </Button>
            </div>
            <div className='rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-8'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                        <p className='text-sm uppercase tracking-[0.3em] text-cyan-300/80'>Position Details</p>
                        <h1 className='mt-2 text-3xl font-black tracking-tight text-white'>{singleJob?.title}</h1>
                        <div className='mt-4 flex flex-wrap items-center gap-2'>
                            <Badge className='border border-white/10 bg-white/5 text-cyan-200 font-semibold' variant='ghost'>{singleJob?.position} Positions</Badge>
                            <Badge className='border border-white/10 bg-white/5 text-orange-200 font-semibold' variant='ghost'>{singleJob?.jobType}</Badge>
                            <Badge className='border border-white/10 bg-white/5 text-fuchsia-200 font-semibold' variant='ghost'>{singleJob?.salary}LPA</Badge>
                        </div>
                    </div>
                    <Button
                        onClick={isApplied ? unapplyJobHandler : applyJobHandler}
                        className={`rounded-full px-6 ${isApplied ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' : 'bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white hover:from-[#fb923c] hover:to-[#f472b6]'}`}>
                        {isApplied ? 'Withdraw Application' : 'Apply Now'}
                    </Button>
                </div>

                <div className='mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                    <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200'><div className='flex items-center gap-2 text-sm text-slate-400'><BriefcaseBusiness className='h-4 w-4 text-cyan-300' /> Role</div><p className='mt-2 font-semibold text-white'>{singleJob?.title}</p></div>
                    <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200'><div className='flex items-center gap-2 text-sm text-slate-400'><MapPin className='h-4 w-4 text-cyan-300' /> Location</div><p className='mt-2 font-semibold text-white'>{singleJob?.location}</p></div>
                    <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200'><div className='flex items-center gap-2 text-sm text-slate-400'><Users className='h-4 w-4 text-cyan-300' /> Applicants</div><p className='mt-2 font-semibold text-white'>{singleJob?.applications?.length}</p></div>
                    <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200'><div className='flex items-center gap-2 text-sm text-slate-400'><CalendarDays className='h-4 w-4 text-cyan-300' /> Posted</div><p className='mt-2 font-semibold text-white'>{singleJob?.createdAt.split("T")[0]}</p></div>
                </div>

                <div className='mt-8 space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300'>
                    <h1 className='text-xl font-bold text-white'>Job Description</h1>
                    <p className='leading-7'>{singleJob?.description}</p>
                    <p><span className='font-semibold text-white'>Experience:</span> {singleJob?.experience} yrs</p>
                    <p><span className='font-semibold text-white'>Salary:</span> {singleJob?.salary} LPA</p>
                </div>
            </div>
        </div>
    )
}

export default JobDescription