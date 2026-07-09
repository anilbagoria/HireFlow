import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: ""
    });
    const {loading,user} = useSelector(store=>store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();    //formdata object
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally{
            dispatch(setLoading(false));
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])
    return (
        <div className='relative min-h-screen bg-[#06131f] text-white'>
            <Navbar />
            <div className='mx-auto flex max-w-7xl items-center justify-center px-4 py-10'>
                <form onSubmit={submitHandler} className='w-full max-w-2xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-8'>
                    <h1 className='mb-2 text-3xl font-black tracking-tight'>Sign Up</h1>
                    <p className='mb-6 text-sm text-slate-400'>Create your HireFlow profile.</p>
                    <div className='my-2'>
                        <Label className='text-slate-200'>Full Name</Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            placeholder="patel"
                            className='mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500'
                        />
                    </div>
                    <div className='my-2'>
                        <Label className='text-slate-200'>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="patel@gmail.com"
                            className='mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500'
                        />
                    </div>
                    <div className='my-2'>
                        <Label className='text-slate-200'>Phone Number</Label>
                        <Input
                            type="text"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            placeholder="8080808080"
                            className='mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500'
                        />
                    </div>
                    <div className='my-2'>
                        <Label className='text-slate-200'>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="********"
                            className='mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500'
                        />
                    </div>
                    <div className='flex items-center justify-between'>
                        <RadioGroup className='my-5 flex items-center gap-4'>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="r1" className='text-slate-200'>Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="r2" className='text-slate-200'>Recruiter</Label>
                            </div>
                        </RadioGroup>
                        <div className='flex items-center gap-2'>
                            <Label className='text-slate-200'>Profile</Label>
                            <Input
                                accept="image/*"
                                type="file"
                                onChange={changeFileHandler}
                                className='cursor-pointer border-white/10 bg-white/5 text-white'
                            />
                        </div>
                    </div>
                    {
                        loading ? <Button className='my-4 w-full bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white'> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type='submit' className='my-4 w-full bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white hover:from-[#fb923c] hover:to-[#f472b6]'>Signup</Button>
                    }
                    <span className='text-sm text-slate-400'>Already have an account? <Link to="/login" className='text-cyan-300 hover:text-cyan-200'>Login</Link></span>
                </form>
            </div>
        </div>
    )
}

export default Signup