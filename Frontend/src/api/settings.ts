import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface Profile {
  institution_name: string;
  logo_url: string | null;
}

export const getProfile = async (): Promise<Profile> => {
  const response = await axios.get(`${API_URL}/get-profile`);
  return response.data;
};

export const setProfile = async (formData: FormData): Promise<void> => {
  await axios.post(`${API_URL}/set-profile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}; 