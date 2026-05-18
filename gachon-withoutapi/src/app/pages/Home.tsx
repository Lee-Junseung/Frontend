import { Link } from "react-router";
import BottomNav from "../components/BottomNav";
import iconLogo from "../icons/GAONI.svg";
import iconTogoChatbot from "../icons/TogoChatbot.svg";

// ─── 상수 ─────────────────────────────────────────────────

// BottomNav(90px) + 챗봇버튼 영역(58px + 상하 여백) 합산
const BOTTOM_OFFSET = "pb-[220px]";
const CHATBOT_BTN_BOTTOM = "bottom-[130px]";


// ─── 서브 컴포넌트 ─────────────────────────────────────────

function HeaderSection() {
  return (
    <div className="mx-auto flex w-full max-w-[340px] flex-row items-center gap-4 pt-20 font-sans antialiased">
      {/* 로고 */}
      <div className="relative flex shrink-0 items-center justify-center">
        <img
          src={iconLogo}
          alt="가온이 로고"
          className="h-auto w-[85px] object-contain transition-all"
        />
      </div>

      {/* 텍스트 */}
      <div className="flex flex-1 flex-col items-start">
        <p className="px-0.5 text-[13px] font-bold tracking-[0.02em] text-nav-accent opacity-90">
          똑똑한 기숙사 생활의 시작
        </p>

        <div className="mt-0.5 px-0.5">
          <span className="block text-[22px] font-extrabold leading-tight tracking-tight text-nav-primary">
            가천대 기숙사 AI
          </span>
          <h1 className="mt-1 block bg-gradient-to-r from-nav-accent to-[#21dcff] bg-clip-text text-[36px] font-black leading-none tracking-tighter text-transparent">
            가온이
          </h1>
        </div>
      </div>
    </div>
  );
}

function NoticeCard() {
  return (
    <div className="mx-auto mt-8 w-full max-w-[340px] rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-nav-accent">
        UPDATE V1
      </p>
      <p className="break-keep text-[14px] font-medium leading-[1.75] text-nav-primary/70">
        가천대 기숙사 AI 생활 지원 서비스 <br />
        <span className="font-bold text-nav-primary/80">"가온이"</span>가 시작되었어요!
      </p>
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function Home() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col overflow-x-hidden bg-[#f0f9ff] font-sans shadow-2xl">

      <div className={`flex-1 ${BOTTOM_OFFSET}`}>
        <HeaderSection />
        <NoticeCard />
      </div>

      {/* ── 챗봇 바로가기 버튼 ── */}
      <div className={`fixed ${CHATBOT_BTN_BOTTOM} left-1/2 z-30 w-full max-w-[448px] -translate-x-1/2 px-6`}>
        <Link
          to="/chatbot"
          className="flex h-[58px] w-full items-center justify-center gap-2.5 rounded-[18px] bg-nav-accent shadow-md transition-all active:scale-95"
        >
          <img
            src={iconTogoChatbot}
            alt=""
            aria-hidden="true"
            className="size-5 brightness-0 invert opacity-90"
          />
          <span className="text-[16px] font-bold tracking-tight text-white">
            궁금한 내용을 바로 물어보세요!
          </span>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}