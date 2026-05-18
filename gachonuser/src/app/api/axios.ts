import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1", // 서버 주소 입력
  withCredentials: true, // 세션 쿠키 전송을 위해 필수
  headers: {
    "Content-Type": "application/json",
  },
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};

    // 401(미인증) 에러 처리
    if (status === 401) {
      // 현재 페이지가 로그인이나 메인("/")이 아닐 때만 튕겨내기
      const publicPaths = ["/auth/login", "/signup", "/"];
      if (!publicPaths.includes(window.location.pathname)) {
        
        // 로컬 데이터 정리
        localStorage.clear();

        // alert 보다는 자연스러운 이동을 선호하지만, 
        // 꼭 필요하다면 한 번만 실행되도록 제어가 필요합니다.
        // 여기서는 단순히 로그인 페이지로 이동 시킵니다.
        window.location.href = "/auth/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API 작업