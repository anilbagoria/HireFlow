import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState(companies);
    const navigate = useNavigate();
    useEffect(()=>{
        const filteredCompany = companies.length >= 0 && companies.filter((company)=>{
            if(!searchCompanyByText){
                return true
            };
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());

        });
        setFilterCompany(filteredCompany);
    },[companies,searchCompanyByText])
    return (
        <div className='w-full overflow-x-auto'>
            <Table>
                <TableCaption className='text-slate-400'>A list of your recent registered companies</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className='text-slate-300'>Logo</TableHead>
                        <TableHead className='text-slate-300'>Name</TableHead>
                        <TableHead className='text-slate-300'>Date</TableHead>
                        <TableHead className='text-right text-slate-300'>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterCompany?.map((company) => (
                            <TableRow key={company?._id}>
                                <TableCell>
                                    <Avatar className='border border-white/10 bg-white/5'>
                                        <AvatarImage src={company.logo}/>
                                    </Avatar>
                                </TableCell>
                                <TableCell className='text-slate-100'>{company.name}</TableCell>
                                <TableCell className='text-slate-300'>{company.createdAt.split("T")[0]}</TableCell>
                                <TableCell className='cursor-pointer text-right'>
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className='w-32 border-white/10 bg-[#081421] text-slate-100'>
                                            <div onClick={()=> navigate(`/admin/companies/${company._id}`)} className='flex w-fit cursor-pointer items-center gap-2'>
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
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

export default CompaniesTable