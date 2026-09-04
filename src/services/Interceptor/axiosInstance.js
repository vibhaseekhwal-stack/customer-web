import axios from 'axios';

const API_BASE_URL =
  'https://2np24kf8-3000.inc1.devtunnels.ms';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem(
      'grocery_customer_session'
    );

    if (session) {
      try {
        const parsedSession = JSON.parse(session);

        const token = parsedSession?.accessToken;

        if (
          token &&
          token !== 'undefined' &&
          token !== 'null'
        ) {
          config.headers.Authorization =
            `Bearer ${token}`;
        }
      } catch (error) {
        console.error(
          'Invalid session:',
          error
        );

        localStorage.removeItem(
          'grocery_customer_session'
        );
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(
        'grocery_customer_session'
      );

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;