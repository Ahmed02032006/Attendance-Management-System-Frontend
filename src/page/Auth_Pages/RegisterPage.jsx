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
    focusedField === fieldName ? '#155dfc' : '#94A3B8';

  return (
    <div className="w-full">

      {/* Global styles — !important ensures no Tailwind or autofill override */}
      <style>{`
        .auth-input {
          border: 1.5px solid #E2E8F0 !important;
          outline: none !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          background-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: none;
        }
        .auth-input:focus {
          border: 1.5px solid #155dfc !important;
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
          border: 1.5px solid #155dfc !important;
          box-shadow: 0 0 0 3px rgba(21,93,252,0.1) !important;
        }
      `}</style>

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
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{ fontSize: '18px', color: getIconColor('userName'), transition: 'color 0.2s ease' }}>
              person
            </span>
            <input
              type="text" id="name" name="userName"
              value={formData.userName} onChange={handleInputChange}
              placeholder="John Doe"
              onFocus={() => setFocusedField('userName')}
              onBlur={() => setFocusedField(null)}
              className="auth-input w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
            Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{ fontSize: '18px', color: getIconColor('userEmail'), transition: 'color 0.2s ease' }}>
              badge
            </span>
            <input
              type="email" id="email" name="userEmail"
              value={formData.userEmail} onChange={handleInputChange}
              placeholder="you@example.com"
              onFocus={() => setFocusedField('userEmail')}
              onBlur={() => setFocusedField(null)}
              className="auth-input w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
            Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{ fontSize: '18px', color: getIconColor('userPassword'), transition: 'color 0.2s ease' }}>
              key
            </span>
            <input
              type="password" id="password" name="userPassword"
              value={formData.userPassword} onChange={handleInputChange}
              placeholder="••••••••"
              onFocus={() => setFocusedField('userPassword')}
              onBlur={() => setFocusedField(null)}
              className="auth-input w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
            Confirm Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 select-none"
              style={{
                fontSize: '18px',
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
              className={`auth-input w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 text-sm placeholder-slate-400 ${passwordMismatch ? 'input-error' : ''}`}
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
            style={{ accentColor: '#155dfc' }} />
          <label htmlFor="terms" className="text-xs text-slate-600 leading-snug">
            I agree to the{' '}
            <Link to="/auth/termsAndConditions" className="font-semibold hover:underline" style={{ color: '#155dfc' }}>
              terms and conditions
            </Link>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
          style={{ background: '#155dfc', boxShadow: '0 6px 20px rgba(21,93,252,0.22)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1045c4')}
          onMouseLeave={e => (e.currentTarget.style.background = '#155dfc')}
        >
          Create Account
          <span className="material-icons" style={{ fontSize: '18px' }}>person_add</span>
        </button>
      </form>

      {/* Login link */}
      <div className="mt-5 text-center text-xs">
        <p className="text-slate-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold hover:underline transition-colors" style={{ color: '#155dfc' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;