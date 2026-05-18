// import { useState, useEffect, useMemo } from "react";
// import { Calendar, ChevronDown, ExternalLink, Loader2 } from "lucide-react";
// import BottomNav from "../components/BottomNav";

// // 임시 공지사항 데이터
// const MOCK_NOTICES: NoticeItem[] = [
//   {
//     noticeId: 1,
//     title: "2026학년도 1학기 입사 안내사항",
//     summaryText: "신축 기숙사 입사 절차 및 준비물, 건강진단서 제출 안내입니다.",
//     postedAt: "2026-03-02"
//   },
//   {
//     noticeId: 2,
//     title: "생활관 식당 운영 시간 변경 안내",
//     summaryText: "학기 중 식당 운영 시간이 다음과 같이 변경되오니 이용에 참고 바랍니다.",
//     postedAt: "2026-03-05"
//   },
//   {
//     noticeId: 3,
//     title: "[필독] 기숙사 화재 예방 점검 실시",
//     summaryText: "각 호실별 전열기구 사용 여부 및 소방 시설 점검이 진행될 예정입니다.",
//     postedAt: "2026-04-01"
//   }
// ];

// // 상세 데이터 매핑
// const MOCK_DETAILS: Record<number, NoticeDetail> = {
//   1: {
//     noticeId: 1,
//     title: "2026학년도 1학기 입사 안내사항",
//     summaryText: "신축 기숙사 입사 절차 및 준비물, 건강진단서 제출 안내입니다.",
//     postedAt: "2026-03-02",
//     content: "안녕하세요, 학생생활관입니다.\n2026학년도 1학기 입사자분들은 반드시 정해진 기간 내에 건강진단서(결핵)를 지참하여 방문해 주시기 바랍니다.\n미지참 시 입사가 제한될 수 있습니다.",
//     sourceUrl: "https://www.gachon.ac.kr",
//     targetInfo: "2026-1학기 생활관 합격자 전원",
//     scheduleInfo: "입사 기간: 2026.03.01 ~ 03.03",
//     cautionInfo: "입사 전 3개월 이내 발급된 진단서만 유효함"
//   },
//   2: {
//     noticeId: 2,
//     title: "생활관 식당 운영 시간 변경 안내",
//     summaryText: "학기 중 식당 운영 시간이 다음과 같이 변경되오니 이용에 참고 바랍니다.",
//     postedAt: "2026-03-05",
//     content: "조식 이용 인원 증가로 인해 기존 운영 시간보다 30분 연장하여 운영합니다.\n변경된 시간을 확인하시어 이용에 불편함이 없으시길 바랍니다.",
//     sourceUrl: "https://www.gachon.ac.kr",
//     scheduleInfo: "조식: 07:30 ~ 09:30 (기존 대비 30분 연장)"
//   },
//   3: {
//     noticeId: 3,
//     title: "[필독] 기숙사 화재 예방 점검 실시",
//     summaryText: "각 호실별 전열기구 사용 여부 및 소방 시설 점검이 진행될 예정입니다.",
//     postedAt: "2026-04-01",
//     content: "안전한 생활관 환경을 위해 정기 소방 점검을 실시합니다.\n개인 전열기구(전기장판, 커피포트 등) 적발 시 벌점이 부과될 수 있으니 주의 바랍니다.",
//     sourceUrl: "https://www.gachon.ac.kr",
//     targetInfo: "제1, 2, 3 학생생활관 전 호실",
//     scheduleInfo: "2026.04.10 ~ 04.12",
//     cautionInfo: "부재 중에도 점검이 진행될 수 있습니다."
//   }
// };

// interface NoticeItem {
//   noticeId: number;
//   title: string;
//   summaryText: string;
//   postedAt: string;
// }

// interface NoticeDetail extends NoticeItem {
//   content: string;
//   sourceUrl: string;
//   targetInfo?: string;
//   scheduleInfo?: string;
//   cautionInfo?: string;
// }

// export default function Notices() {
//   const [notices, setNotices] = useState<NoticeItem[]>([]);
//   const [details, setDetails] = useState<Record<number, NoticeDetail>>({});
//   const [expandedId, setExpandedId] = useState<number | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // [추가] 로그인 상태 체크 함수 (sessionStorage 기준)
//   const getIsLoggedIn = () => {
//     return sessionStorage.getItem("isLoggedIn") === "true";
//   };

//   // 초기 목록 로드 시뮬레이션
//   useEffect(() => {
//     const fetchNotices = () => {
//       setIsLoading(true);
//       setTimeout(() => {
//         setNotices([...MOCK_NOTICES].reverse());
//         setIsLoading(false);
//       }, 500);
//     };
//     fetchNotices();
//   }, []);

//   // 상세 정보 토글
//   const toggleNotice = (id: number) => {
//     if (expandedId === id) {
//       setExpandedId(null);
//       return;
//     }
//     if (!details[id]) {
//       setDetails(prev => ({ ...prev, [id]: MOCK_DETAILS[id] }));
//     }
//     setExpandedId(id);
//   };

//   // 통계 계산
//   const stats = useMemo(() => {
//     const now = new Date();
//     const currentMonth = now.getMonth() + 1;
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(now.getDate() - 7);

//     const weeklyCount = notices.filter(item => new Date(item.postedAt) >= oneWeekAgo).length;
//     const monthlyCount = notices.filter(item => new Date(item.postedAt).getMonth() + 1 === currentMonth).length;

//     return { currentMonth, weeklyCount, monthlyCount };
//   }, [notices]);

