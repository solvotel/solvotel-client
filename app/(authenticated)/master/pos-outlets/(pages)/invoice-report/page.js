import React, { Suspense } from 'react';
import InvoiceReportClient from './InvoiceReportClient';

export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <InvoiceReportClient />
    </Suspense>
  );
};

export default Page;
