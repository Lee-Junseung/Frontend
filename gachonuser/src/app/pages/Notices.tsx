import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, ChevronDown, ExternalLink, Loader2, AlertCircle, Plus } from "lucide-react";
import BottomNav from "../components/BottomNav";
import api from "../api/axios";

// ─── 타입 ─────────────────────────────────────────────────

interface NoticeItem {
  noticeId: number;
  title: string;
  summaryText: string;
  postedAt: string;
}

interface NoticeDetail extends NoticeItem {
  content: string;
  sourceUrl: string;
  targetInfo?: string;
  scheduleInfo?: string;
  cautionInfo?: string;
}

// ─── 상수 ─────────────────────────────────────────────────

const PAGE_SIZE = 10;
const formatDate = (date: string) => date.replace(/-/g, ". ");

// ─── API 에러 파싱 유틸 ───────────────────────────────────

function parseApiError(error: any, fallback: string): string {
  return error.response?.data?.message ?? fallback;
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────

interface DetailInfoRowProps {
  label: string;
  value: string;
  isWarning?: boolean;
}

function DetailInfoRow({ label, value, isWarning = false }: DetailInfoRowProps) {
  return (
    <div className={`rounded-xl border p-3 ${isWarning ? "border-[#ffe3e3] bg-[#fff5f5]" : "border-[#eef6f7] bg-[#f8fafc]"
      }`}>
      <p className={`mb-1 text-[11px] font-bold ${isWarning ? "text-[#ff6b6b]" : "text-nav-accent"}`}>
        {label}
      </p>
      <p className="text-[13px] font-bold text-nav-primary/70">{value}</p>
    </div>
  );
}

interface NoticeCardProps {
  item: NoticeItem;
  isExpanded: boolean;
  detail: NoticeDetail | undefined;
  isDetailLoading: boolean;
  hasError: boolean;
  onToggle: () => void;
  onRetry: () => void;
}

function NoticeCard({
  item, isExpanded, detail, isDetailLoading, hasError, onToggle, onRetry,
}: NoticeCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`cursor-pointer rounded-[24px] border bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ${isExpanded ? "border-nav-accent shadow-md" : "border-white"
        }`}
    >
      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-[16px] font-bold leading-snug text-nav-primary">{item.title}</h3>
          <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-relaxed text-nav-accent">
            {item.summaryText}
          </p>
          <div className="mt-3 flex items-center text-[11px] font-bold text-nav-inactive">
            <Calendar size={12} className="mr-1" />
            {formatDate(item.postedAt)}
          </div>
        </div>
        <div className={`mt-1 transition-all duration-300 ${isExpanded ? "rotate-180 text-nav-accent" : "text-nav-inactive"
          }`}>
          <ChevronDown size={22} />
        </div>
      </div>

      {/* ── 상세 영역 ── */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "mt-4 max-h-[2000px] border-t border-[#eef6f7] pt-4" : "max-h-0"
        }`}>
        {detail ? (
          // 데이터 있음
          <div className="animate-in fade-in space-y-4 duration-500">
            <div className="grid grid-cols-1 gap-2">
              {detail.scheduleInfo && <DetailInfoRow label="일정" value={detail.scheduleInfo} />}
              {detail.targetInfo && <DetailInfoRow label="대상자" value={detail.targetInfo} />}
              {detail.cautionInfo && <DetailInfoRow label="유의사항" value={detail.cautionInfo} isWarning />}
            </div>
            <div className="rounded-xl border border-[#eef6f7] bg-white p-4">
              <p className="whitespace-pre-line text-[13.5px] font-medium leading-[1.7] text-nav-primary/60">
                {detail.content}
              </p>
            </div>
            <a
              href={detail.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-nav-active-bg-from py-3 text-[13px] font-bold text-nav-accent transition-all active:scale-[0.98]"
            >
              <ExternalLink size={14} />
              공지 원문 링크
            </a>
          </div>
        ) : isDetailLoading ? (
          // 로딩 중
          <div className="flex animate-pulse flex-col items-center justify-center py-10 text-nav-accent">
            <Loader2 className="mb-2 animate-spin" size={24} />
            <p className="text-[13px] font-bold">AI가 내용을 분석하고 있습니다...</p>
          </div>
        ) : hasError ? (
          // 에러
          <div className="flex flex-col items-center justify-center py-10 text-nav-inactive">
            <AlertCircle size={24} className="mb-2 opacity-50" />
            <p className="text-[13px] font-bold">내용을 불러오지 못했습니다.</p>
            <button
              onClick={e => { e.stopPropagation(); onRetry(); }}
              className="mt-2 text-[12px] font-bold text-nav-accent underline"
            >
              다시 시도하기
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function Notices() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [details, setDetails] = useState<Record<number, NoticeDetail>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [detailErrors, setDetailErrors] = useState<Record<number, boolean>>({});

  // ── 목록 로드 ──
  const fetchNotices = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    try {
      const response = await api.get("/notices", {
        params: { page: targetPage, size: PAGE_SIZE },
      });

      if (response.data.code === 200) {
        const newData: NoticeItem[] = response.data.data;
        // 빈 배열이거나 PAGE_SIZE보다 적으면 마지막 페이지
        if (newData.length === 0 || newData.length < PAGE_SIZE) setHasMore(false);
        if (newData.length > 0) setNotices(prev => [...prev, ...newData]);
      }
    } catch (error: any) {
      const status = error.response?.status;

      const message =
        status === 400 ? "잘못된 요청입니다.\n페이지 파라미터를 확인해주세요." :
          "공지사항을 불러오지 못했습니다.\n잠시 후 다시 시도해주세요.";
      setAlertMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotices(0); }, [fetchNotices]);

  // ── 더보기: page state 변경 → useEffect로 fetch ──
  const handleLoadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (page === 0) return; // 초기 로드는 위 useEffect가 담당
    fetchNotices(page);
  }, [page, fetchNotices]);

  // ── 상세 토글 ──
  const toggleNotice = useCallback(async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (details[id]) return;

    setIsDetailLoading(true);
    try {
      const response = await api.get(`/notices/${id}`);

      if (response.data.code === 200) {
        const detailData = response.data.data;
        setDetails(prev => ({ ...prev, [id]: detailData }));
        // 성공 시 에러 상태 초기화
        setDetailErrors(prev => ({ ...prev, [id]: false }));
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      // 카드를 닫지 않고 인라인 에러 UI 표시
      setDetailErrors(prev => ({ ...prev, [id]: true }));
    } finally {
      setIsDetailLoading(false);
    }
  }, [expandedId, details]);

  // ── 통계 ──
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentMonth = now.getMonth() + 1;

    return {
      currentMonth,
      weeklyCount: notices.filter(n => new Date(n.postedAt) >= oneWeekAgo).length,
      monthlyCount: notices.filter(n => {
        const d = new Date(n.postedAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() + 1 === currentMonth;
      }).length,
    };
  }, [notices]);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col bg-[#f0f9ff] font-sans shadow-2xl antialiased">
      <div className="fixed inset-0 mx-auto max-w-[448px] -z-10 bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#f8fafc]" />

      {/* ── 헤더 ── */}
      <div className="shrink-0 px-8 pb-5 pt-14">
        <h1 className="text-[28px] font-bold tracking-tight text-nav-primary">학생생활관 공지</h1>
        <p className="mt-1 text-[13px] font-bold tracking-tight text-nav-inactive">
          공지사항의 핵심만 알려드려요
        </p>
      </div>

      {/* ── 요약 카드 ── */}
      <div className="relative z-10 mb-6 shrink-0 px-6">
        <div className="w-full rounded-[28px] bg-nav-accent px-8 py-6 shadow-lg">
          <p className="mb-1 text-[14px] font-bold tracking-tight text-white/90">최근 7일 공지</p>
          <h2 className="mb-1 text-[32px] font-bold text-white">{stats.weeklyCount}건</h2>
          <p className="text-[13px] font-bold tracking-tight text-white/80">
            {stats.currentMonth}월 총 {stats.monthlyCount}건의 공지사항
          </p>
        </div>
      </div>

      {/* ── 리스트 ── */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {isLoading && notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-nav-accent">
            <Loader2 className="mb-2 animate-spin" size={32} />
            <p className="text-[14px] font-bold">공지사항을 가져오는 중...</p>
          </div>
        ) : (
          <>
            {notices.map(item => (
              <NoticeCard
                key={item.noticeId}
                item={item}
                isExpanded={expandedId === item.noticeId}
                detail={details[item.noticeId]}
                isDetailLoading={isDetailLoading && expandedId === item.noticeId}
                hasError={!!detailErrors[item.noticeId]}
                onToggle={() => toggleNotice(item.noticeId)}
                onRetry={() => {
                  // 재시도 시 에러 상태 초기화 후 재요청
                  setDetailErrors(prev => ({ ...prev, [item.noticeId]: false }));
                  setDetails(prev => {
                    const next = { ...prev };
                    delete next[item.noticeId];
                    return next;
                  });
                  toggleNotice(item.noticeId);
                }}
              />
            ))}

            {/* 더보기 버튼 */}
            {hasMore && (
              <div className="pb-6 pt-2">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-nav-accent/20 bg-white/60 py-4 text-[14px] font-bold text-nav-accent backdrop-blur-sm transition-all hover:bg-nav-accent hover:text-white active:scale-95 disabled:opacity-50"
                >
                  {isLoading
                    ? <Loader2 className="animate-spin" size={18} />
                    : <><Plus size={18} />공지사항 더보기</>
                  }
                </button>
              </div>
            )}

            {!hasMore && notices.length > 0 && (
              <p className="py-6 text-center text-[12px] font-bold text-nav-inactive">
                마지막 공지사항입니다.
              </p>
            )}
          </>
        )}
      </div>

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

      <BottomNav />
    </div>
  );
}