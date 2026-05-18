import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Search, MoreVertical, Loader2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  UserCircle, AlertCircle, Building2, ChevronDown, Check, X,
  Calendar, User, Mail, Phone, Home,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

// ─── 타입 ─────────────────────────────────────────────────

type AccountStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
type ComplaintStatus = "RECEIVED" | "COMPLETED";

interface SelectOption {
  v: string | number;
  l: string;
}

interface UserRow {
  userId: number;
  name: string;
  email: string;
  dormitoryId: number;
  roomId: number;
  accountStatus: AccountStatus;
  createdAt: string;
}

interface Complaint {
  complaintId: number;
  title: string;
  status: ComplaintStatus;
  createdAt: string;
}

interface Student {
  userId: number;
  name: string;
  email: string;
  studentNo: string;
  phone: string;
  dormitoryId: number;
  roomId: number;
  accountStatus: AccountStatus;
  createdAt: string;
  complaints?: Complaint[];
}

interface AlertState {
  show: boolean;
  title: string;
  message: string;
}

interface SelectBoxProps {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
}

interface DetailModalProps {
  userId: number;
  onClose: () => void;
}

interface InfoFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

// ─── 상수 ─────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ACCOUNT_STATUS_STYLES: Record<AccountStatus, string> = {
  ACTIVE: "bg-green-100 text-green-600",
  INACTIVE: "bg-gray-100 text-gray-500",
  BLOCKED: "bg-red-100 text-red-600",
};

const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  BLOCKED: "차단",
};

const COMPLAINT_STATUS_MAP: Record<ComplaintStatus, { label: string; style: string }> = {
  RECEIVED: { label: "대기 중", style: "bg-gray-100 text-gray-500" },
  COMPLETED: { label: "완료", style: "bg-green-100 text-green-600" },
};

const DORMITORY_OPTIONS: SelectOption[] = [
  { v: "전체", l: "전체 생활관" },
  { v: 1, l: "1생활관" },
  { v: 2, l: "2생활관" },
  { v: 3, l: "3생활관" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { v: "전체", l: "전체 상태" },
  { v: "ACTIVE", l: "활성" },
  { v: "INACTIVE", l: "비활성" },
  { v: "BLOCKED", l: "차단" },
];

const DUMMY_USERS: UserRow[] = [
  { userId: 1, name: "김철수", email: "kim@gachon.ac.kr", dormitoryId: 1, roomId: 301, accountStatus: "ACTIVE", createdAt: "2025-03-01T09:00:00" },
  { userId: 2, name: "이영희", email: "lee@gachon.ac.kr", dormitoryId: 2, roomId: 205, accountStatus: "ACTIVE", createdAt: "2025-03-05T10:00:00" },
  { userId: 3, name: "박민준", email: "park@gachon.ac.kr", dormitoryId: 1, roomId: 102, accountStatus: "INACTIVE", createdAt: "2025-03-10T11:00:00" },
  { userId: 4, name: "최수연", email: "choi@gachon.ac.kr", dormitoryId: 3, roomId: 410, accountStatus: "ACTIVE", createdAt: "2025-03-15T12:00:00" },
  { userId: 5, name: "정다은", email: "jung@gachon.ac.kr", dormitoryId: 2, roomId: 308, accountStatus: "BLOCKED", createdAt: "2025-03-20T13:00:00" },
];

const DUMMY_STUDENTS: Record<number, Student> = {
  1: { userId: 1, name: "김철수", email: "kim@gachon.ac.kr", studentNo: "202100001", phone: "010-1234-5678", dormitoryId: 1, roomId: 301, accountStatus: "ACTIVE", createdAt: "2025-03-01T09:00:00", complaints: [{ complaintId: 1, title: "화장실 수도꼭지 고장", status: "RECEIVED", createdAt: "2025-05-10T09:00:00" }] },
  2: { userId: 2, name: "이영희", email: "lee@gachon.ac.kr", studentNo: "202100002", phone: "010-2345-6789", dormitoryId: 2, roomId: 205, accountStatus: "ACTIVE", createdAt: "2025-03-05T10:00:00", complaints: [] },
  3: { userId: 3, name: "박민준", email: "park@gachon.ac.kr", studentNo: "202100003", phone: "010-3456-7890", dormitoryId: 1, roomId: 102, accountStatus: "INACTIVE", createdAt: "2025-03-10T11:00:00", complaints: [{ complaintId: 2, title: "소음 신고", status: "COMPLETED", createdAt: "2025-04-20T10:00:00" }] },
  4: { userId: 4, name: "최수연", email: "choi@gachon.ac.kr", studentNo: "202100004", phone: "010-4567-8901", dormitoryId: 3, roomId: 410, accountStatus: "ACTIVE", createdAt: "2025-03-15T12:00:00", complaints: [] },
  5: { userId: 5, name: "정다은", email: "jung@gachon.ac.kr", studentNo: "202100005", phone: "010-5678-9012", dormitoryId: 2, roomId: 308, accountStatus: "BLOCKED", createdAt: "2025-03-20T13:00:00", complaints: [] },
};

// ─── 유틸 ─────────────────────────────────────────────────

function getPageRange(current: number, total: number, maxButtons = 5): number[] {
  let start = Math.max(0, current - Math.floor(maxButtons / 2));
  let end = Math.min(total, start + maxButtons);
  if (end - start < maxButtons) start = Math.max(0, end - maxButtons);
  return Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i);
}

// ─── 커스텀 훅 ─────────────────────────────────────────────

function useAlert() {
  const [alert, setAlert] = useState<AlertState>({ show: false, title: "", message: "" });

  const triggerAlert = useCallback((title: string, message: string) => {
    setAlert({ show: true, title, message });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, show: false }));
  }, []);

  return { alert, triggerAlert, closeAlert };
}

function useStudents() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [dormitoryId, setDormitoryId] = useState<string | number>("전체");
  const [status, setStatus] = useState("전체");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    let filtered = [...DUMMY_USERS];
    if (keyword.trim()) {
      filtered = filtered.filter(u =>
        u.name.includes(keyword.trim()) || u.email.includes(keyword.trim())
      );
    }
    if (dormitoryId !== "전체") filtered = filtered.filter(u => u.dormitoryId === Number(dormitoryId));
    if (status !== "전체") filtered = filtered.filter(u => u.accountStatus === status);

    const start = page * PAGE_SIZE;
    const paged = filtered.slice(start, start + PAGE_SIZE);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    setUsers(paged);
    setTotalElements(filtered.length);
    setTotalPages(pages);
    setLoading(false);
  }, [page, keyword, dormitoryId, status]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    if (page === 0) fetchUsers();
  }, [fetchUsers, page]);

  const handleDormitoryChange = useCallback((v: string) => { setDormitoryId(v); setPage(0); }, []);
  const handleStatusChange = useCallback((v: string) => { setStatus(v); setPage(0); }, []);

  return {
    users, loading, totalElements, totalPages, page, keyword, dormitoryId, status,
    setPage, setKeyword,
    handleSearch, handleDormitoryChange, handleStatusChange,
  };
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────

function SelectBox({ label, value, options, onChange }: SelectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => String(opt.v) === String(value))?.l ?? "선택";

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="mb-1.5 ml-1 block text-[12px] font-bold text-nav-primary">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between rounded-[14px] border-2 px-4 py-3 outline-none transition-all ${isOpen ? "border-nav-accent bg-white shadow-md" : "border-transparent bg-[#f0f9ff]"
          }`}
      >
        <span className={`text-[14px] font-medium ${isOpen ? "text-nav-accent" : "text-nav-primary"}`}>
          {selectedLabel}
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-nav-accent" : "text-nav-inactive"}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-[100] mt-2 w-full animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden rounded-[18px] border border-nav-inactive/20 bg-white shadow-xl"
        >
          <div className="max-h-[200px] overflow-y-auto">
            {options.map(opt => {
              const isSelected = String(opt.v) === String(value);
              return (
                <li key={opt.v} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => { onChange(String(opt.v)); setIsOpen(false); }}
                    className={`flex w-full items-center justify-between border-b border-[#f8fafc] px-5 py-3.5 text-left text-[14px] font-medium transition-colors last:border-none ${isSelected
                      ? "bg-nav-active-bg-from text-nav-accent"
                      : "text-nav-primary hover:bg-[#f0f9ff] hover:text-nav-accent"
                      }`}
                  >
                    {opt.l}
                    {isSelected && <Check size={16} className="text-nav-accent" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </div>
        </ul>
      )}
    </div>
  );
}

function InfoField({ label, value, icon }: InfoFieldProps) {
  return (
    <div className="w-full">
      <p className="mb-1.5 ml-1 text-[12px] font-semibold text-nav-primary">{label}</p>
      <div className="flex items-center rounded-[14px] border border-transparent bg-[#f0f9ff] px-4 py-3 text-[14px] text-nav-primary">
        {icon && <span className="mr-2 text-nav-inactive" aria-hidden="true">{icon}</span>}
        <span className="font-medium">{value || "-"}</span>
      </div>
    </div>
  );
}

function StudentDetailModal({ userId, onClose }: DetailModalProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const found = DUMMY_STUDENTS[userId] ?? null;
    setStudent(found);
    setLoading(false);
  }, [userId]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-detail-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-nav-primary/40 backdrop-blur-[8px]" aria-hidden="true" />

      <div
        className="animate-in fade-in zoom-in duration-300 relative flex max-h-[85vh] w-[90%] max-w-2xl flex-col overflow-hidden rounded-[32px] bg-white/95 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between border-b border-nav-inactive/20 bg-white/50 px-8 py-6 backdrop-blur-sm">
          <div>
            <h2 id="student-detail-title" className="text-[22px] font-bold text-nav-primary">
              학생 상세 정보
            </h2>
            <p className="text-[12px] text-nav-inactive">ID: {userId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="group rounded-full p-3 transition-all hover:bg-gray-100"
          >
            <X className="size-6 text-nav-inactive transition-colors group-hover:text-red-500" aria-hidden="true" />
          </button>
        </div>

        {/* ── 바디 ── */}
        <div className="flex-1 space-y-8 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="size-10 animate-spin text-nav-accent" aria-label="로딩 중" />
              <p className="font-medium text-nav-inactive">정보를 불러오는 중입니다...</p>
            </div>
          ) : student ? (
            <>
              {/* 기본 정보 */}
              <section aria-labelledby="section-basic">
                <h3 id="section-basic" className="mb-4 flex items-center gap-2 text-[16px] font-bold text-nav-primary">
                  <User size={18} className="text-nav-accent" aria-hidden="true" /> 기본 정보
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoField label="이름" value={student.name} icon={<User size={16} />} />
                  <InfoField label="학번" value={student.studentNo} icon={<User size={16} />} />
                  <div className="md:col-span-2">
                    <InfoField label="이메일" value={student.email} icon={<Mail size={16} />} />
                  </div>
                  <div className="md:col-span-2">
                    <InfoField label="전화번호" value={student.phone} icon={<Phone size={16} />} />
                  </div>
                </div>
              </section>

              {/* 거주 및 계정 정보 */}
              <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4" aria-labelledby="section-room">
                  <h3 id="section-room" className="flex items-center gap-2 text-[16px] font-bold text-nav-primary">
                    <Building2 size={18} className="text-nav-accent" aria-hidden="true" /> 거주 정보
                  </h3>
                  <InfoField label="생활관" value={`${student.dormitoryId}동`} icon={<Building2 size={16} />} />
                  <InfoField label="호실" value={`${student.roomId}호`} icon={<Home size={16} />} />
                </div>
                <div className="space-y-4" aria-labelledby="section-account">
                  <h3 id="section-account" className="flex items-center gap-2 text-[16px] font-bold text-nav-primary">
                    <AlertCircle size={18} className="text-nav-accent" aria-hidden="true" /> 계정 상태
                  </h3>
                  <div>
                    <p className="mb-1.5 ml-1 text-[12px] font-semibold text-nav-primary">상태</p>
                    <span className={`inline-block rounded-full px-4 py-1.5 text-[13px] font-bold ${ACCOUNT_STATUS_STYLES[student.accountStatus] ?? "bg-gray-100 text-gray-500"
                      }`}>
                      {ACCOUNT_STATUS_LABELS[student.accountStatus] ?? student.accountStatus}
                    </span>
                  </div>
                  <div className="rounded-[16px] border border-nav-inactive/20 bg-[#f0f9ff] p-4">
                    <p className="mb-1 text-[11px] text-nav-inactive">최초 가입일</p>
                    <p className="flex items-center gap-2 text-[13px] font-medium text-nav-primary">
                      <Calendar size={14} aria-hidden="true" />
                      <time dateTime={student.createdAt}>
                        {new Date(student.createdAt).toLocaleString()}
                      </time>
                    </p>
                  </div>
                </div>
              </section>

              {/* 민원 내역 */}
              <section className="border-t border-nav-inactive/20 pt-8" aria-labelledby="section-complaints">
                <h3 id="section-complaints" className="mb-4 flex items-center gap-2 text-[16px] font-bold text-nav-primary">
                  <AlertCircle size={18} className="text-nav-accent" aria-hidden="true" /> 최근 민원 내역
                </h3>
                {student.complaints?.length ? (
                  <ul className="grid gap-3">
                    {student.complaints.map(c => {
                      const info = COMPLAINT_STATUS_MAP[c.status] ??
                        { label: c.status, style: "bg-gray-100 text-gray-500" };
                      return (
                        <li
                          key={c.complaintId}
                          className="flex items-center justify-between rounded-[16px] border border-white bg-[#f0f9ff] p-4 transition-all hover:border-nav-accent"
                        >
                          <div>
                            <p className="text-[14px] font-semibold text-nav-primary">{c.title}</p>
                            <time dateTime={c.createdAt} className="text-[11px] text-nav-inactive">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </time>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${info.style}`}>
                            {info.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-[16px] border border-dashed border-nav-inactive/40 bg-[#f0f9ff] py-10 text-center text-[13px] text-nav-inactive">
                    등록된 민원 내역이 없습니다.
                  </div>
                )}
              </section>
            </>
          ) : (
            <p role="alert" className="py-20 text-center text-red-400">
              데이터를 불러오지 못했습니다.
            </p>
          )}
        </div>

        {/* ── 푸터 ── */}
        <div className="border-t border-nav-inactive/20 bg-white p-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[20px] bg-nav-accent py-4 font-bold text-white shadow-lg transition-all hover:bg-nav-accent/90 active:scale-[0.98]"
          >
            확인 후 닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function AdminStudents() {
  const navigate = useNavigate();
  const { alert, triggerAlert, closeAlert } = useAlert();

  const {
    users, loading, totalElements, totalPages, page, keyword, dormitoryId, status,
    setPage, setKeyword,
    handleSearch, handleDormitoryChange, handleStatusChange,
  } = useStudents();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const pageRange = getPageRange(page, totalPages);
  const isFirstPage = page === 0 || totalPages === 0;
  const isLastPage = page >= totalPages - 1 || totalPages === 0;

  return (
    <AdminLayout>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#f0f9ff]">

        {/* ── 페이지 헤더 ── */}
        <div className="border-b border-nav-inactive/20 bg-white px-8 py-6">
          <h1 className="text-[32px] font-bold text-nav-primary">학생 관리</h1>
          <p className="mt-1 text-[14px] text-nav-inactive">
            가입된 학생 정보를 확인하고 계정 상태를 관리하세요. (총 {totalElements.toLocaleString()}명)
          </p>
        </div>

        <div className="w-full min-w-0 p-8">

          {/* ── 검색 바 ── */}
          <div className="mb-8 min-w-0 rounded-[24px] border border-[#f1f5f9] bg-white p-4 shadow-sm md:p-8">
            <form onSubmit={handleSearch} className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-end lg:gap-5">
              <div className="flex flex-1 flex-col lg:flex-[3]">
                <label htmlFor="keyword" className="mb-2 ml-1 text-[13px] font-bold text-nav-primary">
                  검색어
                </label>
                <div className="relative h-[50px] md:h-[54px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-nav-inactive" aria-hidden="true" />
                  <input
                    id="keyword"
                    type="search"
                    placeholder="이름 또는 이메일 검색"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    className="h-full w-full rounded-[16px] border-2 border-transparent bg-[#f0f9ff] pl-11 pr-4 text-[14px] font-medium text-nav-primary outline-none transition-all placeholder:text-nav-inactive focus:border-nav-accent focus:bg-white md:text-[15px]"
                  />
                </div>
              </div>

              <div className="flex flex-[2] flex-wrap items-end gap-3 sm:flex-nowrap">
                <div className="min-w-[120px] flex-1">
                  <SelectBox label="생활관" value={dormitoryId} options={DORMITORY_OPTIONS} onChange={handleDormitoryChange} />
                </div>
                <div className="min-w-[120px] flex-1">
                  <SelectBox label="상태" value={status} options={STATUS_OPTIONS} onChange={handleStatusChange} />
                </div>
                <button
                  type="submit"
                  className="h-[50px] w-full whitespace-nowrap rounded-[14px] bg-nav-accent px-6 font-bold text-white shadow-md transition-all hover:bg-nav-accent/90 active:scale-[0.98] sm:w-auto md:h-[54px]"
                >
                  검색
                </button>
              </div>
            </form>
          </div>

          {/* ── 유저 테이블 (데스크탑) ── */}
          <div className="mb-6 hidden overflow-hidden rounded-[16px] border border-[#f1f5f9] bg-white shadow-sm lg:block">
            <table className="w-full table-fixed">
              <thead className="bg-[#f0f9ff]">
                <tr>
                  <th scope="col" className="w-[35%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive">사용자 정보</th>
                  <th scope="col" className="w-[18%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive">생활관</th>
                  <th scope="col" className="w-[17%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive">계정 상태</th>
                  <th scope="col" className="w-[20%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive">가입일</th>
                  <th scope="col" className="w-[10%] px-4 py-4 text-right text-[13px] font-semibold text-nav-inactive">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nav-inactive/20">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="mx-auto animate-spin text-nav-accent" aria-label="로딩 중" />
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <tr
                      key={user.userId}
                      onClick={() => setSelectedUserId(user.userId)}
                      tabIndex={0}
                      onKeyDown={e => e.key === "Enter" && setSelectedUserId(user.userId)}
                      aria-label={`${user.name} 상세 보기`}
                      className="cursor-pointer transition-colors hover:bg-[#f0f9ff]"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="shrink-0 rounded-full bg-nav-active-bg-from p-2 text-nav-accent">
                            <UserCircle size={20} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold text-nav-primary">{user.name}</p>
                            <p className="truncate text-[11px] text-nav-inactive">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-nav-primary">
                        {user.dormitoryId}동 {user.roomId}호
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${ACCOUNT_STATUS_STYLES[user.accountStatus] ?? "bg-gray-100 text-gray-500"}`}>
                          {ACCOUNT_STATUS_LABELS[user.accountStatus] ?? user.accountStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[12px] text-nav-inactive">
                        <time dateTime={user.createdAt}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </time>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedUserId(user.userId); }}
                          aria-label={`${user.name} 상세 정보 보기`}
                          className="rounded-lg p-2 text-nav-accent transition-colors hover:bg-nav-accent/10"
                        >
                          <MoreVertical size={18} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-nav-inactive">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── 유저 카드 리스트 (모바일) ── */}
          <div className="mb-6 space-y-3 lg:hidden">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-nav-accent" aria-label="로딩 중" />
              </div>
            ) : users.length > 0 ? (
              users.map(user => (
                <div
                  key={user.userId}
                  onClick={() => setSelectedUserId(user.userId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && setSelectedUserId(user.userId)}
                  aria-label={`${user.name} 상세 보기`}
                  className="cursor-pointer rounded-[20px] border border-transparent bg-white p-5 shadow-sm transition-all hover:border-nav-accent/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-nav-active-bg-from p-2 text-nav-accent">
                        <UserCircle size={24} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-nav-primary">{user.name}</p>
                        <p className="text-[12px] text-nav-inactive">{user.email}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${ACCOUNT_STATUS_STYLES[user.accountStatus] ?? "bg-gray-100 text-gray-500"}`}>
                      {ACCOUNT_STATUS_LABELS[user.accountStatus] ?? user.accountStatus}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#f0f7f8] pt-3 text-[12px] text-nav-inactive">
                    <span>{user.dormitoryId}동 {user.roomId}호</span>
                    <time dateTime={user.createdAt}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-nav-inactive">
                검색 결과가 없습니다.
              </div>
            )}
          </div>

          {/* ── 페이지네이션 ── */}
          <nav className="flex items-center justify-center gap-2 pb-10" aria-label="페이지 탐색">
            <button disabled={isFirstPage} onClick={() => setPage(0)} aria-label="첫 페이지" className="rounded-lg p-2 text-nav-primary transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"><ChevronsLeft size={20} aria-hidden="true" /></button>
            <button disabled={isFirstPage} onClick={() => setPage(page - 1)} aria-label="이전 페이지" className="rounded-lg p-2 text-nav-primary transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={20} aria-hidden="true" /></button>

            {pageRange.map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                aria-label={`${pageNum + 1}페이지`}
                aria-current={page === pageNum ? "page" : undefined}
                className={`h-10 w-10 rounded-lg text-[14px] font-bold transition-all ${page === pageNum
                  ? "bg-nav-accent text-white shadow-sm"
                  : "bg-white text-nav-inactive hover:bg-nav-active-bg-from"
                  }`}
              >
                {pageNum + 1}
              </button>
            ))}

            <button disabled={isLastPage} onClick={() => setPage(page + 1)} aria-label="다음 페이지" className="rounded-lg p-2 text-nav-primary transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={20} aria-hidden="true" /></button>
            <button disabled={isLastPage} onClick={() => setPage(totalPages - 1)} aria-label="마지막 페이지" className="rounded-lg p-2 text-nav-primary transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"><ChevronsRight size={20} aria-hidden="true" /></button>
          </nav>
        </div>
      </div>

      {/* ── 알림 모달 ── */}
      {alert.show && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-title"
          className="fixed inset-0 z-[100] flex items-center justify-center px-8"
          onClick={closeAlert}
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
                {alert.title}
              </h2>
              <p className="mb-6 whitespace-pre-wrap text-[14px] font-medium leading-relaxed text-nav-accent">
                {alert.message}
              </p>
              <button
                onClick={closeAlert}
                className="h-[50px] w-full rounded-[18px] bg-nav-accent font-bold text-white shadow-md transition-all active:scale-[0.96]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 학생 상세 모달 ── */}
      {selectedUserId !== null && (
        <StudentDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </AdminLayout>
  );
}