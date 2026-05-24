import React, { Suspense } from 'react';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <ProfileClient />
    </Suspense>
  );
};

export default Page;
