import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  // 서버 주소 입력
  withCredentials: true,
  // 세션 쿠키 전송을 위해 필수
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 네트워크 에러 처리
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const publicPaths = ["/auth/login", "/auth/signup", "/auth/password/identity", "/", "/notices", "/chatbot"];

    if (status === 401) {
      if (!publicPaths.includes(window.location.pathname)) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("userId");

        window.location.href = "/auth/login?expired=true";
      }
    }

    if (status === 403) {
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;