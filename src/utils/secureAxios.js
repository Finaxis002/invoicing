
// import axios from "axios";
// const secureAxios = axios.create({
//   baseURL: "https://taskbe.sharda.co.in/api",
//   withCredentials: true, // Add this for cookies/sessions
// });

// secureAxios.interceptors.request.use((config) => {
//   const token = localStorage.getItem("authToken");
  
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
  
//   // Only add this if your backend expects it
//   config.headers["x-app-client"] = "frontend-authenticated";
  
//   return config;
// });

// // In your invoicing software
// secureAxios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         // Try to refresh the token
//         const refreshToken = localStorage.getItem('refreshToken');
//         const response = await axios.post('https://taskbe.sharda.co.in/api/refresh', {
//           refreshToken
//         });
        
//         const { token } = response.data;
//         localStorage.setItem('authToken', token);
//         apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // Redirect to login if refresh fails
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for debugging
// secureAxios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API Error:", error.response?.data);
//     return Promise.reject(error);
//   }
// );

// export default secureAxios;





















import axios from "axios";

const secureAxios = axios.create({
  baseURL: "https://taskbe.sharda.co.in/api",
  withCredentials: true,
});

secureAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Only add this if your backend expects it
  config.headers["x-app-client"] = "frontend-authenticated";
  
  return config;
});

// Response interceptor for token refresh
secureAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('https://taskbe.sharda.co.in/api/refresh', {
          refreshToken
        });
        
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        secureAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        return secureAxios(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
secureAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data);
    return Promise.reject(error);
  }
);

export default secureAxios;