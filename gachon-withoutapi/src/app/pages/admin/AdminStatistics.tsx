import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Users, Clock, UserCheck, AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
} from "recharts";
import AdminLayout from "../../components/AdminLayout";

// ─── 타입 ─────────────────────────────────────────────────

interface DailyStat {
  date: string;
  count: number;
}

interface TopQuestion {
  question: string;
  count: number;
}

interface StatResponse {
  totalChats: number;
  memberUserCount: number;
  guestSessionCount: number;
  avgResponseTime: number;
  dailyStats: DailyStat[];
  topQuestions: TopQuestion[];
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface AlertState {
  show: boolean;
  title: string;
  message: string;
}

// ─── 상수 ─────────────────────────────────────────────────

const FALLBACK_STATS: StatResponse = {
  totalChats: 0,
  memberUserCount: 0,
  guestSessionCount: 0,
  avgResponseTime: 0,
  dailyStats: [],
  topQuestions: [],
};

// 차트 내부는 CSS 변수 직접 참조 불가 → hex 상수로 분리
const CHART_COLORS = {
  accent: "#5eb9ca",
  inactive: "#92a4a6",
  grid: "#e6f4f6",
} as const;

const DUMMY_STATS: StatResponse = {
  totalChats: 1284,
  memberUserCount: 832,
  guestSessionCount: 452,
  avgResponseTime: 320,
  dailyStats: Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 80) + 20,
    };
  }),
  topQuestions: [
    { question: "외박 신청은 어떻게 하나요?", count: 142 },
    { question: "세탁기 사용 방법이 궁금해요", count: 118 },
    { question: "식당 운영 시간이 언제인가요?", count: 97 },
    { question: "택배 수령 장소가 어디인가요?", count: 85 },
    { question: "귀사 시간이 몇 시인가요?", count: 76 },
    { question: "에어컨 사용 가능한가요?", count: 65 },
    { question: "방 청소 일정이 어떻게 되나요?", count: 58 },
    { question: "공용 냉장고 이용 방법은?", count: 51 },
    { question: "인터넷 연결이 안 돼요", count: 47 },
    { question: "주차 신청은 어디서 하나요?", count: 43 },
  ],
};

// ─── 유틸 ─────────────────────────────────────────────────

function getDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function toPercentage(count: number, total: number): string {
  if (total === 0) return "0";
  return ((count / total) * 100).toFixed(1);
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

function useStatistics() {
  const [stats, setStats] = useState<StatResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const sorted = [...DUMMY_STATS.dailyStats].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setStats({ ...DUMMY_STATS, dailyStats: sorted });
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, fetchStats };
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────

function SummaryCard({ title, value, icon: Icon, color }: SummaryCardProps) {
  return (
    <div className="flex h-full items-center gap-3 rounded-[16px] border border-white bg-white p-4 shadow-sm">
      <div className={`flex size-12 min-w-[48px] shrink-0 items-center justify-center rounded-[12px] text-white ${color}`}>
        <Icon size={24} strokeWidth={2.5} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium leading-tight text-nav-inactive sm:text-[13px]">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[16px] font-bold text-nav-primary sm:text-[20px]">
          {value}
        </p>
      </div>
    </div>
  );
}

function DailyStatsChart({ data }: { data: DailyStat[] }) {
  return (
    <div className="rounded-[16px] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-[18px] font-bold text-nav-primary">일별 질문 수 추이</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="date" tick={{ fill: CHART_COLORS.inactive, fontSize: 11 }} />
            <YAxis tick={{ fill: CHART_COLORS.inactive, fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={CHART_COLORS.accent}
              strokeWidth={3}
              dot={{ r: 4, fill: CHART_COLORS.accent }}
              name="질문 수"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UserTypePieChart({
  memberCount, guestCount,
}: { memberCount: number; guestCount: number }) {
  const data = [
    { name: "로그인 유저", value: memberCount, color: CHART_COLORS.accent },
    { name: "비로그인 유저", value: guestCount, color: CHART_COLORS.inactive },
  ];

  return (
    <div className="rounded-[16px] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-[18px] font-bold text-nav-primary">사용자 유형 분포</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map(entry => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TopQuestionsTable({
  questions, totalChats,
}: { questions: TopQuestion[]; totalChats: number }) {
  return (
    <div className="rounded-[16px] bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-[18px] font-bold text-nav-primary">자주 입력된 질문 TOP 20</h2>
      {questions.length === 0 ? (
        <p className="text-[14px] text-nav-inactive">데이터가 없습니다.</p>
      ) : (
        <ol className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          {questions.map((item, index) => {
            const pct = toPercentage(item.count, totalChats);
            return (
              <li key={item.question} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[16px] font-bold text-nav-accent" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] text-nav-primary">{item.question}</span>
                  </div>
                  <span className="ml-2 shrink-0 text-[12px] text-nav-inactive">
                    {item.count.toLocaleString()}건 ({pct}%)
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-nav-active-bg-from"
                  role="progressbar"
                  aria-valuenow={Number(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.question} 비율`}
                >
                  <div
                    className="h-full rounded-full bg-nav-accent transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function AdminStatistics() {
  const { alert, triggerAlert, closeAlert } = useAlert();
  const { stats, loading, fetchStats } = useStatistics();

  const display = stats ?? FALLBACK_STATS;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f0f9ff]">

        {/* ── 페이지 헤더 ── */}
        <div className="flex items-center justify-between gap-2 border-b border-nav-inactive/20 bg-white px-5 py-5">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] font-bold text-nav-primary sm:text-[32px]">
              챗봇 통계
            </h1>
            <p className="truncate text-[12px] text-nav-inactive sm:text-[14px]">
              실시간 사용 현황 분석
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            aria-label={loading ? "데이터 갱신 중" : "통계 새로고침"}
            aria-busy={loading}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-nav-active-bg-from px-3 py-2 text-[12px] font-bold text-nav-accent shadow-sm transition-all hover:bg-nav-active-bg-to disabled:opacity-50 sm:text-sm"
          >
            <Clock size={14} className={loading ? "animate-spin" : ""} aria-hidden="true" />
            <span className="whitespace-nowrap">{loading ? "갱신 중" : "새로고침"}</span>
          </button>
        </div>

        <div className="p-4 sm:p-8">

          {/* ── 요약 카드 ── */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            <SummaryCard title="질문 수" value={`${display.totalChats.toLocaleString()}건`} icon={MessageSquare} color="bg-nav-accent" />
            <SummaryCard title="활성 유저" value={`${display.memberUserCount.toLocaleString()}명`} icon={UserCheck} color="bg-[#28c76f]" />
            <SummaryCard title="비로그인 유저 질문 수" value={`${display.guestSessionCount.toLocaleString()}개`} icon={Users} color="bg-[#ff9f43]" />
            <SummaryCard title="평균 응답" value={`${display.avgResponseTime}ms`} icon={Clock} color="bg-[#ea5455]" />
          </div>

          {/* ── 차트 ── */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DailyStatsChart data={display.dailyStats} />
            <UserTypePieChart
              memberCount={display.memberUserCount}
              guestCount={display.guestSessionCount}
            />
          </div>

          {/* ── 자주 입력된 질문 ── */}
          <TopQuestionsTable
            questions={display.topQuestions}
            totalChats={display.totalChats}
          />
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
    </AdminLayout>
  );
}