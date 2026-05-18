import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import {
  User, Lock, Mail, Phone, ChevronLeft, KeyRound,
  CheckCircle, Building2, Home, ChevronDown, Check,
  ShieldCheck, AlertCircle, Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import api from "../api/axios";

// ─── 타입 ─────────────────────────────────────────────────

interface FormData {
  studentNo: string;
  name: string;
  email: string;
  verificationCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dormitoryName: string;
  roomId: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;
type SuccessMsgs = Partial<Record<keyof FormData, string>>;

type AlertState =
  | { show: false }
  | { show: true; message: string; type: "success" | "error" };

// ─── 상수 ─────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUM_REGEX = /^\d+$/;
const PHONE_REGEX = /^010\d{8}$/;
const PASSWORD_REGEX = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

const DORMITORY_OPTIONS = [
  { id: 1, name: "제1학생생활관" },
  { id: 2, name: "제2학생생활관" },
  { id: 3, name: "제3학생생활관" },
] as const;

const INITIAL_FORM: FormData = {
  studentNo: "", name: "", email: "", verificationCode: "",
  phone: "", password: "", confirmPassword: "",
  dormitoryName: "제1학생생활관", roomId: "",
};

const TIMER_DEFAULT = 180;

// ─── 유효성 검사 유틸 ─────────────────────────────────────

function validateForm(
  form: FormData,
  isSubmitted: boolean,
  isEmailVerified: boolean,
): FormErrors {
  const errors: FormErrors = {};

  const studentNo = form.studentNo.trim();
  if (!studentNo) {
    if (isSubmitted) errors.studentNo = "학번을 입력하세요.";
  } else if (!NUM_REGEX.test(studentNo)) {
    errors.studentNo = "숫자만 입력하세요.";
  } else if (studentNo.length !== 9) {
    errors.studentNo = "9자리를 정확히 입력하세요.";
  }

  if (isSubmitted && !form.name.trim())
    errors.name = "이름을 입력하세요.";

  if (!form.email.trim()) {
    if (isSubmitted) errors.email = "이메일을 입력하세요.";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "이메일 형식에 맞게 입력하세요.";
  }

  if (isSubmitted && !isEmailVerified && !form.verificationCode.trim())
    errors.verificationCode = "인증코드를 입력하세요.";

  if (!form.phone.trim()) {
    if (isSubmitted) errors.phone = "전화번호를 입력하세요.";
  } else if (!NUM_REGEX.test(form.phone)) {
    errors.phone = "숫자만 입력하세요.";
  } else if (isSubmitted && !PHONE_REGEX.test(form.phone)) {
    errors.phone = "전화번호 형식에 맞게 입력하세요.";
  }

  if (!form.password.trim()) {
    if (isSubmitted) errors.password = "비밀번호를 입력하세요.";
  } else if (!PASSWORD_REGEX.test(form.password)) {
    errors.password = "특수 문자를 포함한 8자 이상으로 입력하세요.";
  }

  if (!form.confirmPassword.trim()) {
    if (isSubmitted) errors.confirmPassword = "비밀번호를 다시 입력하세요.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
  }

  if (isSubmitted && !form.dormitoryName.trim())
    errors.dormitoryName = "생활관을 선택하세요.";

  const roomId = form.roomId.trim();
  if (!roomId) {
    if (isSubmitted) errors.roomId = "호수를 입력하세요.";
  } else if (!NUM_REGEX.test(roomId)) {
    errors.roomId = "숫자만 입력하세요.";
  } else if (roomId.length < 3) {
    errors.roomId = "3자리 이상 입력하세요.";
  }

  return errors;
}

// ─── API 에러 파싱 유틸 ───────────────────────────────────

function parseApiError(error: any, fallback: string): string {
  return error.response?.data?.message ?? fallback;
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMsgs, setSuccessMsgs] = useState<SuccessMsgs>({});
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false });
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Refs (Rules of Hooks 준수: 개별 선언) ──
  const refStudentNo = useRef<HTMLDivElement>(null);
  const refName = useRef<HTMLDivElement>(null);
  const refEmail = useRef<HTMLDivElement>(null);
  const refVerificationCode = useRef<HTMLDivElement>(null);
  const refPhone = useRef<HTMLDivElement>(null);
  const refPassword = useRef<HTMLDivElement>(null);
  const refConfirmPassword = useRef<HTMLDivElement>(null);
  const refDormitoryName = useRef<HTMLDivElement>(null);
  const refRoomId = useRef<HTMLDivElement>(null);

  const FIELD_REFS: Record<string, React.RefObject<HTMLDivElement | null>> = {
    studentNo: refStudentNo,
    name: refName,
    email: refEmail,
    verificationCode: refVerificationCode,
    phone: refPhone,
    password: refPassword,
    confirmPassword: refConfirmPassword,
    dormitoryName: refDormitoryName,
    roomId: refRoomId,
  };

  const FIELD_ORDER = Object.keys(FIELD_REFS) as (keyof FormData)[];

  // ── 타이머 ──
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeLeft > 0) {
      timerRef.current = setInterval(() =>
        setTimeLeft(prev => (prev <= 1 ? (clearInterval(timerRef.current!), 0) : prev - 1))
        , 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── 실시간 유효성 검사 ──
  useEffect(() => {
    setErrors(validateForm(formData, isSubmitted, isEmailVerified));
  }, [formData, isSubmitted, isEmailVerified]);

  // ── 입력 핸들러 ──
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccessMsgs(prev => {
      if (!prev[name as keyof FormData]) return prev;
      const next = { ...prev };
      delete next[name as keyof FormData];
      return next;
    });
  }, []);

  // ── 생활관 선택 ──
  const handleDormSelect = useCallback((name: string) => {
    setFormData(prev => ({ ...prev, dormitoryName: name }));
    setOpenSelect(false);
  }, []);

  // ── 에러 첫 번째 필드로 스크롤 ──
  const scrollToFirstError = useCallback((errs: FormErrors): boolean => {
    const firstKey = FIELD_ORDER.find(key => errs[key]);
    if (firstKey) {
      FIELD_REFS[firstKey].current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return true;
    }
    return false;
  }, []);

  // ── 인증코드 발송 ──
  const sendVerificationCode = useCallback(async () => {
    if (!formData.email || errors.email) {
      setErrors(prev => ({ ...prev, email: "올바른 이메일을 입력하세요." }));
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/email/send", { email: formData.email });

      if (res.data.code === 200) {
        setIsCodeSent(true);
        setIsEmailVerified(false);

        const serverExpiredAt = res.data.data?.expiredAt;
        let diffInSeconds = TIMER_DEFAULT;
        if (serverExpiredAt) {
          const diff = Math.floor((new Date(serverExpiredAt).getTime() - Date.now()) / 1000);
          if (diff > 0 && diff < 600) diffInSeconds = diff;
        }

        setTimeLeft(diffInSeconds);
        setErrors(prev => {
          const next = { ...prev };
          delete next.email;
          delete next.verificationCode;
          return next;
        });
        setSuccessMsgs(prev => ({
          ...prev,
          verificationCode: res.data.message || "인증코드가 발송되었습니다.",
        }));
      }
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 409) {
        setErrors(prev => ({
          ...prev,
          email: "이미 가입된 이메일입니다. 로그인 페이지로 이동해주세요.",
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: parseApiError(error, "발송 실패")
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, errors.email]);

  // ── 인증코드 확인 ──
  const verifyCode = useCallback(async () => {
    if (!formData.verificationCode) return;
    setIsLoading(true);
    try {
      const res = await api.post("/auth/email/verify", {
        email: formData.email,
        code: formData.verificationCode,
      });

      if (res.data.code === 200 && res.data.data?.verified) {
        setIsEmailVerified(true);
        setTimeLeft(0);
        setSuccessMsgs(prev => ({ ...prev, verificationCode: "이메일 인증 성공" }));
      }
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 404) {
        setErrors(prev => ({
          ...prev,
          verificationCode: "인증 발송을 먼저 해주세요.",
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          verificationCode: parseApiError(error, "인증 실패"),
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, formData.verificationCode]);

  // ── 회원가입 제출 ──
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    const errs = validateForm(formData, true, isEmailVerified);

    if (!isEmailVerified) {
      errs.verificationCode = "이메일 인증이 필요합니다.";
    }

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

    setIsLoading(true);
    try {
      const roomNo = formData.roomId.replace(/호$/, "").trim();

      const res = await api.post("/auth/signup", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        studentNo: formData.studentNo,
        phone: formData.phone,
        dormitoryName: formData.dormitoryName,
        roomNo: `${roomNo}`,
      });

      // if (res.data.code === 201) {
      if (res.data.code === 200 || res.data.code === 201) {
        setAlert({ show: true, message: "가온이의 가족이 되신 것을 환영합니다!", type: "success" });
      }
      // 또는 응답 status로 체크
      // if (res.status === 200 || res.status === 201) {
      //   setAlert({ show: true, message: "가온이의 가족이 되신 것을 환영합니다!", type: "success" });
      // }
    } catch (error: any) {
      console.log("에러 상세:", error.response?.data);

      const status = error.response?.status;

      const message =
        status === 409 ? "이미 가입된 계정입니다." :
          status === 422 ? "입력값 형식을 확인해주세요." :
            parseApiError(error, "회원가입에 실패했습니다.");
      setAlert({ show: true, message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [formData, isEmailVerified, scrollToFirstError]);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col overflow-hidden bg-[#f0f9ff] font-sans shadow-2xl antialiased">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#f8fafc]" />

      {/* ── 완료/실패 모달 ── */}
      {alert.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-nav-primary/30 px-8 backdrop-blur-[4px]">
          <div className="w-full max-w-[320px] animate-in zoom-in duration-300 rounded-[32px] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-nav-active-bg-from">
              {alert.type === "success"
                ? <CheckCircle className="text-nav-accent" size={32} />
                : <AlertCircle className="text-red-400" size={32} />
              }
            </div>
            <h2 className="mb-2 text-[19px] font-bold text-nav-primary">
              {alert.type === "success" ? "가입 완료" : "가입 실패"}
            </h2>
            <p className="mb-8 text-[14px] font-medium leading-relaxed text-nav-accent">
              {alert.message}
            </p>
            <button
              onClick={() => {
                if (alert.type === "success") navigate("/auth/login");
                else setAlert({ show: false });
              }}
              className={`h-12 w-full rounded-[20px] font-bold text-white shadow-lg transition-all active:scale-[0.96] ${alert.type === "success"
                ? "bg-nav-accent shadow-nav-accent/20"
                : "bg-nav-inactive shadow-gray-200"
                }`}
            >
              {alert.type === "success" ? "시작하기" : "다시 시도"}
            </button>
          </div>
        </div>
      )}

      {/* ── 헤더 ── */}
      <div className="flex shrink-0 items-center gap-4 px-8 pb-6 pt-16">
        <button
          onClick={() => navigate("/auth/login")}
          className="-ml-2 rounded-full p-2 text-nav-primary transition-all hover:bg-white"
        >
          <ChevronLeft className="size-6" />
        </button>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-nav-primary">회원가입</h1>
          <p className="mt-0.5 text-[13px] font-bold text-nav-inactive">
            간편하게 가입하고 스마트하게 생활하세요
          </p>
        </div>
      </div>

      {/* ── 폼 카드 ── */}
      <div className="flex-1 overflow-y-auto px-6 pb-12">
        <div className="rounded-[32px] border border-white bg-white/70 p-7 shadow-xl shadow-blue-900/5 backdrop-blur-lg">
          <form onSubmit={handleSubmit} className="space-y-1" noValidate>

            <SignUpInput label="학번" name="studentNo" icon={User} placeholder="학번을 입력하세요" value={formData.studentNo} onChange={handleChange} error={errors.studentNo} successMsg={successMsgs.studentNo} inputRef={refStudentNo} />
            <SignUpInput label="이름" name="name" icon={User} placeholder="이름을 입력하세요" value={formData.name} onChange={handleChange} error={errors.name} successMsg={successMsgs.name} inputRef={refName} />
            <SignUpInput label="이메일" name="email" icon={Mail} placeholder="이메일을 입력하세요" value={formData.email} onChange={handleChange} error={errors.email} successMsg={successMsgs.email} inputRef={refEmail} type="email"
              buttonLabel={isCodeSent ? "재전송" : "인증"}
              onButtonClick={sendVerificationCode}
            />
            <SignUpInput label="인증코드" name="verificationCode" icon={KeyRound} placeholder="인증코드를 입력하세요" value={formData.verificationCode} onChange={handleChange} error={errors.verificationCode} successMsg={successMsgs.verificationCode} inputRef={refVerificationCode}
              disabled={isEmailVerified}
              buttonLabel="확인"
              onButtonClick={verifyCode}
              buttonDisabled={isEmailVerified}
              timer={isCodeSent && !isEmailVerified && timeLeft > 0 ? formatTime(timeLeft) : undefined}
            />
            <SignUpInput label="전화번호" name="phone" icon={Phone} placeholder="전화번호를 입력하세요" value={formData.phone} onChange={handleChange} error={errors.phone} successMsg={successMsgs.phone} inputRef={refPhone} type="tel" />
            <SignUpInput label="비밀번호" name="password" icon={Lock} placeholder="비밀번호를 입력하세요" value={formData.password} onChange={handleChange} error={errors.password} successMsg={successMsgs.password} inputRef={refPassword} type="password" />
            <SignUpInput label="비밀번호 확인" name="confirmPassword" icon={ShieldCheck} placeholder="비밀번호를 다시 입력하세요" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} successMsg={successMsgs.confirmPassword} inputRef={refConfirmPassword} type="password" />

            {/* ── 생활관 선택 ── */}
            <div className="flex flex-col" ref={refDormitoryName}>
              <label className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-wider text-nav-inactive">
                생활관 동수
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenSelect(v => !v)}
                  className={`flex h-[54px] w-full items-center justify-between rounded-[18px] border-2 bg-white px-4 shadow-sm transition-all ${openSelect ? "border-nav-accent" : "border-white"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`size-[18px] transition-colors ${openSelect ? "text-nav-accent" : "text-nav-inactive"}`} />
                    <span className="text-[14px] font-bold text-nav-primary">{formData.dormitoryName}</span>
                  </div>
                  <ChevronDown className={`size-4 text-nav-inactive transition-transform ${openSelect ? "rotate-180" : ""}`} />
                </button>

                {openSelect && (
                  <div className="absolute z-50 mt-2 w-full animate-in fade-in slide-in-from-top-2 overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-2xl">
                    {DORMITORY_OPTIONS.map(opt => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => handleDormSelect(opt.name)}
                        className="flex w-full items-center justify-between border-b border-slate-50 px-5 py-4 text-left text-[14px] font-bold text-nav-inactive transition-colors last:border-none hover:bg-nav-active-bg-from hover:text-nav-accent"
                      >
                        {opt.name}
                        {formData.dormitoryName === opt.name && <Check size={16} className="text-nav-accent" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-1 mt-0.5 h-5">
                {errors.dormitoryName && (
                  <p className="text-[10px] font-bold text-red-500">* {errors.dormitoryName}</p>
                )}
              </div>
            </div>

            {/* ── 호수 ── */}
            <SignUpInput label="생활관 호수" name="roomId" icon={Home} placeholder="생활관 호수를 입력하세요" value={formData.roomId} onChange={handleChange} error={errors.roomId} inputRef={refRoomId} />

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex h-[58px] w-full items-center justify-center gap-2 rounded-[22px] bg-nav-accent text-[17px] font-bold text-white shadow-xl shadow-nav-accent/30 transition-all active:scale-95 disabled:bg-slate-300"
            >
              {isLoading ? <><Loader2 className="size-5 animate-spin" /><span>준비 중...</span></> : "가입하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── SignUpInput 서브 컴포넌트 ────────────────────────────

interface SignUpInputProps {
  label: string;
  name: string;
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  successMsg?: string;
  type?: string;
  disabled?: boolean;
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonDisabled?: boolean;
  timer?: string;
  inputRef: React.RefObject<HTMLDivElement | null>;
}

const SignUpInput = memo(function SignUpInput({
  label, name, icon: Icon, placeholder, value, onChange,
  error, successMsg, type = "text", disabled = false,
  buttonLabel, onButtonClick, buttonDisabled = false,
  timer, inputRef,
}: SignUpInputProps) {
  return (
    <div className="flex flex-col" ref={inputRef}>
      <label className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-wider text-nav-inactive">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="group relative flex-1">
          <Icon
            size={18}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-nav-inactive transition-colors group-focus-within:text-nav-accent"
          />
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`h-[54px] w-full rounded-[18px] border-2 pl-11 pr-4 text-[14px] font-bold text-nav-primary shadow-sm transition-all focus:outline-none focus:border-nav-accent ${disabled ? "bg-slate-100/50" : "bg-white"
              } ${error ? "border-red-400" : "border-white"}`}
          />
          {timer && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-red-500">
              {timer}
            </span>
          )}
        </div>
        {buttonLabel && (
          <button
            type="button"
            onClick={onButtonClick}
            disabled={buttonDisabled}
            className="h-[54px] shrink-0 rounded-[18px] border-2 border-white bg-white px-4 text-[13px] font-bold text-nav-accent shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {buttonLabel}
          </button>
        )}
      </div>
      <div className="ml-1 mt-0.5 h-[18px]">
        {error && (
          <p className="text-[10px] font-bold text-red-500">* {error}</p>
        )}
        {!error && successMsg && (
          <p className="flex items-center gap-1 text-[10px] font-bold text-green-500">
            <CheckCircle size={10} /> {successMsg}
          </p>
        )}
      </div>
    </div>
  );
});