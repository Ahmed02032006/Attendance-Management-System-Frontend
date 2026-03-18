import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../store/Auth-Slicer/Auth-Slicer';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    confirmPassword: '',
    userRole: 'Teacher',
  });

  const [focusedField, setFocusedField] = useState(null);

  // Blue color constant
  const BLUE_COLOR = '#155dfc';

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
        .auth-input.input-error {
          border: 1.5px solid #EF4444 !important;
        }
        .auth-input.input-error:focus {
          border: 1.5px solid #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important;
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
      <div className="mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-1.5">Create Your Account</h2>
        <p className="text-slate-500 text-xs sm:text-xs leading-relaxed">
          Join us and start managing your attendance dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 sm:mb-1.5 ml-0.5">
            Full Name
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{ fontSize: '16px sm:18px', color: getIconColor('userName'), transition: 'color 0.2s ease' }}>
              person
            </span>
            <input
              type="text" id="name" name="userName"
              value={formData.userName} onChange={handleInputChange}
              placeholder="John Doe"
              onFocus={() => setFocusedField('userName')}
              onBlur={() => setFocusedField(null)}
              className="auth-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 sm:mb-1.5 ml-0.5">
            Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{ fontSize: '16px sm:18px', color: getIconColor('userEmail'), transition: 'color 0.2s ease' }}>
              badge
            </span>
            <input
              type="email" id="email" name="userEmail"
              value={formData.userEmail} onChange={handleInputChange}
              placeholder="you@example.com"
              onFocus={() => setFocusedField('userEmail')}
              onBlur={() => setFocusedField(null)}
              className="auth-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 sm:mb-1.5 ml-0.5">
            Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{ fontSize: '16px sm:18px', color: getIconColor('userPassword'), transition: 'color 0.2s ease' }}>
              key
            </span>
            <input
              type="password" id="password" name="userPassword"
              value={formData.userPassword} onChange={handleInputChange}
              placeholder="••••••••"
              onFocus={() => setFocusedField('userPassword')}
              onBlur={() => setFocusedField(null)}
              className="auth-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 sm:mb-1.5 ml-0.5">
            Confirm Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{
                fontSize: '16px sm:18px',
                color: passwordMismatch ? '#EF4444' : getIconColor('confirmPassword'),
                transition: 'color 0.2s ease',
              }}>
              key
            </span>
            <input
              type="password" id="confirmPassword" name="confirmPassword"
              value={formData.confirmPassword} onChange={handleInputChange}
              placeholder="••••••••"
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              className={`auth-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400 ${passwordMismatch ? 'input-error' : ''}`}
            />
          </div>
          {passwordMismatch && (
            <p className="mt-1 text-[10px] sm:text-[11px] font-medium text-red-500 ml-0.5">Passwords do not match</p>
          )}
        </div>

        {/* Terms - Responsive layout */}
        <div className="flex items-start gap-2 pt-0.5">
          <input id="terms" name="terms" type="checkbox"
            className="mt-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded border-slate-300 shrink-0"
            style={{ accentColor: BLUE_COLOR }} />
          <label htmlFor="terms" className="text-[11px] sm:text-xs text-slate-600 leading-snug">
            I agree to the{' '}
            <Link to="/auth/termsAndConditions" className="font-semibold hover:underline" style={{ color: BLUE_COLOR }}>
              terms and conditions
            </Link>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full text-white font-bold py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs sm:text-sm"
          style={{ background: BLUE_COLOR, boxShadow: '0 6px 20px rgba(21,93,252,0.22)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1045c4')}
          onMouseLeave={e => (e.currentTarget.style.background = BLUE_COLOR)}
        >
          Create Account
          <span className="material-icons" style={{ fontSize: '16px sm:18px' }}>person_add</span>
        </button>
      </form>

      {/* Login link */}
      <div className="mt-4 sm:mt-5 text-center text-[11px] sm:text-xs">
        <p className="text-slate-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold hover:underline transition-colors" style={{ color: BLUE_COLOR }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;