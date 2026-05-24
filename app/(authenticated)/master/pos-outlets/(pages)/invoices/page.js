import React, { Suspense } from 'react';
import InvoiceListClient from './InvoiceListClient';
export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <InvoiceListClient />
    </Suspense>
  );
};

export default Page;
