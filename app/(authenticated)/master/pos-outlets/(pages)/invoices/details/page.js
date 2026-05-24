import React, { Suspense } from 'react';
import InvoiceDetailsClient from './InvoiceDetailsClient';
export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <InvoiceDetailsClient />
    </Suspense>
  );
};

export default Page;
