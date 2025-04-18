'use client';

import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">SSO Server</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">Single Sign-On Authentication Server</p>
          <p className="mt-6 text-lg leading-8 text-gray-600 mx-auto max-w-2xl">A secure and scalable authentication solution for your applications.</p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative flex flex-col items-center text-center bg-white rounded-xl p-8 shadow-sm ring-1 ring-gray-200">
              <dt className="order-2 mt-4 text-base font-semibold leading-7 text-gray-900">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-600">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                  </svg>
                </div>
                Application Management
              </dt>
              <dd className="order-3 mt-4 text-base leading-7 text-gray-600">
                Easily register and manage client applications that integrate with your SSO server.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}