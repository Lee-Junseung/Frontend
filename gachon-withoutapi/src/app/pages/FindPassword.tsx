import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  User, Mail, Phone, Lock, ChevronLeft,
  CheckCircle, Loader2, AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── 상수 ─────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^010\d{8}$/;
const NUM_REGEX = /^\d+$/;
const PASSWORD_REGEX = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

// ─── 타입 ─────────────────────────────────────────────────

type Step = "verify" | "reset";

interface VerifyForm {
  studentId: string;
  name: string;
  email: string;
  phone: string;
}

interface ResetForm {
  newPassword: string;
  confirmPassword: string;
}

type VerifyErrors = Partial<Record<keyof VerifyForm, string>>;
type ResetErrors = Partial<Record<keyof ResetForm, string>>;

type AlertState =
  | { show: false }
  | { show: true; message: string; type: "success" | "error" };

// ─── 유효성 검사 유틸 ─────────────────────────────────────

function validateVerify(form: VerifyForm, isSubmitted: boolean): VerifyErrors {
  const errors: VerifyErrors = {};
  const purePhone = form.phone.replace(/-/g, "");

  if (!form.studentId.trim()) {
    if (isSubmitted) errors.studentId = "학번을 입력하세요.";
  } else if (!NUM_REGEX.test(form.studentId)) {
    errors.studentId = "숫자만 입력하세요.";
  } else if (form.studentId.length !== 9) {
    errors.studentId = "9자리를 정확히 입력하세요.";
  }

  if (isSubmitted && !form.name.trim())
    errors.name = "이름을 입력하세요.";

  if (!form.email.trim()) {
    if (isSubmitted) errors.email = "이메일을 입력하세요.";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "이메일 형식에 맞게 입력하세요.";
  }

  if (!purePhone) {
    if (isSubmitted) errors.phone = "전화번호를 입력하세요.";
  } else if (!NUM_REGEX.test(purePhone)) {
    errors.phone = "숫자만 입력하세요.";
  } else if (isSubmitted && !PHONE_REGEX.test(purePhone)) {
    errors.phone = "전화번호 형식에 맞게 입력하세요.";
  }

  return errors;
}

function validateReset(form: ResetForm, isSubmitted: boolean): ResetErrors {
  const errors: ResetErrors = {};

  if (!form.newPassword.trim()) {
    if (isSubmitted) errors.newPassword = "새 비밀번호를 입력하세요.";
  } else if (!PASSWORD_REGEX.test(form.newPassword)) {
    errors.newPassword = "특수 문자를 포함한 8자 이상으로 입력하세요.";
  }

  if (!form.confirmPassword.trim()) {
    if (isSubmitted) errors.confirmPassword = "새 비밀번호를 다시 입력하세요.";
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
  }

  return errors;
}

// ─── API 에러 파싱 유틸 ───────────────────────────────────

