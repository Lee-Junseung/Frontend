import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import iconLogo from "../icons/GAONI.svg";
import api from "../api/axios";

// ─── 상수 ─────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

// ─── 타입 ─────────────────────────────────────────────────

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

// ─── 유효성 검사 유틸 ─────────────────────────────────────

function validateEmail(email: string, isSubmitted: boolean): string {
  if (isSubmitted && !email.trim()) return "이메일을 입력하세요.";
  if (email && !EMAIL_REGEX.test(email)) return "이메일 형식에 맞게 입력하세요.";
  return "";
}

function validatePassword(password: string, isSubmitted: boolean): string {
  if (isSubmitted && !password.trim()) return "비밀번호를 입력하세요.";
  if (password && !PASSWORD_REGEX.test(password)) return "특수 문자를 포함한 8자 이상으로 입력하세요.";
  return "";
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({ email: "", password: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // ── 실시간 유효성 검사 ──
  useEffect(() => {
    setErrors({
      email: validateEmail(form.email, isSubmitted),
      password: validatePassword(form.password, isSubmitted),
    });
  }, [form, isSubmitted]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // ── 로그인 제출 ──
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (
      !form.email.trim() || !EMAIL_REGEX.test(form.email) ||
      !form.password.trim() || !PASSWORD_REGEX.test(form.password)
    ) return;

    setIsLoading(true);
    try {
      const response = await api.post(
        "/auth/login",
        { email: form.email, password: form.password },
        { withCredentials: true }
      );

      if (response.data.code === 200) {
        const { name, userId } = response.data.data;

        // 세션 저장
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userName", name);
        sessionStorage.setItem("userRole", "USER");
        sessionStorage.setItem("userId", userId);

        navigate("/");
      }
      // } catch (error: any) {
      //   const message =
      //     error.response?.data?.message ??
      //     "이메일 또는 비밀번호가\n올바르지 않습니다.";

      //   setAlertMsg(message);

    } catch (error: any) {
      const serverMessage = error.response?.data?.message;
      const status = error.response?.status;

      if (status === 401) {
        setAlertMsg(serverMessage || "이메일 또는 비밀번호가 일치하지 않습니다.");
      } else if (status === 403) {
        setAlertMsg("접근 권한이 없는 계정입니다.");
      } else {
        setAlertMsg("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [form, navigate]);

  return (
    <div className="relative flex min-h-screen w-full justify-center bg-white font-sans antialiased">

      {/* ── 알림 모달 ── */}
      {alertMsg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-8"
          onClick={() => setAlertMsg(null)}
        >
          <div className="absolute inset-0 bg-nav-primary/20 backdrop-blur-[3px]" />
          <div
            className="relative w-full max-w-[320px] animate-in fade-in zoom-in duration-200 rounded-[28px] bg-white p-7 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-nav-active-bg-from">
                <AlertCircle className="text-nav-accent" size={28} />
              </div>
              <h2 className="mb-2 text-[17px] font-bold text-nav-primary">알림</h2>
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

      {/* ── 메인 레이아웃 ── */}
      <div className="relative flex min-h-screen w-full max-w-[448px] flex-col items-center bg-[#f0f9ff] px-7 shadow-sm">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#f8fafc]" />

        <div className="h-10 shrink-0 sm:h-16" />

        {/* ── 로고 ── */}
        <div className="mb-6 flex shrink-0 flex-col items-center sm:mb-8">
          <div className="relative mb-3 flex size-10 items-center justify-center overflow-hidden rounded-[12px] bg-nav-accent shadow-sm shadow-nav-accent/20">
            <img
              src={iconLogo}
              alt="가온이 아이콘"
              className="h-7 w-7 object-contain brightness-0 invert transition-all"
            />
          </div>
          <h1 className="mb-1 text-[24px] font-bold tracking-tight text-nav-primary">가온이</h1>
          <p className="text-[12px] font-bold text-nav-accent">가천대 기숙사 AI 생활 지원 서비스</p>
        </div>

        {/* ── 폼 카드 ── */}
        <div className="mb-6 w-full animate-in fade-in slide-in-from-bottom-3 duration-700 rounded-[28px] border border-white bg-white/75 px-7 pb-5 pt-7 shadow-xl shadow-blue-900/5 backdrop-blur-md">
          <form onSubmit={handleLogin} className="w-full space-y-2.5" noValidate>

            <InputField
              label="이메일"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              error={errors.email}
              icon={<Mail size={16} className="text-nav-inactive group-focus-within:text-nav-accent transition-colors" />}
            />

            <InputField
              label="비밀번호"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              error={errors.password}
              icon={<Lock size={16} className="text-nav-inactive group-focus-within:text-nav-accent transition-colors" />}
            />

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-nav-accent font-bold text-[15px] text-white shadow-lg shadow-nav-accent/20 transition-all active:scale-[0.98] disabled:bg-gray-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>인증 중...</span>
                  </>
                ) : "로그인"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="h-12 w-full rounded-[14px] border-2 border-nav-accent/20 bg-white font-extrabold text-[15px] text-nav-accent shadow-sm transition-all hover:bg-nav-accent/5 active:bg-nav-accent/10"
              >
                로그인 없이 시작하기
              </button>
            </div>
          </form>

          {/* 하단 링크 */}
          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => navigate("/auth/password/identity")}
              className="text-[12px] font-medium text-nav-inactive transition-colors hover:text-nav-accent"
            >
              비밀번호 찾기
            </button>
            <div className="h-3 w-px bg-nav-accent-light" />
            <button
              type="button"
              onClick={() => navigate("/auth/signup")}
              className="text-[12px] font-medium text-nav-inactive transition-colors hover:text-nav-accent"
            >
              회원가입
            </button>
          </div>
        </div>

        {/* ── 푸터 ── */}
        <div className="mt-auto pb-6 text-center opacity-70">
          <p className="text-[10px] font-bold text-nav-inactive">가천대학교 학생생활관</p>
          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-nav-accent-light">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── InputField 서브 컴포넌트 ─────────────────────────────

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error: string;
  icon: React.ReactNode;
}

function InputField({ label, name, type, value, onChange, placeholder, error, icon }: InputFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-wider text-nav-inactive opacity-80">
        {label}
      </label>
      <div className="group relative">
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">{icon}</div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-12 w-full rounded-[12px] border bg-white pl-11 pr-4 text-[14px] font-bold text-nav-primary transition-all focus:outline-none focus:border-nav-accent ${error ? "border-red-400" : "border-[#eef6f7]"
            }`}
        />
      </div>
      <div className="h-[18px]">
        {error && (
          <p className="ml-1 mt-0.5 animate-in fade-in text-[10px] font-bold text-red-500">
            * {error}
          </p>
        )}
      </div>
    </div>
  );
}