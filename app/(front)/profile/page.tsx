'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import ProfileTabs from './ProfileTabs';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || !session) {
      router.push('/signin?callbackUrl=/profile');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading your profile...</span>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Redirecting to sign in...</span>
      </div>
    );
  }

  return (
    <div>
      <ProfileTabs />
    </div>
  );
};

export default ProfilePage;
