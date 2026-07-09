import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { JOB_API_END_POINT } from '@/utils/constant'
import { setAllAdminJobs } from '@/redux/jobSlice'

const AdminJobsTable = () => { 
    const {allAdminJobs, searchJobByText} = useSelector(store=>store.job);

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleDeleteJob = async (jobId) => {
        const shouldDelete = window.confirm('Delete this job?');
        if (!shouldDelete) {
            return;
        }

        try {
            const res = await axios.delete(`${JOB_API_END_POINT}/delete/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                const updatedJobs = allAdminJobs.filter((job) => job._id !== jobId);
                dispatch(setAllAdminJobs(updatedJobs));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete job.');
        }
    }

    useEffect(()=>{ 
        const filteredJobs = allAdminJobs.filter((job)=>{
            if(!searchJobByText){
                return true;
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase());

        });
        setFilterJobs(filteredJobs);
    },[allAdminJobs,searchJobByText])
    return (
        <div className='w-full overflow-x-auto'>
            <Table>
                <TableCaption className='text-slate-400'>A list of your recent posted jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className='text-slate-300'>Company Name</TableHead>
                        <TableHead className='text-slate-300'>Role</TableHead>
                        <TableHead className='text-slate-300'>Date</TableHead>
                        <TableHead className='text-right text-slate-300'>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs?.map((job) => (
                            <TableRow key={job?._id}>
                                <TableCell className='text-slate-100'>{job?.company?.name}</TableCell>
                                <TableCell className='text-slate-100'>{job?.title}</TableCell>
                                <TableCell className='text-slate-300'>{job?.createdAt.split("T")[0]}</TableCell>
                                <TableCell className='cursor-pointer text-right'>
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className='w-32 border-white/10 bg-[#081421] text-slate-100'>
                                            <div onClick={()=> navigate(`/admin/companies/${job._id}`)} className='flex w-fit cursor-pointer items-center gap-2'>
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
                                            </div>
                                            <div onClick={()=> navigate(`/admin/jobs/${job._id}/applicants`)} className='mt-2 flex w-fit cursor-pointer items-center gap-2'>
                                                <Eye className='w-4'/>
                                                <span>Applicants</span>
                                            </div>
                                            <div onClick={() => handleDeleteJob(job._id)} className='mt-2 flex w-fit cursor-pointer items-center gap-2 text-red-400'>
                                                <Trash2 className='w-4' />
                                                <span>Delete</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>

                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable