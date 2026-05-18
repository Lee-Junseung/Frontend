import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Lock, AlertCircle, Loader2,
  LayoutDashboard, Database, Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import iconLogo from "../../icons/GAONI.svg";

// ─── 타입 ─────────────────────────────────────────────────

interface LoginForm {
  loginId: string;
  password: string;
}

interface LoginFormErrors {
  loginId: string;
  password: string;
}

interface AdminUserData {
  adminId: number;
  loginId: string;
  name: string;
  adminRole: string;
}

interface FeatureItem {
  icon: LucideIcon;
  title: string;
}

// ─── 상수 ─────────────────────────────────────────────────

const FEATURE_ITEMS: FeatureItem[] = [
  { icon: Activity, title: "실시간 대응" },
  { icon: LayoutDashboard, title: "통합 대시보드" },
  { icon: Database, title: "데이터 관리" },
];

const SESSION_KEYS = {
  isLoggedIn: "isLoggedIn",
  adminId: "adminId",
  loginId: "loginId",
  userName: "userName",
  userRole: "userRole",
} as const;

const LABEL_CLASS =
  "mb-1.5 ml-1 text-[10px] font-bold uppercase tracking-wider text-nav-inactive";

const TEST_ACCOUNT = {
  id: "test2@gachon.ac.kr",
  password: "zxcv!@#$",
};

// ─── 커스텀 훅 ─────────────────────────────────────────────

function useLoginForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({ loginId: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({ loginId: "", password: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);


  // 제출 이후부터 실시간 유효성 검사
  useEffect(() => {
    if (!isSubmitted) return;
    setErrors({
      loginId: form.loginId.trim() ? "" : "아이디를 입력하세요.",
      password: form.password.trim() ? "" : "비밀번호를 입력하세요.",
    });
  }, [form, isSubmitted]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const saveSession = useCallback((userData: AdminUserData) => {
    sessionStorage.setItem(SESSION_KEYS.isLoggedIn, "true");
    sessionStorage.setItem(SESSION_KEYS.adminId, userData.adminId.toString());
    sessionStorage.setItem(SESSION_KEYS.loginId, userData.loginId);
    sessionStorage.setItem(SESSION_KEYS.userName, userData.name);
    sessionStorage.setItem(SESSION_KEYS.userRole, userData.adminRole);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!form.loginId.trim() || !form.password.trim()) return;

    if (form.loginId !== TEST_ACCOUNT.id || form.password !== TEST_ACCOUNT.password) {
      setErrors(prev => ({ ...prev, password: "아이디 또는 비밀번호가 올바르지 않습니다." }));
      return;
    }

    saveSession({
      adminId: 1,
      loginId: form.loginId,
      name: "관리자",
      adminRole: "ADMIN",
    });
    navigate("/admin/complaints");
  }, [form, navigate, saveSession]);

  return { form, errors, handleChange, handleSubmit };
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function AdminLogin() {
  const { form, errors, handleChange, handleSubmit } = useLoginForm();


  return (
    <div className="relative flex min-h-screen w-full overflow-auto bg-[#f8fafc] p-4 font-sans antialiased sm:p-6 lg:items-center lg:justify-center lg:p-12">

      {/* ── 알림 모달 ──
      {alertMsg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-title"
          className="fixed inset-0 z-[100] flex items-center justify-center px-8"
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
              <h2 id="alert-title" className="mb-2 text-[17px] font-bold text-nav-primary">
                로그인 실패
              </h2>
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
      )} */}

      {/* ── 메인 카드 ── */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 isolate my-4 grid w-full max-w-[1000px] overflow-hidden rounded-[32px] border border-white/50 bg-white shadow-[0_40px_100px_-20px_rgba(5,74,87,0.12)] sm:my-auto sm:rounded-[40px] lg:min-h-[600px] lg:grid-cols-[1.1fr_1fr]">

        {/* ── 좌측: 브랜드 섹션 ── */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#083344] via-[#0e7490] to-[#155e75] p-12 text-white lg:flex">
          <div className="absolute right-[-10%] top-[-10%] size-[500px] rounded-full bg-[#22d3ee]/10 blur-[120px]" aria-hidden="true" />
          <div className="absolute bottom-[-5%] left-[-5%] size-[400px] rounded-full bg-black/20 blur-[100px]" aria-hidden="true" />

          <div className="relative z-10">
            <div className="mb-10 flex items-center gap-3">
              <img
                src={iconLogo}
                alt="가온이 로고"
                className="size-[72px] object-contain brightness-0 drop-shadow-sm invert"
              />
              <span className="text-4xl font-black tracking-normal">GAONI</span>
            </div>
            <h1 className="mb-3 text-[48px] font-black leading-[1.1] tracking-tight">
              Gachon<br />
              <span className="text-white/70">Dormitory</span><br />
              System
            </h1>
            <p className="text-sm font-medium leading-relaxed text-white/70">
              가천대학교 학생생활관 통합 관리자 포털입니다.
            </p>
          </div>

          <ul className="relative z-10 mt-8 space-y-5" aria-label="주요 기능">
            {FEATURE_ITEMS.map(({ icon: Icon, title }) => (
              <li key={title} className="flex items-center gap-4">
                <div className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-white">{title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 우측: 로그인 폼 ── */}
        <div className="flex h-full flex-col justify-center bg-white px-10 pb-6 pt-10">
          <div className="mb-8 shrink-0">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-nav-accent">
              GAONI ADMIN PAGES
            </span>
            <h2 className="mb-2 text-[26px] font-black text-[#0f172a]">관리자 로그인</h2>
            <div className="h-1.5 w-10 rounded-full bg-nav-accent" aria-hidden="true" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* 아이디 */}
            <div className="flex flex-col">
              <label htmlFor="loginId" className={LABEL_CLASS}>아이디</label>
              <div className="group relative">
                <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2" aria-hidden="true">
                  <Lock size={18} className="text-nav-inactive transition-colors group-focus-within:text-nav-accent" />
                </div>
                <input
                  id="loginId"
                  name="loginId"
                  type="text"
                  value={form.loginId}
                  onChange={handleChange}
                  placeholder="아이디를 입력하세요"
                  autoComplete="username"
                  aria-invalid={!!errors.loginId}
                  aria-describedby={errors.loginId ? "loginId-error" : undefined}
                  className={`h-[56px] w-full rounded-[16px] border bg-[#f8fafc] pl-12 pr-4 text-[14px] font-bold text-nav-primary transition-all focus:border-nav-accent focus:outline-none ${errors.loginId ? "border-red-400" : "border-[#eef6f7]"
                    }`}
                />
              </div>
              <div className="h-[18px]">
                {errors.loginId && (
                  <p id="loginId-error" role="alert" className="ml-1 mt-1 animate-in fade-in text-[10px] font-bold text-red-500">
                    * {errors.loginId}
                  </p>
                )}
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col">
              <label htmlFor="password" className={LABEL_CLASS}>비밀번호</label>
              <div className="group relative">
                <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2" aria-hidden="true">
                  <Lock size={18} className="text-nav-inactive transition-colors group-focus-within:text-nav-accent" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`h-[56px] w-full rounded-[16px] border bg-[#f8fafc] pl-12 pr-4 text-[14px] font-bold text-nav-primary transition-all focus:border-nav-accent focus:outline-none ${errors.password ? "border-red-400" : "border-[#eef6f7]"
                    }`}
                />
              </div>
              <div className="h-[18px]">
                {errors.password && (
                  <p id="password-error" role="alert" className="ml-1 mt-1 animate-in fade-in text-[10px] font-bold text-red-500">
                    * {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-2">
              {/* <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[16px] bg-nav-accent font-black text-[15px] text-white shadow-lg shadow-nav-accent/20 transition-all hover:bg-nav-accent/90 active:scale-[0.98] disabled:bg-gray-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    <span>접속 중...</span>
                  </>
                ) : (
                  <span>시스템 접속하기</span>
                )}
              </button> */}
              <button
                type="submit"
                className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[16px] bg-nav-accent font-black text-[15px] text-white shadow-lg shadow-nav-accent/20 transition-all hover:bg-nav-accent/90 active:scale-[0.98] disabled:bg-gray-300"
              >
                <span>시스템 접속하기</span>
              </button>
            </div>
          </form>

          {/* 하단 영역 */}
          <div className="mt-6 flex shrink-0 flex-col items-center">
            <a
              href="https://gaoni-user.vercel.app/api/v1/auth/login"
              rel="noopener noreferrer"
              className="flex h-[52px] w-full items-center justify-center rounded-[16px] border-2 border-nav-accent/20 bg-white text-[13px] font-extrabold text-nav-accent transition-all hover:bg-nav-accent/5 active:scale-[0.98] active:bg-nav-accent/10"
            >
              일반 사용자 화면으로 이동
            </a>
            <div className="mt-6 w-full border-t border-slate-50 pt-4 text-center">
              <p className="text-[9px] font-bold uppercase tracking-tighter text-[#cbd5e1]">
                Infrastructure by Gachon University
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}