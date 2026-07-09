import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux'; 

// const randomJobs = [1, 2, 3, 4, 5, 6, 7, 8];

const LatestJobs = () => {
    const {allJobs} = useSelector(store=>store.job);
   
    return (
        <section className='mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8 sm:pb-20'>
            <div className='mb-6 flex items-end justify-between gap-4'>
                <div>
                    <p className='text-sm font-medium uppercase tracking-[0.3em] text-cyan-300/80'>Latest & Top</p>
                    <h1 className='mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl'>Job Openings</h1>
                </div>
                <div className='hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:block'>Curated for the next role you want</div>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                {
                    allJobs.length <= 0 ? <span className='text-slate-400'>No Job Available</span> : allJobs?.slice(0,6).map((job) => <LatestJobCards key={job._id} job={job}/>)
                }
            </div>
        </section>
    )
}

export default LatestJobs