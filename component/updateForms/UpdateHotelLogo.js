import { Box, Button, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { UploadImage } from '@/utils/UploadImage';
import CreateIcon from '@mui/icons-material/Create';
import { useState } from 'react';
import styled from '@emotion/styled';
import { UpdateData } from '@/utils/ApiFunctions';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';

const ImageContainer = styled(Box)`
  width: 300px;
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageBorder = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
`;

const EditIconWrapper = styled(Box)`
  border: 2px solid #fff;
  width: 40px;
  height: 40px;
  background: #29abe2;
  border-radius: 50%;
  position: absolute;
  bottom: 30px;
  right: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  & > label {
    cursor: pointer;
    & > svg {
      color: #fff;
      font-size: 21px;
    }
  }
`;

const UpdateHotelLogo = ({ data, auth }) => {
  const [loading, setLoading] = useState(false);
  //   handle image change
  const [upload, setUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    data?.hotel_logo?.url || null
  );
  const [profileImage, setProfileImage] = useState();

  const imageHandler = (e) => {
    const selected = e.target.files[0];
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
    const MAX_FILE_SIZE_MB = 2; // Maximum file size in MB
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (selected) {
      // Check for file type
      if (!ALLOWED_TYPES.includes(selected.type)) {
        console.log('not allowed');
        ErrorToast('Only PNG, JPEG, or JPG formats are allowed.');
        setUpload(false);
        return;
      }

      // Check for file size
      if (selected.size > MAX_FILE_SIZE_BYTES) {
        ErrorToast(`Image size should not exceed ${MAX_FILE_SIZE_MB} MB.`);
        setUpload(false);
        return;
      }

      // Create a preview of the selected image
      let reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileImage(selected);
        setUpload(true);
      };
      reader.readAsDataURL(selected);
    } else {
      ErrorToast('No file selected.');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const uploadedImage = await UploadImage({
        image: profileImage,
        token: auth.token,
      });

      const { documentId: _docId, ...imageWithoutDocId } = uploadedImage;

      await UpdateData({
        auth,
        endPoint: 'hotels',
        id: auth?.user?.hotel_id,
        payload: {
          data: {
            hotel_logo: imageWithoutDocId,
          },
        },
      });
      SuccessToast('Banner Updated successfully');
      setLoading(false);
    } catch (err) {
      console.log(`error updating hotel banner: ${err}`);
      setLoading(false);
      ErrorToast('Something went wrong');
    }
  };
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%' }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 2,
            borderRadius: 4,
            width: '100%',
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Hotel Logo</Typography>
          <ImageContainer>
            <ImageBorder>
              <Image
                src={
                  previewImage ||
                  'https://res.cloudinary.com/deyxdpnom/image/upload/v1760012402/demo_hpzblb.png'
                }
                height="300"
                width="300"
                alt="logo"
              />
            </ImageBorder>
            <EditIconWrapper>
              <label htmlFor="profile-pic">
                <CreateIcon />
              </label>
              <input
                id="profile-pic"
                type="file"
                hidden
                onChange={imageHandler}
              />
            </EditIconWrapper>
          </ImageContainer>
          <Button
            sx={{ mt: 2 }}
            onClick={handleSave}
            variant="contained"
            disabled={loading || !upload}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Paper>
      </motion.div>
    </>
  );
};

export default UpdateHotelLogo;
