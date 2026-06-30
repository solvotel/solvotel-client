'use client';
import { Footer, Header, Loader } from '@/component/common';
import AccountBlocked from '@/component/common/AccountBlocked';
import { useAuth } from '@/context';
import { GetSingleData, GetSingleUser } from '@/utils/ApiFunctions';
import { Box } from '@mui/material';

const Layout = ({ children }) => {
  const { auth } = useAuth();

  const data = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });

  const user = GetSingleUser({
    endPoint: 'users',
    auth: auth,
    id: auth?.user?.id,
  });

  if (!data || !user) {
    return <Loader />;
  }

  if (data && data?.blocked) {
    return <AccountBlocked />;
  }

  if (data?.blocked || user?.blocked || !user?.confirmed) {
    return <AccountBlocked />;
  }

  return (
    <>
      <Header />
      <Box sx={{ minHeight: '83vh' }}>{children}</Box>
      <Footer />
    </>
  );
};

export default Layout;
