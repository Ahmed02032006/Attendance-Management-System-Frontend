import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditionsPage = () => {
  return (
      <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-bold text-sky-700 text-center mb-4">Terms & Conditions</h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Please read these terms carefully before using the School Management System.
        </p>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          {/* Term 1 */}
          <div>
            <h2 className="font-semibold text-base text-sky-600 mb-1">1. Data Privacy</h2>
            <p>
              We collect and use your data strictly for educational and administrative purposes. We do not share your personal
              data with third parties without your consent, except when legally required.
            </p>
          </div>

          {/* Term 2 */}
          <div>
            <h2 className="font-semibold text-base text-sky-600 mb-1">2. Account Security</h2>
            <p>
              You are responsible for keeping your login credentials secure. Any activity performed under your account is your
              responsibility. Report unauthorized access immediately to your school administrator.
            </p>
          </div>

          {/* Term 3 */}
          <div>
            <h2 className="font-semibold text-base text-sky-600 mb-1">3. Acceptable Use</h2>
            <p>
              Users must not misuse the system by attempting to hack, disrupt services, or access restricted areas. Misuse may
              result in account suspension or permanent removal from the platform.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/auth/register"
            className="inline-block text-sky-600 hover:underline font-medium text-sm"
          >
            ← Go back to Registration
          </Link>
        </div>
      </div>
  );
};

export default TermsAndConditionsPage;
