import React, { Suspense } from 'react';
import CollectionReportClient from './CollectionReportClient';

export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <CollectionReportClient />
    </Suspense>
  );
};

export default Page;
