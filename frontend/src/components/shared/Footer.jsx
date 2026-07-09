import React from 'react';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='border-t border-white/10 bg-[#06131f]/90 py-6 text-slate-300'>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-lg font-bold text-white'>Hire<span className='text-[#f97316]'>Flow</span></h2>
          <p className='text-sm text-slate-400'>© 2026 HireFlow. All rights reserved.</p>
        </div>

        <div className='flex items-center gap-4 text-sm font-medium'>
          <a href='/' className='transition-colors hover:text-white'>Home</a>
          <a href='/jobs' className='transition-colors hover:text-white'>Jobs</a>
          <a href='/browse' className='transition-colors hover:text-white'>Browse</a>
        </div>

        <div className='flex items-center gap-3'>
          <a href='https://facebook.com' className='rounded-full border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 hover:text-white' aria-label='Facebook'>
            <Facebook className='h-4 w-4' />
          </a>
          <a href='https://instagram.com' className='rounded-full border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 hover:text-white' aria-label='Instagram'>
            <Instagram className='h-4 w-4' />
          </a>
          <a href='https://linkedin.com' className='rounded-full border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 hover:text-white' aria-label='LinkedIn'>
            <Linkedin className='h-4 w-4' />
          </a>
          <a href='https://youtube.com' className='rounded-full border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 hover:text-white' aria-label='YouTube'>
            <Youtube className='h-4 w-4' />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;