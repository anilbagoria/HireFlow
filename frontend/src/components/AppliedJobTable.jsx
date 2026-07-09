import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import { Button } from './ui/button'
import axios from 'axios'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { useDispatch } from 'react-redux'
import { setAllAppliedJobs } from '@/redux/jobSlice'
import { toast } from 'sonner'

const AppliedJobTable = () => {
    const {allAppliedJobs} = useSelector(store=>store.job);
    const dispatch = useDispatch();

    const unapplyJobHandler = async (jobId) => {
        try {
            const res = await axios.delete(`${APPLICATION_API_END_POINT}/unapply/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                const updatedAppliedJobs = allAppliedJobs.filter((appliedJob) => appliedJob?.job?._id !== jobId);
                dispatch(setAllAppliedJobs(updatedAppliedJobs));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to unapply job.');
        }
    }
    return (
        <div className='w-full overflow-x-auto'>
            <Table>
                <TableCaption className='text-slate-400'>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className='text-slate-300'>Date</TableHead>
                        <TableHead className='text-slate-300'>Job Role</TableHead>
                        <TableHead className='text-slate-300'>Company</TableHead>
                        <TableHead className='text-slate-300'>Action</TableHead>
                        <TableHead className='text-right text-slate-300'>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? <span className='text-slate-400'>You haven't applied any job yet.</span> : allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell className='text-slate-300'>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell className='text-slate-100'>{appliedJob.job?.title}</TableCell>
                                <TableCell className='text-slate-300'>{appliedJob.job?.company?.name}</TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => unapplyJobHandler(appliedJob?.job?._id)}
                                        variant='outline'
                                        size='sm'
                                        className='border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white'
                                    >
                                        Unapply
                                    </Button>
                                </TableCell>
                                <TableCell className='text-right'><Badge className={`${appliedJob?.status === 'rejected' ? 'border border-red-400/30 bg-red-500/20 text-red-200' : appliedJob.status === 'pending' ? 'border border-amber-400/30 bg-amber-500/20 text-amber-200' : 'border border-emerald-400/30 bg-emerald-500/20 text-emerald-200'}`}>{appliedJob.status.toUpperCase()}</Badge></TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable