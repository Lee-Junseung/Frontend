import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  User, Building2, Home, Phone, Mail,
  LogOut, ChevronLeft, ChevronDown, Settings2,
  Check, AlertCircle, Loader2, Lock, KeyRound, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BottomNav from "../components/BottomNav";

// ─── 타입 ─────────────────────────────────────────────────

interface UserInfo {
  name: string;
  studentNo: string;
  dormitoryId: string;
  roomId: string | number;
  email: string;
  phone: string;
}

interface PasswordForm {
  current: string;
  new: string;
  confirm: string;
}

type FormErrors = Partial<Record<string, string>>;

type AlertState =
  | { show: false }
  | { show: true; message: string; isConfirm: false }
  | { show: true; message: string; isConfirm: true; onConfirm: () => void };

// ─── 상수 ─────────────────────────────────────────────────

const DORM_OPTIONS = [
  { id: "1", name: "제1학생생활관" },
  { id: "2", name: "제2학생생활관" },
  { id: "3", name: "제3학생생활관" },
] as const;

const PASSWORD_REGEX = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const NUM_REGEX = /^\d+$/;
const PHONE_REGEX = /^010\d{8}$/;

const LABEL_CLASS = "mb-1 ml-1 text-[10px] font-bold uppercase tracking-wider text-nav-inactive";

const FAKE_USER: UserInfo = {
  name: "테스트유저",
  studentNo: "202112345",
  dormitoryId: "1",
  roomId: "302",
  email: "test@gachon.ac.kr",
  phone: "01012345678",
};

// ─── API 에러 파싱 유틸 ───────────────────────────────────

function parseApiError(error: any, fallback: string): string {
  return error.response?.data?.message ?? fallback;
}

// ─── 유효성 검사 유틸 ─────────────────────────────────────

function validateEditForm(editedInfo: UserInfo, passwords: PasswordForm): FormErrors {
  const errors: FormErrors = {};

  const roomStr = String(editedInfo.roomId).trim();
  if (!roomStr) errors.roomId = "호수를 입력하세요.";
  else if (!NUM_REGEX.test(roomStr)) errors.roomId = "숫자만 입력하세요.";
  else if (roomStr.length < 3) errors.roomId = "3자리 이상 입력하세요.";

  const purePhone = editedInfo.phone.replace(/-/g, "");
  if (!purePhone) errors.phone = "전화번호를 입력하세요.";
  else if (!NUM_REGEX.test(purePhone)) errors.phone = "숫자만 입력하세요.";
  else if (!PHONE_REGEX.test(purePhone)) errors.phone = "전화번호 형식에 맞게 입력하세요.";

  if (passwords.new) {
    if (!PASSWORD_REGEX.test(passwords.new)) errors.newPw = "특수 문자를 포함한 8자 이상으로 입력하세요.";
    if (!passwords.current) errors.currentPw = "현재 비밀번호를 입력하세요.";
  }

  if (passwords.confirm && passwords.new !== passwords.confirm)
    errors.confirmPw = "비밀번호가 일치하지 않습니다.";

  return errors;
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openSelect, setOpenSelect] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false });

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [editedInfo, setEditedInfo] = useState<UserInfo | null>(null);
  const [passwords, setPasswords] = useState<PasswordForm>({ current: "", new: "", confirm: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  // ── 데이터 로드 ──
  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 500));
    setUserInfo(FAKE_USER);
    setEditedInfo(FAKE_USER);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchUserInfo(); }, [fetchUserInfo]);

  // ── 실시간 유효성 검사 ──
  useEffect(() => {
    if (!editedInfo) return;
    setErrors(validateEditForm(editedInfo, passwords));
  }, [editedInfo, passwords]);

  // ── 입력 핸들러 ──
  const handleEditChange = useCallback((field: keyof UserInfo, value: string) => {
    setEditedInfo(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const handlePasswordChange = useCallback((field: keyof PasswordForm, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  }, []);

  // ── 수정 취소 ──
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedInfo(userInfo);
    setPasswords({ current: "", new: "", confirm: "" });
  }, [userInfo]);

  // ── 저장 ──
  const handleSave = useCallback(async () => {
    if (!editedInfo) return;

    const errs = validateEditForm(editedInfo, passwords);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 600));

    const updated: UserInfo = {
      ...userInfo!,
      phone: editedInfo.phone.replace(/-/g, ""),
      dormitoryId: String(editedInfo.dormitoryId),
      roomId: Number(editedInfo.roomId),
    };
    setUserInfo(updated);
    setIsEditing(false);
    setPasswords({ current: "", new: "", confirm: "" });
    setAlert({ show: true, isConfirm: false, message: "성공적으로 수정되었습니다." });
    setIsLoading(false);
  }, [editedInfo, passwords]);

  // ── 로그아웃 ──
  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    sessionStorage.clear();
    localStorage.clear();
    navigate("/auth/login", { replace: true });
  }, [navigate]);

  // ── 로딩 화면 ──
  if (isLoading || !userInfo) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f9ff]">
      <Loader2 className="size-8 animate-spin text-nav-accent" />
    </div>
  );

  const isNotChanged =
    JSON.stringify(userInfo) === JSON.stringify(editedInfo) && !passwords.new;

  const isSaveDisabled =
    !!(errors.roomId || errors.phone || errors.newPw || errors.confirmPw) ||
    (!!passwords.new && !passwords.current) || isNotChanged;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col bg-[#f0f9ff] font-sans shadow-2xl antialiased">

      {/* ── 알림 모달 ── */}
      {alert.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-nav-primary/20 px-8 backdrop-blur-[3px]">
          <div className="w-full max-w-[320px] animate-in zoom-in-95 duration-200 rounded-[28px] bg-white p-7 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-nav-active-bg-from">
                {alert.isConfirm
                  ? <AlertCircle className="text-nav-accent" size={28} />
                  : <Check className="text-nav-accent" size={28} />
                }
              </div>
              <h2 className="mb-2 text-[17px] font-bold text-nav-primary">알림</h2>
              <p className="mb-6 whitespace-pre-line text-[14px] font-medium leading-relaxed text-nav-accent">
                {alert.message}
              </p>
              <div className="flex w-full gap-2">
                {alert.isConfirm ? (
                  <>
                    <button
                      onClick={() => setAlert({ show: false })}
                      className="h-[50px] flex-1 rounded-[18px] bg-nav-accent-light font-bold text-nav-accent transition-all active:scale-[0.96]"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => { alert.onConfirm(); setAlert({ show: false }); }}
                      className="h-[50px] flex-1 rounded-[18px] bg-nav-accent font-bold text-white transition-all active:scale-[0.96]"
                    >
                      확인
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAlert({ show: false })}
                    className="h-[50px] w-full rounded-[18px] bg-nav-accent font-bold text-white transition-all active:scale-[0.96]"
                  >
                    확인
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 헤더 ── */}
      <div className="shrink-0 px-7 pb-6 pt-16">
        <div className="flex items-center gap-3">
          {isEditing && (
            <button onClick={handleCancelEdit} className="-ml-2 p-2">
              <ChevronLeft className="size-6 text-nav-primary" />
            </button>
          )}
          <h1 className="text-[24px] font-bold tracking-tight text-nav-primary">
            {isEditing ? "개인정보 수정" : "내 정보"}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-32">
        {!isEditing ? (
          /* ── 조회 모드 ── */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 rounded-[28px] border border-white bg-white/75 p-7 shadow-xl shadow-blue-900/5 backdrop-blur-md">
              <div className="mb-8 flex items-center gap-4 border-b border-[#f1f5f9] pb-6">
                <div className="flex size-14 items-center justify-center rounded-[22px] bg-nav-accent text-white shadow-lg shadow-nav-accent/20">
                  <User size={28} />
                </div>
                <div>
                  <p className="mb-1 text-[20px] font-bold leading-tight text-nav-primary">{userInfo.name}</p>
                  <p className="text-[14px] font-bold tracking-wide text-nav-inactive">{userInfo.studentNo}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <InfoRow icon={Building2} label="생활관" value={DORM_OPTIONS.find(d => d.id === String(userInfo.dormitoryId))?.name ?? `제${userInfo.dormitoryId}생활관`} />
                <InfoRow icon={Home} label="호수" value={`${userInfo.roomId}호`} />
                <InfoRow icon={Mail} label="이메일" value={userInfo.email} />
                <InfoRow icon={Phone} label="전화번호" value={userInfo.phone} />
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="flex w-full items-center gap-4 rounded-[18px] border border-white bg-white p-5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Settings2 size={24} className="text-nav-accent" />
              <p className="text-[16px] font-bold text-nav-primary">개인정보 수정</p>
            </button>
            <button
              onClick={() => setAlert({ show: true, isConfirm: true, message: "로그아웃하시겠습니까?", onConfirm: handleLogout })}
              className="mt-3 flex w-full items-center gap-4 rounded-[18px] border border-white bg-white p-5 shadow-sm transition-all active:scale-[0.98]"
            >
              <LogOut size={24} className="text-nav-accent" />
              <p className="text-[16px] font-bold text-nav-primary">로그아웃</p>
            </button>
          </div>
        ) : (
          /* ── 수정 모드 ── */
          <div className="animate-in zoom-in-95 duration-300 rounded-[28px] border border-white bg-white/75 px-7 pb-6 pt-7 shadow-xl shadow-blue-900/5 backdrop-blur-md">
            <div className="space-y-4">

              <DisabledInput label="이름" value={userInfo.name} icon={User} />
              <DisabledInput label="학번" value={userInfo.studentNo} icon={User} />
              <DisabledInput label="이메일" value={userInfo.email} icon={Mail} />

              {/* 생활관 선택 */}
              <div className="relative flex flex-col">
                <label className={LABEL_CLASS}>생활관</label>
                <button
                  type="button"
                  onClick={() => setOpenSelect(v => !v)}
                  className={`flex h-[54px] w-full items-center justify-between rounded-[18px] border-2 bg-white px-4 shadow-sm transition-all ${openSelect ? "border-nav-accent" : "border-white"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 size={18} className={openSelect ? "text-nav-accent" : "text-nav-inactive"} />
                    <span className="text-[14px] font-bold text-nav-primary">
                      {DORM_OPTIONS.find(o => o.id === String(editedInfo?.dormitoryId))?.name ?? "선택"}
                    </span>
                  </div>
                  <ChevronDown className={`size-4 text-nav-inactive transition-transform ${openSelect ? "rotate-180" : ""}`} />
                </button>

                {openSelect && editedInfo && (
                  <div className="absolute top-[70px] z-50 mt-2 w-full animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-2xl">
                    {DORM_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setEditedInfo(prev => prev ? { ...prev, dormitoryId: opt.id } : prev);
                          setOpenSelect(false);
                        }}
                        className="flex w-full items-center justify-between border-b border-slate-50 px-5 py-4 text-left text-[14px] font-bold text-nav-inactive transition-colors last:border-none hover:bg-nav-active-bg-from hover:text-nav-accent"
                      >
                        {opt.name}
                        {String(editedInfo.dormitoryId) === opt.id && <Check size={16} className="text-nav-accent" />}
                      </button>
                    ))}
                  </div>
                )}
                <div className="h-5" />
              </div>

              <EditInput label="호수" field="roomId" value={String(editedInfo?.roomId ?? "")} error={errors.roomId} icon={Home} onChange={v => handleEditChange("roomId", v)} />
              <EditInput label="전화번호" field="phone" value={editedInfo?.phone ?? ""} error={errors.phone} icon={Phone} onChange={v => handleEditChange("phone", v)} />

              {/* 비밀번호 변경 */}
              <div className="border-t border-slate-100 py-2">
                <p className="mb-4 inline-block rounded-full bg-nav-active-bg-from px-3 py-1.5 text-[11px] font-bold text-nav-accent">
                  비밀번호 변경 (선택)
                </p>
                <EditInput label="현재 비밀번호" field="current" value={passwords.current} error={errors.currentPw} icon={Lock} type="password" placeholder="현재 비밀번호 입력" onChange={v => handlePasswordChange("current", v)} />
                <EditInput label="새 비밀번호" field="new" value={passwords.new} error={errors.newPw} icon={KeyRound} type="password" placeholder="새 비밀번호 입력" onChange={v => handlePasswordChange("new", v)} />
                <EditInput label="새 비밀번호 확인" field="confirm" value={passwords.confirm} error={errors.confirmPw} icon={ShieldCheck} type="password" placeholder="다시 입력" onChange={v => handlePasswordChange("confirm", v)} />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="mb-4 h-[52px] w-full rounded-[16px] bg-nav-accent font-bold text-[16px] text-white shadow-lg transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
              >
                저장하기
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4 border-b border-[#f8fafc] pb-3 last:border-none last:pb-0">
      <div className="mt-0.5 text-nav-accent"><Icon size={18} /></div>
      <div>
        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-nav-inactive">{label}</p>
        <p className="text-[15px] font-bold text-nav-primary">{value}</p>
      </div>
    </div>
  );
}

interface DisabledInputProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

function DisabledInput({ label, value, icon: Icon }: DisabledInputProps) {
  return (
    <div className="flex flex-col">
      <label className={LABEL_CLASS}>{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
          <Icon size={16} className="text-nav-inactive" />
        </div>
        <input
          disabled
          value={value}
          className="h-[48px] w-full cursor-not-allowed rounded-[12px] border border-[#eef6f7] bg-[#f8fafc] pl-11 pr-4 text-[14px] font-bold text-nav-inactive"
        />
      </div>
      <div className="h-[18px]" />
    </div>
  );
}

interface EditInputProps {
  label: string;
  field: string;
  value: string;
  error?: string;
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

function EditInput({ label, value, error, icon: Icon, type = "text", placeholder, onChange }: EditInputProps) {
  return (
    <div className="flex flex-col">
      <label className={LABEL_CLASS}>{label}</label>
      <div className="group relative">
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
          <Icon size={16} className="text-nav-inactive transition-colors group-focus-within:text-nav-accent" />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-[48px] w-full rounded-[12px] border bg-white pl-11 pr-4 text-[14px] font-bold text-nav-primary transition-all focus:outline-none focus:border-nav-accent ${error ? "border-red-400" : "border-[#eef6f7]"
            }`}
        />
      </div>
      <div className="h-[18px]">
        {error && <p className="ml-1 mt-0.5 text-[10px] font-bold text-red-500">* {error}</p>}
      </div>
    </div>
  );
}