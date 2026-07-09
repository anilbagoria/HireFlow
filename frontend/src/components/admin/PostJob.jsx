import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const companyArray = [];

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: ""
    });
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company)=> company.name.toLowerCase() === value);
        setInput({...input, companyId:selectedCompany._id});
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            setLoading(false);
        }
    }

    return (
        <div className='relative min-h-screen bg-[#06131f] text-white'>
            <Navbar />
            <div className='flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8'>
                <form onSubmit = {submitHandler} className='w-full max-w-4xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-8'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        <div>
                            <Label className='text-slate-200'>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className='my-1 border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className='my-1 border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className='my-1 border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Salary</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className='my-1 border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className='my-1 border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className='my-1 border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Experience Level</Label>
                            <Input
                                type="text"
                                name="experience"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className='my-1 border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>No of Postion</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className='my-1 border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        {companies.length > 0 && (
                            <Select onValueChange={selectChangeHandler}>
                                <SelectTrigger className='w-full border-white/10 bg-white/5 text-white sm:w-[220px]'>
                                    <SelectValue placeholder='Select a Company' />
                                </SelectTrigger>
                                <SelectContent className='border-white/10 bg-[#081421] text-white'>
                                    <SelectGroup>
                                        {companies.map((company) => (
                                            <SelectItem key={company?._id} value={company?.name?.toLowerCase()}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    {
                        loading ? <Button className='my-4 w-full bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white'> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type='submit' className='my-4 w-full bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white'>Post New Job</Button>
                    }
                    {
                        companies.length === 0 && <p className='my-3 text-center text-xs font-bold text-red-300'>*Please register a company first, before posting a jobs</p>
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob