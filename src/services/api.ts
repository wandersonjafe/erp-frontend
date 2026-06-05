import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }

        const mensagem = 
        error.response?.data?.message ??
        error.response?.data?.erro ??
        error.response?.data ??
        'Erro inesperado. Tente novamente.'

        error.mensagemAmigavel = typeof mensagem === 'string'
        ? mensagem
        : JSON.stringify(mensagem)
        
        return Promise.reject(error)
    }
)

export default api