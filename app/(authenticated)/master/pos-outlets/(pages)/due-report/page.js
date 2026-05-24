import React, { Suspense } from 'react';
import DueReportClient from './DueReportClient';
export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <DueReportClient />
    </Suspense>
  );
};

export default Page;
