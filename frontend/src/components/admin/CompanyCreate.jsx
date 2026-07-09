import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    const registerNewCompany = async () => {
        try {
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName}, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res?.data?.success){
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='relative min-h-screen bg-[#06131f] text-white'>
            <Navbar />
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
                <div className='rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)]'>
                <div className='my-10'>
                    <h1 className='text-3xl font-black tracking-tight'>Your Company Name</h1>
                    <p className='text-slate-400'>What would you like to give your company name? you can change this later.</p>
                </div>

                <Label className='text-slate-200'>Company Name</Label>
                <Input
                    type="text"
                    className='my-2 border-white/10 bg-white/5 text-white placeholder:text-slate-500'
                    placeholder="JobHunt, Microsoft etc."
                    onChange={(e) => setCompanyName(e.target.value)}
                />
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 my-10'>
                    <Button variant='outline' onClick={() => navigate("/admin/companies")} className='w-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white sm:w-auto'>Cancel</Button>
                    <Button onClick={registerNewCompany} className='w-full bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white sm:w-auto'>Continue</Button>
                </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyCreate