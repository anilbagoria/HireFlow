import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';

const shortlistingStatus = ["Accepted", "Rejected"];

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

const openResume = async (url) => {
    const { original, raw } = getResumeUrls(url);
    if (raw !== original) {
        try {
            const response = await fetch(raw, { method: 'HEAD' });
            if (response.ok) {
                window.open(raw, '_blank', 'noopener');
                return;
            }
        } catch (error) {
            // ignore and fall back to original
        }
    }
    window.open(original, '_blank', 'noopener');
};

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);

    const statusHandler = async (status, id) => {
        console.log('called');
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className='w-full overflow-x-auto'>
            <Table>
                <TableCaption className='text-slate-400'>A list of your recent applied users</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className='text-slate-300'>FullName</TableHead>
                        <TableHead className='text-slate-300'>Email</TableHead>
                        <TableHead className='text-slate-300'>Contact</TableHead>
                        <TableHead className='text-slate-300'>Resume</TableHead>
                        <TableHead className='text-slate-300'>Date</TableHead>
                        <TableHead className='text-right text-slate-300'>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => (
                            <tr key={item._id}>
                                <TableCell className='text-slate-100'>{item?.applicant?.fullname}</TableCell>
                                <TableCell className='text-slate-300'>{item?.applicant?.email}</TableCell>
                                <TableCell className='text-slate-300'>{item?.applicant?.phoneNumber}</TableCell>
                                <TableCell >
                                    {
                                        item.applicant?.profile?.resume ? (
                                            <a
                                                href={getResumeUrls(item?.applicant?.profile?.resume).raw}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='cursor-pointer text-cyan-300 hover:underline'
                                            >
                                                {item?.applicant?.profile?.resumeOriginalName}
                                            </a>
                                        ) : (
                                            <span className='text-slate-400'>NA</span>
                                        )
                                    }
                                </TableCell>
                                <TableCell className='text-slate-300'>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                                <TableCell className='cursor-pointer text-right'>
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal />
                                        </PopoverTrigger>
                                        <PopoverContent className='w-32 border-white/10 bg-[#081421] text-slate-100'>
                                            {
                                                shortlistingStatus.map((status, index) => {
                                                    return (
                                                        <div onClick={() => statusHandler(status, item?._id)} key={index} className='my-2 flex w-fit cursor-pointer items-center'>
                                                            <span>{status}</span>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </PopoverContent>
                                    </Popover>

                                </TableCell>

                            </tr>
                        ))
                    }

                </TableBody>

            </Table>
        </div>
    )
}

export default ApplicantsTable