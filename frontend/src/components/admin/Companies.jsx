import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(setSearchCompanyByText(input));
    },[input]);
    return (
        <div className='relative min-h-screen bg-[#06131f] text-white'>
            <Navbar />
            <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
                <div className='mb-6 flex flex-col gap-3 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Input
                        className='w-full border-white/10 bg-white/5 text-white placeholder:text-slate-500 sm:w-auto'
                        placeholder="Filter by name"
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button onClick={() => navigate("/admin/companies/create")} className='w-full bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white sm:w-auto'>New Company</Button>
                </div>
                <CompaniesTable/>
            </div>
        </div>
    )
}

export default Companies