function parseApiError(error: any, fallback: string): string {
  return error.response?.data?.message ?? fallback;
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function FindPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("verify");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false });

  const [verifyForm, setVerifyForm] = useState<VerifyForm>({
    studentId: "", name: "", email: "", phone: "",
  });
  const [resetForm, setResetForm] = useState<ResetForm>({
    newPassword: "", confirmPassword: "",
  });

  const [verifyErrors, setVerifyErrors] = useState<VerifyErrors>({});
  const [resetErrors, setResetErrors] = useState<ResetErrors>({});

  // ── Refs (Rules of Hooks 준수: 객체 리터럴 밖에서 개별 선언) ──
  const refStudentId = useRef<HTMLDivElement>(null);
  const refName = useRef<HTMLDivElement>(null);
  const refEmail = useRef<HTMLDivElement>(null);
  const refPhone = useRef<HTMLDivElement>(null);
  const refNewPassword = useRef<HTMLDivElement>(null);
  const refConfirmPassword = useRef<HTMLDivElement>(null);

  const verifyRefs = {
    studentId: refStudentId,
    name: refName,
    email: refEmail,
    phone: refPhone,
  } as const;

  const resetRefs = {
    newPassword: refNewPassword,
    confirmPassword: refConfirmPassword,
  } as const;

  // ── 실시간 유효성 검사 ──
  useEffect(() => {
    if (step === "verify") {
      setVerifyErrors(validateVerify(verifyForm, isSubmitted));
    } else {
      setResetErrors(validateReset(resetForm, isSubmitted));
    }
  }, [verifyForm, resetForm, step, isSubmitted]);

  const handleVerifyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVerifyForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleResetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // ── 에러 첫 번째 필드로 스크롤 ──
  const scrollToFirstError = useCallback(
    (errors: Record<string, string | undefined>, refs: Record<string, React.RefObject<HTMLDivElement | null>>) => {
      const firstKey = Object.keys(refs).find(key => errors[key]);
      if (firstKey) {
        refs[firstKey].current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      }
      return false;
    },
    []
  );

  // ── 뒤로가기 ──
  const handleBack = useCallback(() => {
    if (step === "reset") {
      setStep("verify");
      setIsSubmitted(false);
      setResetForm({ newPassword: "", confirmPassword: "" });
    } else {
      navigate("/auth/login");
    }
  }, [step, navigate]);

  // ── 본인 확인 제출 ──
  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    const errs = validateVerify(verifyForm, true);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs, verifyRefs);
      return;
    }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 600));

    // 가짜 본인 확인: 학번 + 이름 + 이메일 + 전화번호 모두 일치해야 통과
    if (
      verifyForm.studentId === "200012345" &&
      verifyForm.name === "무한이" &&
      verifyForm.email === "test@gachon.ac.kr" &&
      verifyForm.phone.replace(/-/g, "") === "01012345678"
    ) {
      setStep("reset");
      setIsSubmitted(false);
      setVerifyForm({ studentId: "", name: "", email: "", phone: "" });
    } else {
      setAlert({ show: true, message: "일치하는 사용자 정보가 없습니다.", type: "error" });
    }
    setIsLoading(false);
  }, [verifyForm, scrollToFirstError, verifyRefs]);

  // ── 비밀번호 재설정 제출 ──
  const handleReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    const errs = validateReset(resetForm, true);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs, resetRefs);
      return;
    }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 600));
    setAlert({ show: true, message: "비밀번호가 안전하게\n변경되었습니다.", type: "success" });
    setIsLoading(false);
  }, [resetForm, scrollToFirstError, resetRefs]);

  // ── 모달 확인 ──
  const handleAlertConfirm = useCallback(() => {
    if (alert.show && alert.type === "success") {
      setAlert({ show: false });
      navigate("/auth/login");
    } else {
      setAlert({ show: false });
    }
  }, [alert, navigate]);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[448px] overflow-x-hidden bg-[#f0f9ff] font-sans shadow-2xl antialiased">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#f8fafc]" />

      {/* ── 알림 모달 ── */}
      {alert.show && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-8"
          onClick={handleAlertConfirm}
        >
          <div className="absolute inset-0 bg-nav-primary/30 backdrop-blur-[4px]" />
          <div
            className="relative w-full max-w-[320px] animate-in fade-in zoom-in duration-300 rounded-[32px] border border-white bg-white p-8 text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-nav-active-bg-from">
              {alert.type === "success"
                ? <CheckCircle className="text-nav-accent" size={32} />
                : <AlertCircle className="text-red-400" size={32} />
              }
            </div>
            <h2 className="mb-2 text-[19px] font-bold text-nav-primary">
              {alert.type === "success" ? "알림" : "오류"}
            </h2>
            <p className="mb-7 whitespace-pre-line text-[15px] font-medium leading-relaxed text-nav-accent">
              {alert.message}
            </p>
            <button
              onClick={handleAlertConfirm}
              className="h-12 w-full rounded-[20px] bg-nav-accent font-bold text-white shadow-lg shadow-nav-accent/20 transition-all active:scale-[0.96]"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <div className="flex w-full flex-col px-6 pb-16">

        {/* ── 헤더 ── */}
        <div className="flex items-center gap-4 pb-8 pt-16">
          <button
            onClick={handleBack}
            className="-ml-2 rounded-full p-2 text-nav-primary transition-all hover:bg-white"
          >
            <ChevronLeft className="size-6" />
          </button>
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-nav-primary">비밀번호 찾기</h1>
            <p className="mt-0.5 text-[13px] font-bold text-nav-inactive">
              {step === "verify" ? "본인 확인을 위해 정보를 입력해주세요" : "새로운 비밀번호를 입력해주세요"}
            </p>
          </div>
        </div>

        {/* ── 폼 카드 ── */}
        <div className="rounded-[32px] border border-white bg-white/70 p-7 shadow-xl shadow-blue-900/5 backdrop-blur-lg">
          <form
            onSubmit={step === "verify" ? handleVerify : handleReset}
            className="space-y-4"
            noValidate
          >
            {step === "verify" ? (
              <>
                <InputField label="학번" name="studentId" type="text" value={verifyForm.studentId} onChange={handleVerifyChange} placeholder="학번을 입력하세요" error={verifyErrors.studentId} icon={User} inputRef={refStudentId} />
                <InputField label="이름" name="name" type="text" value={verifyForm.name} onChange={handleVerifyChange} placeholder="이름을 입력하세요" error={verifyErrors.name} icon={User} inputRef={refName} />
                <InputField label="이메일" name="email" type="email" value={verifyForm.email} onChange={handleVerifyChange} placeholder="이메일을 입력하세요" error={verifyErrors.email} icon={Mail} inputRef={refEmail} />
                <InputField label="전화번호" name="phone" type="tel" value={verifyForm.phone} onChange={handleVerifyChange} placeholder="전화번호를 입력하세요" error={verifyErrors.phone} icon={Phone} inputRef={refPhone} />
              </>
            ) : (
              <>
                <InputField label="새 비밀번호" name="newPassword" type="password" value={resetForm.newPassword} onChange={handleResetChange} placeholder="새 비밀번호를 입력하세요" error={resetErrors.newPassword} icon={Lock} inputRef={refNewPassword} />
                <InputField label="비밀번호 확인" name="confirmPassword" type="password" value={resetForm.confirmPassword} onChange={handleResetChange} placeholder="새 비밀번호를 다시 입력하세요" error={resetErrors.confirmPassword} icon={Lock} inputRef={refConfirmPassword} />
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-[58px] w-full items-center justify-center gap-2 rounded-[22px] bg-nav-accent text-[16px] font-bold text-white shadow-lg shadow-nav-accent/25 transition-all active:scale-95 disabled:bg-slate-300"
            >
              {isLoading
                ? <Loader2 className="size-5 animate-spin" />
                : step === "verify" ? "본인 확인" : "비밀번호 변경하기"
              }
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

// ─── InputField 서브 컴포넌트 ─────────────────────────────

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
  icon: LucideIcon;
  inputRef: React.RefObject<HTMLDivElement | null>;
}

function InputField({
  label, name, type = "text", value, onChange,
  placeholder, error, icon: Icon, inputRef,
}: InputFieldProps) {
  return (
    <div className="flex flex-col" ref={inputRef}>
      <label className="mb-1.5 ml-1 text-[11px] font-bold uppercase tracking-widest text-nav-inactive">
        {label}
      </label>
      <div className="group relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-nav-inactive transition-colors group-focus-within:text-nav-accent"
        />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-[54px] w-full rounded-[18px] border-2 bg-white pl-11 pr-4 text-[15px] font-bold text-nav-primary shadow-sm transition-all focus:outline-none focus:border-nav-accent ${error ? "border-red-300" : "border-white"
            }`}
        />
      </div>
      <div className="ml-1 mt-1 h-[18px]">
        {error && (
          <p className="animate-in fade-in slide-in-from-left-2 text-[11px] font-bold text-red-500">
            * {error}
          </p>
        )}
      </div>
    </div>
  );
}