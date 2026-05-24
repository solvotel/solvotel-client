import React, { Suspense } from 'react';
import PaymentMethodsClient from './PaymentMethodsClient';

export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <PaymentMethodsClient />
    </Suspense>
  );
};

export default Page;
