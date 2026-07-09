import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });
    const {singleCompany} = useSelector(store=>store.company);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setInput({
            name: singleCompany.name || "",
            description: singleCompany.description || "",
            website: singleCompany.website || "",
            location: singleCompany.location || "",
            file: singleCompany.file || null
        })
    },[singleCompany]);

    return (
        <div className='relative min-h-screen bg-[#06131f] text-white'>
            <Navbar />
            <div className='mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8'>
                <form onSubmit={submitHandler} className='rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)]'>
                    <div className='flex items-center gap-3 py-4 sm:gap-5 sm:p-8'>
                        <Button onClick={() => navigate("/admin/companies")} variant='outline' className='flex items-center gap-2 border-white/10 bg-white/5 font-semibold text-slate-100 hover:bg-white/10 hover:text-white'>
                            <ArrowLeft />
                            <span>Back</span>
                        </Button>
                        <h1 className='text-xl font-black'>Company Setup</h1>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                            <Label className='text-slate-200'>Company Name</Label>
                            <Input
                                type="text"
                                name="name"
                                value={input.name}
                                onChange={changeEventHandler}
                                className='border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className='border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Website</Label>
                            <Input
                                type="text"
                                name="website"
                                value={input.website}
                                onChange={changeEventHandler}
                                className='border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className='border-white/10 bg-white/5 text-white'
                            />
                        </div>
                        <div>
                            <Label className='text-slate-200'>Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={changeFileHandler}
                                className='border-white/10 bg-white/5 text-white'
                            />
                        </div>
                    </div>
                    {
                        loading ? <Button className='my-4 w-full bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white'> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type='submit' className='my-4 w-full bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white'>Update</Button>
                    }
                </form>
            </div>

        </div>
    )
}

export default CompanySetup