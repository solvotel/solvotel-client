import React, { Suspense } from 'react';
import ManageItemsClient from './ManageItemsClient';

export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <Suspense>
      <ManageItemsClient />
    </Suspense>
  );
};

export default Page;
