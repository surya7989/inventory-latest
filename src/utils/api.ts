import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
                const { accessToken } = res.data;
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Redirect to login or handle logout
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
