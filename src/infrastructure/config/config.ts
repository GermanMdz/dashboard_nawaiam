import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  finnegans: {
    url: process.env.FINNEGANS_URL || 'https://api.finneg.com/api',
    clientId: process.env.FINNEGANS_CLIENT_ID || '',
    clientSecret: process.env.FINNEGANS_CLIENT_SECRET || '',
  },
};

if (!process.env.FINNEGANS_CLIENT_ID || !process.env.FINNEGANS_CLIENT_SECRET) {
  console.warn('⚠️  ADVERTENCIA: FINNEGANS_CLIENT_ID o FINNEGANS_CLIENT_SECRET no están configurados');
  console.warn('   El token no podrá obtenerse automáticamente');
}