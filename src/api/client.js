import axios from 'axios';

const BASE_URL = 'https://amigosapp-backend.onrender.com/api'; 

const axiosClient = axios.create({
    baseURL: BASE_URL
});

export default axiosClient;