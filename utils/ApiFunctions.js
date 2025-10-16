import { BASEURL } from '@/config/MainApi';
import useSWR from 'swr';
import axios from 'axios';

// fetch data list
export const GetDataList = ({ auth, endPoint }) => {
  const apiUrl = `${BASEURL}/${endPoint}?sort=createdAt:DESC&filters[$and][0][hotel_id][$eq]=${auth?.user?.hotel_id}&populate=*`;

  const { data } = useSWR(
    apiUrl,
    async (url) => {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return res.data.data;
    },
    {
      refreshInterval: 500,
      revalidateOnFocus: true,
    }
  );
  return data;
};

// get single data
export const GetSingleData = ({ auth, endPoint, id }) => {
  const { data } = useSWR(
    `${BASEURL}/${endPoint}/${id}?populate=*`,
    async (url) => {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const result = await res.data.data;
      return result;
    },
    {
      refreshInterval: 500,
      revalidateOnFocus: true,
    }
  );
  return data;
};

// create new data
export const CreateNewData = async ({ auth, endPoint, payload }) => {
  const res = await axios.post(`${BASEURL}/${endPoint}`, payload, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  return res;
};

// create update data
export const UpdateData = async ({ auth, endPoint, id, payload }) => {
  const res = await axios.put(`${BASEURL}/${endPoint}/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  return res;
};

// delete data
export const DeleteData = async ({ auth, endPoint, id }) => {
  const res = await axios.delete(`${BASEURL}/${endPoint}/${id}`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  return res;
};

export const GetUserList = ({ auth }) => {
  const apiUrl = `${BASEURL}/users?populate=*`;

  const { data } = useSWR(
    apiUrl,
    async (url) => {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return res.data;
    },
    {
      refreshInterval: 500,
      revalidateOnFocus: true,
    }
  );
  const filteredData = data?.filter((item) => {
    return item?.hotel_id === auth?.user?.hotel_id;
  });
  return filteredData;
};
