import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  finnegans: {
    url: process.env.FINNEGANS_URL || 'https://api.finneg.com/api',
    token: process.env.FINNEGANS_TOKEN || '',
  },
};
