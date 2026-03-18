import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../../store/Auth-Slicer/Auth-Slicer';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData))
      .then((res) => {
        if (res.payload?.status === 'Success') {
          toast.success('Login successful');
          setTimeout(() => {}, 2000);
          setFormData({ userEmail: '', userPassword: '' });
        } else if (res.payload?.status === 'Error') {
          toast.error(res.payload.message || 'Login failed');
        } else if (!res.payload) {
          toast.error('Login failed');
        }
      })
      .catch(() => toast.error('An unexpected error occurred.'));
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#0047AB';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,71,171,0.1)';
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = '#E2E8F0';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,71,171,0.1)';
  };

  // Shared input style — border always set inline so Tailwind can't override it
  const inputStyle = {
    border: '1.5px solid #E2E8F0',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Staff Login</h2>
        <p className="text-slate-500 text-xs leading-relaxed">
          Access the faculty dashboard to manage student attendance, track session metrics, and generate reports.
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="loginEmail" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
            Staff ID / Email
          </label>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 select-none"
              style={{ fontSize: '18px' }}
            >
              badge
            </span>
            <input
              type="email"
              id="loginEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleLoginChange}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 bg-white placeholder-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5 ml-0.5">
            <label htmlFor="loginPassword" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Security Key
            </label>
            {/* <Link to="/auth/forgotPassword" style={{ color: '#0047AB' }} className="text-[10px] font-semibold hover:text-blue-800 transition-colors">Reset PIN</Link> */}
          </div>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 select-none"
              style={{ fontSize: '18px' }}
            >
              key
            </span>
            <input
              type="password"
              id="loginPassword"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleLoginChange}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 bg-white placeholder-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Options row */}
        <div className="flex items-center justify-between py-0.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-slate-300"
              style={{ accentColor: '#0047AB' }}
            />
            <span className="text-xs font-medium text-slate-600">Keep session active</span>
          </label>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Server Online
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
          style={{ background: '#0047AB', boxShadow: '0 6px 20px rgba(0,71,171,0.22)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#003d96')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0047AB')}
        >
          Authorize Access
          <span className="material-icons" style={{ fontSize: '18px' }}>login</span>
        </button>
      </form>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Active Staff</p>
          <p className="text-base font-bold text-slate-700">1,240+</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">System Uptime</p>
          <p className="text-base font-bold text-slate-700">99.9%</p>
        </div>
      </div>

      {/* Register link */}
      <div className="mt-5 text-center text-xs">
        <p className="text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="font-semibold hover:underline transition-colors"
            style={{ color: '#0047AB' }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;