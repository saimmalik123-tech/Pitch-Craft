import React from 'react';
import { Link } from 'react-router-dom';

const VerificationPage = ({ email }) => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-md p-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a verification link to <span className="font-semibold">{email}</span>. 
                        Please check your inbox and click the link to verify your account.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Didn't receive the email? Check your spam folder or 
                        <button className="text-indigo-600 hover:text-indigo-500 font-medium ml-1">
                            click here to resend
                        </button>
                    </p>
                    <Link 
                        to="/login" 
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;