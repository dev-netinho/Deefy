import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

  if (!envUrl) {
    throw new Error('[API Config]: VITE_API_URL não definida. Verifique o arquivo .env.');
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(envUrl)) {
    console.info('[API Config]: Usando API local no endereço:', envUrl);
  }

  return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
};

// Criação da instância do Axios com configurações padrão e de segurança
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // Timeout de 10 segundos para não travar a aplicação indefinidamente
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de requisição (opcional, útil para enviar tokens futuramente)
api.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith('/api/v1/')) {
      config.url = config.url.replace('/api/v1', '');
    }

    if (import.meta.env.DEV) {
      console.debug('[API Request]:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL || ''}${config.url || ''}`,
      });
    }

    const token = getToken();
    const isAuthRoute = config.url?.startsWith('/auth/');

    if (token && !isAuthRoute) {
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
      response: error.response,
    };

    if (error.response) {
      // O backend retornou um status code fora da faixa 2xx
      customError.status = error.response.status;
      customError.data = error.response.data;
      customError.message = error.response.data?.message || `Erro do Servidor: ${error.response.status}`;

      // Desloga o usuário se a sessão expirar (401 Unauthorized), ignorando rotas de autenticação
      const isAuthRoute = error.config?.url?.includes('/auth/');
      if (error.response.status === 401 && !isAuthRoute) {
        removeToken();
        window.location.href = '/login';
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta (ex: servidor fora do ar, erro de CORS ou timeout)
      if (error.code === 'ECONNABORTED') {
        customError.message = 'A requisição demorou muito para responder (Timeout).';
      } else {
        customError.message = 'Não foi possível conectar ao servidor. Verifique se o Vite está em http://localhost:5173 ou http://localhost:5174 e se a API oficial está acessível.';
      }
    } else {
      // Algum erro ocorreu ao montar a requisição
      customError.message = error.message;
    }

    console.error('[API Error]:', {
      message: customError.message,
      status: customError.status,
      url: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
      code: error.code,
    });

    // Rejeitamos a promessa de forma padrão, assim o .catch() nos componentes receberá um erro previsível
    return Promise.reject(customError);
  }
);

export default api;
