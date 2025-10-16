import { BASEURL } from '@/config/MainApi';
import axios from 'axios';

export const UploadImage = async ({ image, token }) => {
  const data = new FormData();
  data.append('files', image);

  const res = await axios.post(`${BASEURL}/upload`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const uploadedImage = await res.data[0];

  return uploadedImage;
};
