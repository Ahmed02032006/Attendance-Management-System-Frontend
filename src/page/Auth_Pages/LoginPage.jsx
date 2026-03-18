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

  const [focusedField, setFocusedField] = useState(null);

  // Blue color constant
  const BLUE_COLOR = '#155dfc';

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
          setTimeout(() => { }, 2000);
          setFormData({ userEmail: '', userPassword: '' });
        } else if (res.payload?.status === 'Error') {
          toast.error(res.payload.message || 'Login failed');
        } else if (!res.payload) {
          toast.error('Login failed');
        }
      })
      .catch(() => toast.error('An unexpected error occurred.'));
  };

  const getIconColor = (fieldName) =>
    focusedField === fieldName ? BLUE_COLOR : '#94A3B8';

  return (
    <div className="w-full max-w-md mx-auto">
      <style>{`
        .auth-input {
          border: 1.5px solid #E2E8F0 !important;
          outline: none !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          background-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: none;
          font-size: 14px !important;
        }
        @media (max-width: 640px) {
          .auth-input {
            font-size: 16px !important; /* Prevents zoom on mobile */
            padding-top: 12px !important;
            padding-bottom: 12px !important;
          }
        }
        .auth-input:focus {
          border: 1.5px solid ${BLUE_COLOR} !important;
          box-shadow: 0 0 0 3px rgba(21,93,252,0.1) !important;
        }
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          -webkit-text-fill-color: #1e293b !important;
          border: 1.5px solid #E2E8F0 !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        .auth-input:-webkit-autofill:focus {
          border: 1.5px solid ${BLUE_COLOR} !important;
          box-shadow: 0 0 0 3px rgba(21,93,252,0.1) !important;
        }
      `}</style>

      {/* Heading - Responsive text */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-1.5">Staff Login</h2>
        <p className="text-slate-500 text-xs sm:text-xs leading-relaxed">
          Sign in to manage your attendance dashboard.
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">

        {/* Email */}
        <div>
          <label htmlFor="loginEmail" className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 sm:mb-1.5 ml-0.5">
            Staff ID / Email
          </label>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{
                fontSize: '16px sm:18px',
                color: getIconColor('userEmail'),
                transition: 'color 0.2s ease',
              }}
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
              onFocus={() => setFocusedField('userEmail')}
              onBlur={() => setFocusedField(null)}
              className="auth-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1 sm:mb-1.5 ml-0.5">
            <label htmlFor="loginPassword" className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Security Key
            </label>
          </div>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{
                fontSize: '16px sm:18px',
                color: getIconColor('userPassword'),
                transition: 'color 0.2s ease',
              }}
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
              onFocus={() => setFocusedField('userPassword')}
              onBlur={() => setFocusedField(null)}
              className="auth-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Options row - Responsive layout */}
        <div className="flex flex-row items-start xs:items-center justify-between gap-2 xs:gap-0 py-0.5">
          <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded border-slate-300"
              style={{ accentColor: BLUE_COLOR }}
            />
            <span className="text-[11px] sm:text-xs font-medium text-slate-600">Keep session active</span>
          </label>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Server Online
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full text-white font-bold py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs sm:text-sm"
          style={{ background: BLUE_COLOR, boxShadow: '0 6px 20px rgba(21,93,252,0.22)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1045c4')}
          onMouseLeave={e => (e.currentTarget.style.background = BLUE_COLOR)}
        >
          Authorize Access
          <span className="material-icons" style={{ fontSize: '16px sm:18px' }}>login</span>
        </button>
      </form>

      {/* Stats - Responsive grid */}
      <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mb-0.5">Active Staff</p>
          <p className="text-sm sm:text-base font-bold text-slate-700">1,240+</p>
        </div>
        <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mb-0.5">System Uptime</p>
          <p className="text-sm sm:text-base font-bold text-slate-700">99.9%</p>
        </div>
      </div>

      {/* Register link */}
      <div className="mt-4 sm:mt-5 text-center text-[11px] sm:text-xs">
        <p className="text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="font-semibold hover:underline transition-colors"
            style={{ color: BLUE_COLOR }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;