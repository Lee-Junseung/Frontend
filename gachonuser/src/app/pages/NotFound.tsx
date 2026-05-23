import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col items-center justify-center bg-[#f0f9ff] font-sans shadow-2xl antialiased px-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#f8fafc]" />

      <p className="text-[64px] font-black text-nav-accent">404</p>
      <h1 className="mt-2 text-[20px] font-bold text-nav-primary">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-[13px] font-bold text-nav-inactive">요청하신 페이지가 존재하지 않아요</p>

      <button
        onClick={() => navigate("/")}
        className="mt-8 h-[52px] w-full rounded-[16px] bg-nav-accent font-bold text-white shadow-lg shadow-nav-accent/20 transition-all active:scale-[0.98]"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}