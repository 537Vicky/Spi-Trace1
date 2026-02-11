import axiosInstance from './axiosConfig';

const USER_API = '/api/users';

export const userService = {
    getAllUsers: async () => {
        const response = await axiosInstance.get(USER_API);
        return response.data;
    },

    getUserById: async (id) => {
        const response = await axiosInstance.get(`${USER_API}/${id}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await axiosInstance.post(USER_API, userData);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await axiosInstance.put(`${USER_API}/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axiosInstance.delete(`${USER_API}/${id}`);
        return response.data;
    },

    healthCheck: async () => {
        const response = await axiosInstance.get('/api/health');
        return response.data;
    },
};
