import React from 'react';
import { Link } from 'react-router-dom';

const ContactSupportPage = () => {
  return (


    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://cdn.pixabay.com/photo/2022/05/24/04/38/study-7217599_1280.jpg')`,
      }}
    >
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-sm border-gray-400 border-[0.5px] p-1 rounded-xl shadow-lg">
        <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-bold text-sky-700 text-center mb-4">Contact Support</h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            We're here to help! If you're facing any issues or have questions, feel free to reach out to us.
          </p>

          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <div>
              <h2 className="font-semibold text-base text-sky-600 mb-1">1. Email Support</h2>
              <p>
                You can email us at <a href="mailto:support@schoolportal.com" className="text-sky-600 underline">support@schoolportal.com</a> with your issue or inquiry. We typically respond within 24 hours.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base text-sky-600 mb-1">2. Help Center</h2>
              <p>
                Visit our <a href="#" className="text-sky-600 underline">Help Center</a> to find answers to frequently asked questions and tutorials on using the platform.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base text-sky-600 mb-1">3. Feedback</h2>
              <p>
                We welcome your feedback! Let us know how we can improve your experience or what features you'd like to see.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/auth/login"
              className="inline-block text-sky-600 hover:underline font-medium text-sm"
            >
              ← Go back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportPage;
