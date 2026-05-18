import { ReactNode, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  MessageSquare, BarChart3, Users, LogOut,
  Menu, X, AlertCircle, FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import api from "../api/axios";

// ─── 타입 ─────────────────────────────────────────────────

interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

interface AdminLayoutProps {
  children: ReactNode;
}

// ─── 상수 ─────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  { path: "/admin/complaints", icon: MessageSquare, label: "민원 관리" },
  { path: "/admin/chatlogs/stats", icon: BarChart3, label: "챗봇 통계" },
  { path: "/admin/users", icon: Users, label: "학생 관리" },
  { path: "/regulations", icon: FileText, label: "규정 문서" },
];

// ─── 커스텀 훅 ─────────────────────────────────────────────

function useScrollLock(locked: boolean) {
  useEffect(() => {
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [locked]);
}

// 로그아웃 로직만 담당 — alert 상태는 컴포넌트에서 관리
function useLogout(onError: (msg: string) => void) {
  const navigate = useNavigate();

  const clearAuthData = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/admin/auth/login");
  }, [navigate]);

  const confirmLogout = useCallback(async () => {
    try {
      const { data } = await api.post<{
        code: number;
        data: { logout: boolean } | null;
        message: string;
      }>("/admin/auth/logout");

      if (data.code === 200 && data.data?.logout) {
        clearAuthData();
      } else {
        onError(data.message || "로그아웃 처리 중 오류가 발생했습니다.");
        setTimeout(clearAuthData, 2000);
      }
    } catch {
      clearAuthData();
    }
  }, [clearAuthData, onError]);

  return { confirmLogout };
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const { confirmLogout } = useLogout(msg => setAlertMsg(msg));

  useScrollLock(isMobileMenuOpen || isLogoutModalOpen);

  const isActive = useCallback(
    (path: string) => pathname === path,
    [pathname]
  );

  const handleMobileNavigate = useCallback((path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const handleLogoutConfirm = useCallback(async () => {
    setIsLogoutModalOpen(false);
    await confirmLogout();
  }, [confirmLogout]);

  return (
    <div className="flex min-h-screen w-full bg-white">

      {/* ── 데스크탑 사이드바 ── */}
      <aside className="fixed z-30 hidden h-screen w-64 flex-col border-r border-nav-inactive/20 bg-white lg:flex">
        <div className="border-b border-nav-inactive/20 px-6 py-6">
          <h1 className="text-[24px] font-bold text-nav-primary">관리자</h1>
          <p className="mt-1 text-[12px] font-medium text-nav-inactive">가천대학교 기숙사</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="관리자 메뉴">
          <div className="space-y-1">
            {MENU_ITEMS.map(({ path, icon: Icon, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                aria-current={isActive(path) ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-[12px] px-4 py-3 transition-all group ${isActive(path)
                  ? "bg-nav-accent text-white shadow-lg shadow-nav-accent/30"
                  : "text-nav-inactive hover:bg-[#f0f9ff] hover:text-nav-accent"
                  }`}
              >
                <span className="rounded-md p-1">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-[14px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="border-t border-nav-inactive/20 p-4">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-[#ea5455] transition-all group hover:bg-red-50"
          >
            <span className="rounded-md bg-red-50 p-1 transition-all group-hover:bg-transparent">
              <LogOut className="size-5" aria-hidden="true" />
            </span>
            <span className="text-[14px] font-semibold">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* ── 모바일 헤더 ── */}
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-nav-inactive/20 bg-white px-4 py-4 lg:hidden">
        <div>
          <h1 className="text-[20px] font-bold text-nav-primary">관리자</h1>
          <p className="text-[11px] font-medium text-nav-inactive">가천대학교 기숙사</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          className="rounded-[8px] bg-[#f0f9ff] p-2 text-nav-accent"
        >
          {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      {/* ── 모바일 메뉴 오버레이 ── */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="모바일 메뉴"
          className="fixed inset-0 z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 animate-in fade-in bg-nav-primary/10 backdrop-blur-[6px]" aria-hidden="true" />
          <div
            className="absolute left-4 right-4 top-4 overflow-hidden rounded-[32px] border border-white/60 bg-white/95 shadow-xl backdrop-blur-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 pb-2 pt-8">
              <h2 className="text-[22px] font-black text-nav-primary">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="메뉴 닫기"
                className="rounded-2xl bg-[#f0f9ff] p-3 text-nav-inactive hover:text-[#ea5455]"
              >
                <X className="size-6" />
              </button>
            </div>

            <nav className="space-y-2 px-4 py-6" aria-label="모바일 메뉴">
              {MENU_ITEMS.map(({ path, icon: Icon, label }) => (
                <button
                  key={path}
                  onClick={() => handleMobileNavigate(path)}
                  aria-current={isActive(path) ? "page" : undefined}
                  className={`flex w-full items-center gap-4 rounded-[22px] px-5 py-4 transition-all group ${isActive(path)
                    ? "bg-nav-accent text-white"
                    : "text-nav-inactive hover:bg-[#f0f9ff]"
                    }`}
                >
                  <span className={`rounded-[14px] p-2.5 transition-all ${isActive(path) ? "bg-transparent" : "bg-[#f0f9ff] group-hover:bg-transparent"
                    }`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-[15px] font-bold">{label}</span>
                </button>
              ))}

              <div className="mx-4 my-4 h-px bg-nav-inactive/20" aria-hidden="true" />

              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsLogoutModalOpen(true); }}
                className="flex w-full items-center gap-4 rounded-[22px] px-6 py-4 font-bold text-[#ea5455] transition-all group hover:bg-red-50"
              >
                <span className="rounded-[14px] bg-red-50 p-2.5 transition-all group-hover:bg-transparent">
                  <LogOut className="size-5" aria-hidden="true" />
                </span>
                <span>로그아웃</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* ── 메인 컨텐츠 ── */}
      <main className="min-h-screen flex-1 bg-[#f0f9ff] pb-20 pt-[73px] lg:ml-64 lg:pb-0 lg:pt-0">
        {children}
      </main>

      {/* ── 모바일 하단 탭 ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-nav-inactive/20 bg-white px-2 py-2 lg:hidden"
        aria-label="하단 탭 메뉴"
      >
        <div className="flex items-center justify-around">
          {MENU_ITEMS.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-current={isActive(path) ? "page" : undefined}
              aria-label={label}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive(path) ? "text-nav-accent" : "text-nav-inactive"
                }`}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── 알림 모달 ── */}
      {alertMsg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-title"
          className="fixed inset-0 z-[110] flex items-center justify-center px-8"
          onClick={() => setAlertMsg(null)}
        >
          <div className="absolute inset-0 bg-nav-primary/20 backdrop-blur-[3px]" aria-hidden="true" />
          <div
            className="relative w-full max-w-[320px] animate-in fade-in zoom-in duration-200 rounded-[28px] bg-white p-7 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-nav-active-bg-from">
                <AlertCircle className="text-nav-accent" size={28} aria-hidden="true" />
              </div>
              <h2 id="alert-title" className="mb-2 text-[17px] font-bold text-nav-primary">알림</h2>
              <p className="mb-6 whitespace-pre-wrap text-[14px] font-medium leading-relaxed text-nav-accent">
                {alertMsg}
              </p>
              <button
                onClick={() => setAlertMsg(null)}
                className="h-[50px] w-full rounded-[18px] bg-nav-accent font-bold text-white shadow-md transition-all active:scale-[0.96]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 로그아웃 모달 ── */}
      {isLogoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          className="fixed inset-0 z-[100] flex animate-in fade-in items-center justify-center bg-black/40 backdrop-blur-[4px]"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="animate-in zoom-in-95 duration-200 w-[85%] max-w-[340px] rounded-[32px] bg-white p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-50 text-[#ea5455]">
                <LogOut size={32} aria-hidden="true" />
              </div>
              <div>
                <h3 id="logout-title" className="text-[20px] font-black text-nav-primary">로그아웃</h3>
                <p className="mt-2 text-[15px] font-bold text-nav-inactive">정말 로그아웃 하시겠습니까?</p>
              </div>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 rounded-2xl bg-nav-accent-light py-4 font-bold text-nav-accent transition-all active:scale-[0.96]"
                >
                  취소
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 rounded-2xl bg-[#ea5455] py-4 font-bold text-white shadow-lg shadow-red-100 transition-all active:scale-[0.96]"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}