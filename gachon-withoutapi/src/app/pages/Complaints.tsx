import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import { Plus, Loader2, Check, AlertCircle } from "lucide-react";

// ─── 타입 ─────────────────────────────────────────────────

interface ComplaintImage {
  complaintImageId: number;
  fileUrl: string;
  originalName: string;
}

interface Complaint {
  complaintId: number;
  category: string;
  title: string;
  status: "RECEIVED" | "COMPLETED";
  createdAt: string;
}

interface ComplaintDetail extends Complaint {
  content: string;
  queueNo?: number;
  adminComment?: string;
  images?: ComplaintImage[];
}

interface EditState {
  id: number;
  title: string;
  content: string;
  category: string;
}

type AlertState =
  | { show: false }
  | { show: true; message: string; isConfirm: false }
  | { show: true; message: string; isConfirm: true; targetId: number };

// ─── 상수 ─────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  FACILITY: "시설 수리",
  RULE: "생활 규칙",
  CLEANING: "청소",
  NOISE: "소음",
  ETC: "기타",
};

const TABS = ["전체", "대기중", "완료"] as const;
type Tab = typeof TABS[number];

const TAB_STATUS: Record<Tab, string | null> = {
  전체: null,
  대기중: "RECEIVED",
  완료: "COMPLETED",
};

const STATUS_STYLE: Record<string, string> = {
  RECEIVED: "bg-nav-active-bg-from text-nav-accent",
  COMPLETED: "bg-[#e2f1e5] text-[#78c087]",
};

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: "대기중",
  COMPLETED: "완료",
};

const formatDate = (iso: string) =>
  iso.split("T")[0].replace(/-/g, ". ") + ".";

const FAKE_COMPLAINTS: Complaint[] = [
  { complaintId: 1, category: "FACILITY", title: "화장실 수도꼭지 고장", status: "RECEIVED", createdAt: "2025-04-01T10:00:00" },
  { complaintId: 2, category: "NOISE", title: "윗층 소음 문제", status: "RECEIVED", createdAt: "2025-04-05T14:30:00" },
  { complaintId: 3, category: "CLEANING", title: "복도 청소 요청", status: "COMPLETED", createdAt: "2025-03-20T09:00:00" },
];

const FAKE_DETAILS: Record<number, ComplaintDetail> = {
  1: { complaintId: 1, category: "FACILITY", title: "화장실 수도꼭지 고장", status: "RECEIVED", createdAt: "2025-04-01T10:00:00", content: "3층 남자 화장실 두 번째 칸 수도꼭지가 잠기지 않습니다.", queueNo: 2 },
  2: { complaintId: 2, category: "NOISE", title: "윗층 소음 문제", status: "RECEIVED", createdAt: "2025-04-05T14:30:00", content: "매일 밤 11시 이후 윗층에서 뛰는 소리가 납니다.", queueNo: 5 },
  3: { complaintId: 3, category: "CLEANING", title: "복도 청소 요청", status: "COMPLETED", createdAt: "2025-03-20T09:00:00", content: "2층 복도 끝쪽에 쓰레기가 방치되어 있습니다.", adminComment: "확인 후 조치 완료하였습니다. 감사합니다." },
};

// ─── API 에러 파싱 유틸 ───────────────────────────────────

