import { useState, useCallback, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";

import iconHome from "../icons/Home.svg";
import iconComplaints from "../icons/Complaints.svg";
import iconChatbot from "../icons/Chatbot.svg";
import iconNotice from "../icons/Notices.svg";
import iconProfile from "../icons/Profile.svg";

// ─── 타입 ─────────────────────────────────────────────────

interface NavItem {
  path: string;
  icon: string;
  label: string;
  requiresAuth?: boolean;
  isChatbot?: boolean;
}

interface ModalState {
  show: boolean;
  message: string;
}

// ─── 상수 ─────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { path: "/", icon: iconHome, label: "홈" },
  { path: "/complaints", icon: iconComplaints, label: "민원", requiresAuth: true },
  { path: "/chatbot", icon: iconChatbot, label: "챗봇", isChatbot: true },
  { path: "/notices", icon: iconNotice, label: "공지" },
  { path: "/users/me", icon: iconProfile, label: "내정보", requiresAuth: true },
];

const AUTH_MODAL_MESSAGE =
  "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?";

// ─── 서브 컴포넌트 ─────────────────────────────────────────

const ActiveBg = memo(({ isActive }: { isActive: boolean }) => (
  <div
    className={[
      "absolute -top-1.5 left-1/2 -translate-x-1/2 size-[48px]",
      "bg-gradient-to-tr from-nav-active-bg-from to-nav-active-bg-to",
      "rounded-[14px] -z-10",
      "shadow-[0_4px_12px_rgba(5,74,87,0.10)]",
      "ring-1 ring-white/60",
      "transition-all duration-300 ease-out",
      isActive
        ? "opacity-100 scale-100"
        : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
    ].join(" ")}
  />
));
ActiveBg.displayName = "ActiveBg";

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const [modal, setModal] = useState<ModalState>({ show: false, message: "" });

  const checkAuth = useCallback(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const hasCookie = document.cookie.includes("JSESSIONID");
    return isLoggedIn || hasCookie;
  }, []);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleNavClick = useCallback(
    (e: React.MouseEvent, item: NavItem) => {
      if (item.requiresAuth && !checkAuth()) {
        e.preventDefault();
        setModal({ show: true, message: AUTH_MODAL_MESSAGE });
      }
    },
    [checkAuth]
  );

  const handleConfirm = useCallback(() => {
    setModal(prev => ({ ...prev, show: false }));
    navigate("/auth/login");
  }, [navigate]);

  const handleCancel = useCallback(() => {
    setModal(prev => ({ ...prev, show: false }));
  }, []);

  const getIconStyle = (path: string) =>
    isActive(path)
      ? { filter: "invert(18%) sepia(40%) saturate(800%) hue-rotate(155deg) brightness(75%) contrast(105%)" }
      : { opacity: 0.35, filter: "grayscale(30%)" };

  return (
    <>
      {/* ── 인증 모달 ── */}
      {modal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[4px]">
          <div className="w-[85%] max-w-[320px] animate-in fade-in zoom-in duration-300 rounded-[32px] border border-white/50 bg-white/95 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <div className="flex flex-col items-center gap-5 text-center">

              <div className="flex size-14 items-center justify-center rounded-full bg-nav-active-bg-from text-nav-accent">
                <AlertCircle size={32} />
              </div>

              <p className="whitespace-pre-line text-[16px] font-bold leading-relaxed text-nav-primary">
                {modal.message}
              </p>

              <div className="mt-2 flex w-full gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-2xl bg-nav-accent-light py-4 text-[14px] font-bold text-nav-accent transition-all active:scale-95"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 rounded-2xl bg-nav-accent py-4 text-[14px] font-bold text-white shadow-lg shadow-nav-accent/30 transition-all active:scale-95"
                >
                  확인
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── 하단 네비게이션 바 ── */}
      <nav className="fixed bottom-0 left-1/2 z-50 flex h-[90px] w-full max-w-[448px] -translate-x-1/2 items-center justify-around border-t border-nav-inactive/20 bg-[#f0f9ff]/95 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
        {NAV_ITEMS.map(item =>
          item.isChatbot ? (
            /* ── 챗봇: 중앙 강조 플로팅 버튼 ── */
            <Link
              key={item.path}
              to={item.path}
              className="-mt-8 flex flex-col items-center transition-transform hover:scale-105 active:scale-95"
            >
              <div className={[
                "relative flex size-[72px] items-center justify-center overflow-hidden rounded-full",
                "bg-gradient-to-br from-nav-active-bg-from to-nav-accent transition-all duration-200",
                isActive(item.path)
                  ? "scale-105 border-[6px] border-white shadow-[0_10px_24px_rgba(5,74,87,0.35)]"
                  : "border-4 border-white/80 shadow-[0_8px_18px_rgba(5,74,87,0.20)]",
              ].join(" ")}>
                <div className="absolute inset-0 bg-white/15 opacity-50" />
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`z-10 transition-all duration-200 ${isActive(item.path) ? "size-[42px] drop-shadow-md" : "size-[38px]"}`}
                />
              </div>
              <span className={`mt-2 text-[11px] tracking-tight transition-all ${isActive(item.path)
                ? "font-black text-nav-primary"
                : "font-bold text-nav-accent"
                }`}>
                {item.label}
              </span>
            </Link>
          ) : (
            /* ── 일반 아이템 ── */
            <Link
              key={item.path}
              to={item.path}
              onClick={e => handleNavClick(e, item)}
              className="group relative flex min-w-[60px] flex-col items-center gap-1"
            >
              <ActiveBg isActive={isActive(item.path)} />
              <img
                src={item.icon}
                alt={item.label}
                className="z-10 size-[26px] transition-all duration-300"
                style={getIconStyle(item.path)}
              />
              <span className={`text-[11px] transition-colors duration-300 ${isActive(item.path)
                ? "font-bold text-nav-primary"
                : "text-nav-inactive group-hover:text-nav-primary"
                }`}>
                {item.label}
              </span>
            </Link>
          )
        )}
      </nav>
    </>
  );
}