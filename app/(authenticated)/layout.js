'use client';
import { Footer, Header, Loader } from '@/component/common';
import AccountBlocked from '@/component/common/AccountBlocked';
import { useAuth } from '@/context';
import { GetSingleData, GetSingleUser } from '@/utils/ApiFunctions';
import {
  evaluateSubscriptionAccess,
  formatSubscriptionDate,
} from '@/utils/SubscriptionAccess';
import { Alert, Box } from '@mui/material';
import { BASEURL, fetcher } from '@/config/MainApi';
import useSWR from 'swr';
import { GetCustomDate } from '@/utils/DateFetcher';

const Layout = ({ children }) => {
  const { auth } = useAuth();
  const isPosUser = auth?.user?.role?.name === 'pos-user';
  const entityId = isPosUser ? auth?.user?.pos_outlet_id : auth?.user?.hotel_id;
  const entityType = isPosUser ? 'POS outlet' : 'hotel';
  const entityEndpoint = isPosUser ? 'pos-outlets' : 'hotels';

  const data = GetSingleData({
    endPoint: entityEndpoint,
    auth: auth,
    id: entityId,
  });

  const user = GetSingleUser({
    endPoint: 'users',
    auth: auth,
    id: auth?.user?.id,
  });

  const relationId = data?.documentId || data?.id;
  const relationField = isPosUser ? 'pos_outlet' : 'hotel';
  const subscriptionEndpoint = isPosUser
    ? 'pos-subscriptions'
    : 'hotel-subscriptions';
  const subscriptionsUrl = relationId
    ? `${BASEURL}/${subscriptionEndpoint}?filters[${relationField}][${data?.documentId ? 'documentId' : 'id'}][$eq]=${encodeURIComponent(relationId)}&sort=expiry_date:DESC&pagination[pageSize]=100`
    : null;
  const { data: subscriptions } = useSWR(subscriptionsUrl, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 500,
  });

  if (!data || !user || !subscriptions) {
    return <Loader />;
  }

  if (data?.blocked || user?.blocked || !user?.confirmed) {
    return <AccountBlocked />;
  }

  const subscriptionAccess = evaluateSubscriptionAccess(subscriptions);
  if (!subscriptionAccess.active) {
    return (
      <AccountBlocked
        subscriptionAccess={subscriptionAccess}
        entityType={entityType}
      />
    );
  }

  return (
    <>
      <Header />
      {subscriptionAccess.daysUntilExpiry <= 7 && (
        <Alert severity="warning" sx={{ borderRadius: 0 }}>
          Your {entityType} subscription expires on{' '}
          {GetCustomDate(subscriptionAccess.subscription.expiry_date)}. Renew
          your plan before then to avoid losing access.
        </Alert>
      )}
      <Box sx={{ minHeight: '83vh' }}>{children}</Box>
      <Footer />
    </>
  );
};

export default Layout;