function parseApiError(error: any, fallback: string): string {
  return error.response?.data?.message ?? fallback;
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function Complaints() {
  const navigate = useNavigate();

  const [isLoggedIn] = useState(() => sessionStorage.getItem("isLoggedIn") === "true");
  const [activeTab, setActiveTab] = useState<Tab>("전체");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [details, setDetails] = useState<Record<number, ComplaintDetail>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [alert, setAlert] = useState<AlertState>({ show: false });
  const [isSaving, setIsSaving] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth/login");
  }, [isLoggedIn, navigate]);

  // ── 목록 조회 ──
  const fetchComplaints = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));

    const status = TAB_STATUS[activeTab];
    const filtered = status
      ? FAKE_COMPLAINTS.filter(c => c.status === status)
      : FAKE_COMPLAINTS;
    setComplaints(filtered);
    setLoading(false);
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    if (isLoggedIn) fetchComplaints();
  }, [isLoggedIn, fetchComplaints]);

  // ── 상세 조회 + 토글 ──
  const handleExpand = useCallback(async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (details[id]) return;

    const fakeDetail = FAKE_DETAILS[id];
    if (fakeDetail) {
      setDetails(prev => ({ ...prev, [id]: fakeDetail }));
    } else {
      setAlert({ show: true, isConfirm: false, message: "존재하지 않는 민원입니다." });
      setExpandedId(null);
    }
  }, [expandedId, details]);

  // ── 수정 저장 ──
  const handleSave = useCallback(async (id: number) => {
    if (!editState) return;
    setIsSaving(true);
    await new Promise(res => setTimeout(res, 600));

    setComplaints(prev =>
      prev.map(c => c.complaintId === id ? { ...c, title: editState.title } : c)
    );
    setDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], title: editState.title, content: editState.content, category: editState.category },
    }));
    setAlert({ show: true, isConfirm: false, message: "수정되었습니다." });
    setEditState(null);
    setNewImageFiles([]);
    setIdsToDelete([]);
    setIsSaving(false);
  }, [editState, idsToDelete, newImageFiles, fetchComplaints]);

  // ── 삭제 실행 ──
  const handleDelete = useCallback(async (targetId: number) => {
    await new Promise(res => setTimeout(res, 400));
    setComplaints(prev => prev.filter(c => c.complaintId !== targetId));
    setDetails(prev => { const next = { ...prev }; delete next[targetId]; return next; });
    setAlert({ show: false });
    setExpandedId(null);
  }, [fetchComplaints]);

  const confirmDelete = useCallback((id: number) => {
    setAlert({ show: true, isConfirm: true, message: "정말 삭제하시겠습니까?", targetId: id });
  }, []);

  if (!isLoggedIn) return null;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col overflow-x-hidden bg-[#f0f9ff] font-sans shadow-2xl antialiased">

      {/* ── 알림 모달 ── */}
      {alert.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-nav-primary/20 px-8 backdrop-blur-[3px]">
          <div className="w-full max-w-[320px] animate-in fade-in zoom-in duration-200 rounded-[28px] bg-white p-7 shadow-2xl">
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
                      onClick={() => handleDelete(alert.targetId)}
                      className="h-[50px] flex-1 rounded-[18px] bg-nav-accent font-bold text-white shadow-md transition-all active:scale-[0.96]"
                    >
                      확인
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAlert({ show: false })}
                    className="h-[50px] w-full rounded-[18px] bg-nav-accent font-bold text-white shadow-md transition-all active:scale-[0.96]"
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
      <div className="shrink-0 bg-[#f0f9ff] px-7 pb-6 pt-16">
        <h1 className="text-[28px] font-bold tracking-tight text-nav-primary">민원 접수</h1>
        <p className="mt-1 text-[13px] font-bold tracking-tight text-nav-inactive">
          불편사항을 접수하고 현황을 확인하세요
        </p>
      </div>

      {/* ── 탭 ── */}
      <div className="mb-6 flex shrink-0 gap-2 px-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-[44px] flex-1 rounded-[18px] text-[12px] font-bold shadow-sm transition-all ${activeTab === tab
              ? "bg-nav-accent text-white shadow-nav-accent/20"
              : "border border-[#eef6f7] bg-white text-nav-inactive"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── 리스트 ── */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-40">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto animate-spin text-nav-accent" />
          </div>
        ) : complaints.length > 0 ? (
          complaints.map(c => {
            const detail = details[c.complaintId];
            const isExpanded = expandedId === c.complaintId;
            const isEditing = editState?.id === c.complaintId;

            return (
              <div
                key={c.complaintId}
                className="overflow-hidden rounded-[24px] border border-[#eef6f7] bg-white p-6 shadow-sm transition-all"
              >
                {isEditing ? (
                  // ── 수정 모드 ──
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editState.title}
                      onChange={e => setEditState(prev => prev ? { ...prev, title: e.target.value } : prev)}
                      className="w-full rounded-[12px] border border-[#eef6f7] bg-[#f8fbff] px-4 py-2 text-[15px] font-bold text-nav-primary focus:border-nav-accent focus:outline-none"
                    />
                    <textarea
                      value={editState.content}
                      onChange={e => setEditState(prev => prev ? { ...prev, content: e.target.value } : prev)}
                      className="w-full min-h-[100px] resize-none rounded-[12px] border border-[#eef6f7] bg-[#f8fbff] px-4 py-3 text-[13px] text-nav-primary focus:border-nav-accent focus:outline-none"
                    />

                    {/* 기존 이미지 */}
                    {detail?.images && detail.images.length > 0 && (
                      <div>
                        <p className="mb-2 text-[12px] font-bold text-nav-accent">등록한 사진</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {detail.images
                            .filter(img => !idsToDelete.includes(img.complaintImageId))
                            .map(img => (
                              <div key={img.complaintImageId} className="relative">
                                <img src={img.fileUrl} className="h-16 w-16 rounded-lg border border-[#eef6f7] object-cover" alt="첨부이미지" />
                                <button
                                  onClick={() => setIdsToDelete(prev => [...prev, img.complaintImageId])}
                                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
                                >
                                  X
                                </button>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {/* 이미지 추가 */}
                    <div className="pt-2">
                      <label className="mb-2 block text-[12px] font-bold text-nav-accent">사진 추가</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => e.target.files && setNewImageFiles(Array.from(e.target.files))}
                        className="w-full text-[12px] text-nav-primary file:mr-4 file:rounded-[12px] file:border-0 file:bg-nav-active-bg-from file:px-4 file:py-2 file:text-[11px] file:font-bold file:text-nav-accent hover:file:bg-nav-active-bg-to"
                      />
                      {newImageFiles.length > 0 && (
                        <p className="mt-1 text-[11px] font-medium text-nav-inactive">{newImageFiles.length}개의 파일 선택됨</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSave(c.complaintId)}
                        disabled={isSaving}
                        className="flex-1 rounded-[12px] bg-nav-accent py-3 text-[13px] font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSaving ? "저장 중..." : "저장"}
                      </button>
                      <button
                        onClick={() => setEditState(null)}
                        className="flex-1 rounded-[12px] border border-[#eef6f7] bg-white py-3 text-[13px] font-bold text-nav-inactive transition-all active:scale-95"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── 카드 뷰 ──
                  <div onClick={() => handleExpand(c.complaintId)} className="cursor-pointer">
                    <h3 className="mb-1 text-[18px] font-bold text-nav-primary">{c.title}</h3>

                    {isExpanded && (
                      <p className="mb-4 text-[14px] leading-relaxed text-nav-inactive">
                        {detail ? detail.content : "내용을 불러오는 중..."}
                      </p>
                    )}

                    {/* 이미지 */}
                    {isExpanded && detail?.images && detail.images.length > 0 && (
                      <div className="scrollbar-hide mb-2 flex gap-2 overflow-x-auto pb-4">
                        {detail.images.map(img => (
                          <img
                            key={img.complaintImageId}
                            src={img.fileUrl}
                            className="h-20 w-20 rounded-xl border border-[#eef6f7] object-cover"
                            alt="첨부이미지"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}

                    {/* 대기 순번 */}
                    {isExpanded && detail?.queueNo && detail.status === "RECEIVED" && (
                      <div className="mb-5 inline-block rounded-full bg-[#fff9c4] px-3 py-1.5 text-[12px] font-bold text-[#8c7b00]">
                        대기 순서: {detail.queueNo}번째
                      </div>
                    )}

                    {/* 관리자 답변 */}
                    {isExpanded && detail?.adminComment && (
                      <div className="mb-5 rounded-[16px] border border-[#e3f2fd] bg-[#f4faff] p-4">
                        <p className="mb-1 text-[11px] font-bold text-nav-accent">관리자 답변</p>
                        <p className="text-[13px] font-semibold leading-relaxed text-nav-primary">
                          {detail.adminComment}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between border-t border-[#eef6f7] pt-3">
                      <div className="flex gap-3 text-[12px] font-medium text-nav-inactive">
                        <span>{CATEGORY_MAP[c.category] ?? c.category}</span>
                        <span>{formatDate(c.createdAt)}</span>
                      </div>
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[c.status]}`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>

                    {/* 수정/삭제 버튼 */}
                    {isExpanded && c.status === "RECEIVED" && (
                      <div className="mt-4 flex animate-in fade-in zoom-in-95 gap-2 border-t border-[#f8fbff] pt-4">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditState({
                              id: c.complaintId,
                              title: detail?.title ?? c.title,
                              content: detail?.content ?? "",
                              category: detail?.category ?? c.category,
                            });
                            setIdsToDelete([]);
                            setNewImageFiles([]);
                          }}
                          className="flex-1 rounded-[12px] border border-[#eef6f7] bg-[#f8fbff] py-2.5 text-[12px] font-bold text-nav-accent transition-all active:scale-95"
                        >
                          수정
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); confirmDelete(c.complaintId); }}
                          className="flex-1 rounded-[12px] border border-[#ffe3e3] bg-[#fff5f5] py-2.5 text-[12px] font-bold text-[#ff6b6b] transition-all active:scale-95"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center text-[13px] font-bold text-nav-inactive">건의사항이 없습니다.</div>
        )}
      </div>

      {/* ── 새 민원 버튼 ── */}
      <div className="pointer-events-none fixed bottom-[100px] z-30 flex w-full max-w-[448px] justify-end px-6">
        <button
          onClick={() => navigate("/complaints/submit")}
          className="pointer-events-auto flex items-center gap-2 rounded-[20px] bg-nav-accent px-6 py-4 font-bold text-white shadow-lg shadow-nav-accent/30 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>새 민원 접수</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}