//   return (
//     <div className="min-h-screen w-full max-w-[448px] mx-auto bg-[#f0f9ff] relative shadow-2xl flex flex-col antialiased font-sans">
//       <div className="fixed inset-0 max-w-[448px] mx-auto bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#f8fafc] -z-10" />

//       <div className="pt-14 px-8 pb-5 shrink-0">
//         <h1 className="font-bold text-[28px] text-[#054a57] tracking-tight">학생생활관 공지</h1>
//         <p className="text-[#607d8b] text-[13px] font-bold mt-1 tracking-tight">공지사항의 핵심만 알려드려요</p>
//       </div>

//       {/* Summary Card */}
//       <div className="px-6 mb-6 shrink-0 relative z-10">
//         <div className="w-full bg-[#79b6c4] rounded-[28px] px-8 py-6 shadow-lg transition-all">
//           <p className="text-white/90 text-[14px] font-bold mb-1 tracking-tight">최근 7일 공지</p>
//           <h2 className="text-white text-[32px] font-bold mb-1">{stats.weeklyCount}건</h2>
//           <p className="text-white/80 text-[13px] font-bold tracking-tight">{stats.currentMonth}월 총 {stats.monthlyCount}건의 공지사항</p>
//         </div>
//       </div>

//       {/* List Area */}
//       <div className="flex-1 px-6 pb-28 space-y-4 overflow-y-auto scrollbar-hide">
//         {isLoading ? (
//           <div className="flex flex-col items-center justify-center pt-20 text-[#5eb9ca]">
//             <Loader2 className="animate-spin mb-2" size={32} />
//             <p className="font-bold text-[14px]">공지사항을 가져오는 중...</p>
//           </div>
//         ) : (
//           notices.map((item) => {
//             const isExpanded = expandedId === item.noticeId;
//             const detail = details[item.noticeId];

//             return (
//               <div 
//                 key={item.noticeId}
//                 onClick={() => toggleNotice(item.noticeId)}
//                 className={`group bg-white/80 backdrop-blur-md rounded-[24px] p-6 shadow-sm border transition-all duration-300 ${
//                   isExpanded ? 'border-[#5eb9ca] shadow-md' : 'border-white'
//                 }`}
//               >
//                 <div className="flex items-start justify-between gap-4">
//                   <div className="flex-1">
//                     <h3 className="font-bold text-[16px] leading-snug text-[#054a57]">{item.title}</h3>
//                     <p className="text-[13px] mt-2 text-[#4ea8b8] font-bold leading-relaxed line-clamp-2">{item.summaryText}</p>
//                     <div className="flex items-center text-[#cbd5e1] text-[11px] font-bold mt-3">
//                       <Calendar size={12} className="mr-1" />
//                       {item.postedAt.replace(/-/g, '. ')}
//                     </div>
//                   </div>
//                   <div className={`mt-1 text-[#cbd5e1] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#5eb9ca]' : ''}`}>
//                     <ChevronDown size={22} />
//                   </div>
//                 </div>

//                 <div className={`overflow-hidden transition-all duration-300 ${
//                   isExpanded ? 'max-h-[2000px] mt-4 pt-4 border-t border-[#f0f9ff]' : 'max-h-0'
//                 }`}>
//                   {detail ? (
//                     <div className="space-y-4">
//                       {/* ... (상세 정보 렌더링 영역 - 기존과 동일) */}
//                       <div className="grid grid-cols-1 gap-2">
//                         {detail.scheduleInfo && (
//                           <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#eef6f7]">
//                             <p className="text-[11px] font-bold text-[#5eb9ca] mb-1">일정</p>
//                             <p className="text-[13px] text-[#475569] font-bold">{detail.scheduleInfo}</p>
//                           </div>
//                         )}
//                         {detail.targetInfo && (
//                           <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#eef6f7]">
//                             <p className="text-[11px] font-bold text-[#5eb9ca] mb-1">대상자</p>
//                             <p className="text-[13px] text-[#475569] font-bold">{detail.targetInfo}</p>
//                           </div>
//                         )}
//                         {detail.cautionInfo && (
//                           <div className="bg-[#fff5f5] p-3 rounded-xl border border-[#ffe3e3]">
//                             <p className="text-[11px] font-bold text-[#ff6b6b] mb-1">유의사항</p>
//                             <p className="text-[13px] text-[#475569] font-bold">{detail.cautionInfo}</p>
//                           </div>
//                         )}
//                       </div>

//                       <div className="bg-white p-4 rounded-xl border border-[#f1f5f9]">
//                         <p className="text-[13.5px] text-[#64748b] font-medium leading-[1.7] whitespace-pre-line">
//                           {detail.content}
//                         </p>
//                       </div>

//                       <a 
//                         href={detail.sourceUrl} 
//                         target="_blank" 
//                         rel="noreferrer"
//                         onClick={(e) => e.stopPropagation()}
//                         className="flex items-center justify-center gap-2 w-full py-3 bg-[#f0f9ff] text-[#5eb9ca] rounded-xl text-[13px] font-bold active:scale-[0.98] transition-all"
//                       >
//                         <ExternalLink size={14} />
//                         공지 원문 링크
//                       </a>
//                     </div>
//                   ) : (
//                     <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[#5eb9ca]" size={20} /></div>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* 하단 네비게이션에 로그인 상태 전달 */}
//       {/* <BottomNav isLoggedIn={getIsLoggedIn()} /> */}
//       <BottomNav />    
//     </div>
//   );
// }