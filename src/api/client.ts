import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8000/api'

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor: you can add auth token here if needed
api.interceptors.request.use(
  (config) => config,
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor: normalize errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as any
      const message = data?.detail || data?.message || error.response.statusText
      return Promise.reject(new Error(message))
    }
    if (error.request) {
      return Promise.reject(new Error('No response from server'))
    }
    return Promise.reject(error)
  }
)

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export default api
