import axios from 'axios';
import { zidConfig } from './zidConfig.js';

export const exchangeZidCodeForTokens = async (code) => {
  try {
    const response = await axios.post(`${zidConfig.authBaseUrl}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: zidConfig.clientId,
      client_secret: zidConfig.clientSecret,
      redirect_uri: zidConfig.redirectUri,
      code
    });

    return response.data; // { access_token, refresh_token, manager_token, expires_in }
  } catch (error) {
    console.error('Zid Token Exchange Error:', error.response?.data || error.message);
    throw new Error('Failed to exchange Zid code for tokens');
  }
};
