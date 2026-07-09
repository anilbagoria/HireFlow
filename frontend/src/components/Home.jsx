import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, []);
  return (
    <div className='relative min-h-screen overflow-hidden bg-[#06131f] text-white'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_22%)]' />
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,12,19,0)_0%,rgba(2,12,19,0.24)_45%,rgba(2,12,19,0.72)_100%)]' />
      <div className='relative z-10'>
        <Navbar />
        <main>
          <HeroSection />
          <LatestJobs />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Home