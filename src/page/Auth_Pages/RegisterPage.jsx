import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../store/Auth-Slicer/Auth-Slicer';

const inputBase = {
  border: '1.5px solid #E2E8F0',
  transition: 'all 0.2s ease-in-out',
};
const onFocus = (e) => {
  e.target.style.borderColor = '#0047AB';
  e.target.style.boxShadow = '0 0 0 3px rgba(0,71,171,0.1)';
  e.target.style.outline = 'none';
};
const onBlur = (e) => {
  e.target.style.borderColor = '#E2E8F0';
  e.target.style.boxShadow = 'none';
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    confirmPassword: '',
    userRole: 'Teacher',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.userPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    dispatch(registerUser(formData))
      .then((res) => {
        if (res.payload?.status === 'Success') {
          toast.success('Registration successful! You can now login.');
          setTimeout(() => navigate('/auth/login'), 2000);
          setFormData({ userName: '', userEmail: '', userPassword: '', confirmPassword: '' });
        } else if (res.payload?.status === 'Error') {
          toast.error(res.payload.message || 'Registration failed.');
        }
      })
      .catch(() => toast.error('An unexpected error occurred.'));
  };

  const passwordMismatch = formData.confirmPassword && formData.userPassword !== formData.confirmPassword;

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Create Your Account</h2>
        <p className="text-slate-500 text-xs leading-relaxed">
          Join us and start managing your attendance dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
            Full Name
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 select-none" style={{ fontSize: '18px' }}>person</span>
            <input
              type="text" id="name" name="userName"
              value={formData.userName} onChange={handleInputChange}
              placeholder="John Doe"
              style={inputBase} onFocus={onFocus} onBlur={onBlur}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 bg-white placeholder-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
            Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 select-none" style={{ fontSize: '18px' }}>badge</span>
            <input
              type="email" id="email" name="userEmail"
              value={formData.userEmail} onChange={handleInputChange}
              placeholder="you@example.com"
              style={inputBase} onFocus={onFocus} onBlur={onBlur}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 bg-white placeholder-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
            Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 select-none" style={{ fontSize: '18px' }}>key</span>
            <input
              type="password" id="password" name="userPassword"
              value={formData.userPassword} onChange={handleInputChange}
              placeholder="••••••••"
              style={inputBase} onFocus={onFocus} onBlur={onBlur}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 bg-white placeholder-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
            Confirm Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 select-none" style={{ fontSize: '18px' }}>key</span>
            <input
              type="password" id="confirmPassword" name="confirmPassword"
              value={formData.confirmPassword} onChange={handleInputChange}
              placeholder="••••••••"
              style={{ ...inputBase, ...(passwordMismatch ? { borderColor: '#EF4444' } : {}) }}
              onFocus={onFocus}
              onBlur={(e) => {
                if (passwordMismatch) { e.target.style.borderColor = '#EF4444'; e.target.style.boxShadow = 'none'; }
                else onBlur(e);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 bg-white placeholder-slate-400 text-sm"
            />
          </div>
          {passwordMismatch && (
            <p className="mt-1 text-[11px] font-medium text-red-500 ml-0.5">Passwords do not match</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 pt-0.5">
          <input id="terms" name="terms" type="checkbox"
            className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 flex-shrink-0"
            style={{ accentColor: '#0047AB' }} />
          <label htmlFor="terms" className="text-xs text-slate-600 leading-snug">
            I agree to the{' '}
            <Link to="/auth/termsAndConditions" className="font-semibold hover:underline" style={{ color: '#0047AB' }}>
              terms and conditions
            </Link>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
          style={{ background: '#0047AB', boxShadow: '0 6px 20px rgba(0,71,171,0.22)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#003d96')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0047AB')}
        >
          Create Account
          <span className="material-icons" style={{ fontSize: '18px' }}>person_add</span>
        </button>
      </form>

      {/* Login link */}
      <div className="mt-5 text-center text-xs">
        <p className="text-slate-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold hover:underline transition-colors" style={{ color: '#0047AB' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;