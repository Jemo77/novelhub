/**
 * Wrapper para la función fetch que maneja automáticamente la autenticación
 * y los errores 401 (Token inválido/expirado).
 *
 * @param url La URL del endpoint de la API.
 * @param options Las opciones para la petición fetch (method, headers, body, etc.).
 * @returns Una promesa que resuelve con la respuesta de la API.
 * @throws Lanza un error si la petición falla por razones que no sean 401.
 */
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token inválido o expirado
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login?sesion-expirada=true'; // Redirige a login
    }
  }

  return response;
};
