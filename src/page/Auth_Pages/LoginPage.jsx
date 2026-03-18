import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../../store/Auth-Slicer/Auth-Slicer';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData))
      .then((res) => {
        if (res.payload?.status === "Success") {
          toast.success("Login successful");
          setTimeout(() => {
          }, 2000);
          setFormData({
            userEmail: '',
            userPassword: ''
          });
        } else if (res.payload?.status === "Error") {
          toast.error(res.payload.message || "Login failed");
        } else if (!res.payload) {
          toast.error("Login failed");
        }
      })
      .catch((err) => {
        toast.error("An unexpected error occurred.");
      });
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Staff Login</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Access the faculty dashboard to manage student attendance, track session metrics, and generate reports.
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="loginEmail"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1"
          >
            Staff ID / Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl select-none">
              badge
            </span>
            <input
              type="email"
              id="loginEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleLoginChange}
              placeholder="you@example.com"
              style={{
                border: '1.5px solid #E2E8F0',
                transition: 'all 0.2s ease-in-out',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#0047AB';
                e.target.style.boxShadow = '0 0 0 4px rgba(0,71,171,0.1)';
                e.target.style.outline = 'none';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-slate-800 bg-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
            <label
              htmlFor="loginPassword"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Security Key
            </label>
            {/* Uncomment to enable forgot password:
            <Link to="/auth/forgotPassword" className="text-xs font-semibold hover:text-blue-800 transition-colors" style={{ color: '#0047AB' }}>
              Reset PIN
            </Link> */}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl select-none">
              key
            </span>
            <input
              type="password"
              id="loginPassword"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleLoginChange}
              placeholder="••••••••"
              style={{
                border: '1.5px solid #E2E8F0',
                transition: 'all 0.2s ease-in-out',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#0047AB';
                e.target.style.boxShadow = '0 0 0 4px rgba(0,71,171,0.1)';
                e.target.style.outline = 'none';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-slate-800 bg-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between py-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 focus:ring-2"
              style={{ accentColor: '#0047AB' }}
            />
            <span className="text-xs font-medium text-slate-600">Keep session active</span>
          </label>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span
              className="w-2 h-2 rounded-full bg-emerald-500"
              style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
            />
            Server Online
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 mt-2 transition-all active:scale-[0.98]"
          style={{
            background: '#0047AB',
            boxShadow: '0 8px 24px rgba(0,71,171,0.22)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#003d96'}
          onMouseLeave={e => e.currentTarget.style.background = '#0047AB'}
        >
          Authorize Access
          <span className="material-icons text-lg">login</span>
        </button>
      </form>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Active Staff</p>
          <p className="text-lg font-bold text-slate-700">1,240+</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">System Uptime</p>
          <p className="text-lg font-bold text-slate-700">99.9%</p>
        </div>
      </div>

      {/* Register link */}
      <div className="mt-8 text-center text-sm">
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