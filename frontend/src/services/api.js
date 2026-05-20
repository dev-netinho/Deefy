import axios from 'axios';
import { getToken } from '../utils/auth';

// Criação da instância do Axios com configurações padrão e de segurança
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000, // Timeout de 10 segundos para não travar a aplicação indefinidamente
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de requisição (opcional, útil para enviar tokens futuramente)
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para lidar com erros de forma global e segura
api.interceptors.response.use(
  (response) => {
    // Se a requisição deu sucesso, apenas retorna os dados.
    return response;
  },
  (error) => {
    // Prevenindo crashes da aplicação padronizando os erros do backend
    let customError = {
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      status: null,
      data: null,
    };

    if (error.response) {
      // O backend retornou um status code fora da faixa 2xx
      customError.status = error.response.status;
      customError.data = error.response.data;
      customError.message = error.response.data?.message || `Erro do Servidor: ${error.response.status}`;
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta (ex: servidor fora do ar, erro de CORS ou timeout)
      if (error.code === 'ECONNABORTED') {
        customError.message = 'A requisição demorou muito para responder (Timeout).';
      } else {
        customError.message = 'Não foi possível conectar ao servidor. Verifique sua conexão ou se a API está online.';
      }
    } else {
      // Algum erro ocorreu ao montar a requisição
      customError.message = error.message;
    }

    // É boa prática dar um console.error apenas no ambiente de dev, mas deixaremos aqui para debug
    console.error('[API Error]:', customError.message);

    // Rejeitamos a promessa de forma padrão, assim o .catch() nos componentes receberá um erro previsível
    return Promise.reject(customError);
  }
);

export default api;
