import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
  }
})

// attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sanctum_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
