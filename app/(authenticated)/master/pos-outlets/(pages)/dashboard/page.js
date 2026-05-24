import React, { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <DashboardClient />
    </Suspense>
  );
};

export default Page;
