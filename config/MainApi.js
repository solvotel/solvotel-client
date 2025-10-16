import axios from "axios";

export const BASEURL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const fetcher = async (url) => {
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
    });

    const result = await res.data.data;
    return result;
  } catch (error) {
    console.log(`Fetcher Error: ${error}`);
  }
};
