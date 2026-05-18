// import { useState } from "react";
// import { Search, Plus, Edit2, Trash2, Eye, Calendar, Info, AlertTriangle } from "lucide-react";
// import AdminLayout from "../../components/AdminLayout";

// interface Notice {
//   id: number;
//   title: string;
//   content: string;
//   author: string;
//   date: string;
//   views: number;
// }

// export default function AdminNotices() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     title: "",
//     content: "",
//   });

//   // 커스텀 알림창 상태
//   const [alertConfig, setAlertConfig] = useState<{ 
//     isOpen: boolean; 
//     message: string; 
//     type: "info" | "danger" | "confirm";
//     onConfirm?: () => void;
//   } | null>(null);

//   // 공지사항 데이터 상태 관리
//   const [notices, setNotices] = useState<Notice[]>([
//     {
//       id: 1,
//       title: "2026학년도 1학기 기숙사 입사 안내",
//       content: "2026학년도 1학기 기숙사 입사 일정을 안내드립니다...",
//       author: "관리자",
//       date: "2026.03.15",
//       views: 1234,
//     },
//     {
//       id: 2,
//       title: "세탁실 이용 안내",
//       content: "세탁실 이용 시간 및 주의사항을 안내드립니다...",
//       author: "관리자",
//       date: "2026.03.14",
//       views: 856,
//     },
//     {
//       id: 3,
//       title: "층별 청소 일정 공지",
//       content: "이번 주 층별 청소 일정을 안내드립니다...",
//       author: "관리자",
//       date: "2026.03.13",
//       views: 634,
//     },
//     {
//       id: 4,
//       title: "식당 운영 시간 변경 안내",
//       content: "3월 16일부터 식당 운영 시간이 변경됩니다...",
//       author: "관리자",
//       date: "2026.03.12",
//       views: 892,
//     },
//     {
//       id: 5,
//       title: "외박 신청 시스템 점검 안내",
//       content: "외박 신청 시스템 점검으로 인해...",
//       author: "관리자",
//       date: "2026.03.11",
//       views: 445,
//     },
//   ]);

//   const showAlert = (message: string, type: "info" | "danger" | "confirm" = "info", onConfirm?: () => void) => {
//     setAlertConfig({ isOpen: true, message, type, onConfirm });
//   };

//   const filteredNotices = notices.filter((notice) =>
//     notice.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // 등록 로직
//   const handleCreate = () => {
//     if (!formData.title || !formData.content) {
//       showAlert("제목과 내용을 모두 입력해주세요.");
//       return;
//     }
    
//     const newNotice: Notice = {
//       id: notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1,
//       title: formData.title,
//       content: formData.content,
//       author: "관리자",
//       date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
//       views: 0
//     };

//     setNotices([newNotice, ...notices]);
//     showAlert("공지사항이 등록되었습니다.");
//     setIsCreating(false);
//     setFormData({ title: "", content: "" });
//   };

//   // 수정 로직
//   const handleEdit = () => {
//     if (!formData.title || !formData.content) {
//       showAlert("제목과 내용을 모두 입력해주세요.");
//       return;
//     }

//     setNotices(prev => prev.map(n => 
//       n.id === selectedNotice?.id 
//         ? { ...n, title: formData.title, content: formData.content } 
//         : n
//     ));

//     showAlert(`공지사항 #${selectedNotice?.id}이(가) 수정되었습니다.`);
//     setIsEditing(false);
//     setSelectedNotice(null);
//     setFormData({ title: "", content: "" });
//   };

//   const handleStartEdit = (notice: Notice) => {
//     setFormData({
//       title: notice.title,
//       content: notice.content,
//     });
//     setIsEditing(true);
//     setSelectedNotice(null);
//   };

//   // 삭제 로직
//   const handleDelete = (id: number) => {
//     showAlert("정말 삭제하시겠습니까?", "confirm", () => {
//       setNotices(prev => prev.filter(n => n.id !== id));
//       showAlert(`공지사항 #${id}가 삭제되었습니다.`);
//       setSelectedNotice(null);
//     });
//   };

//   return (
//     <AdminLayout>
//       <div className="bg-[#f6fbff] min-h-screen">
//         {/* Header */}
//         <div className="bg-white border-b border-[#e5f4f5] px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="font-['Pretendard:Bold',sans-serif] text-[32px] text-[#054a57]">
//                 공지사항 관리
//               </h1>
//               <p className="font-['Pretendard:Medium',sans-serif] text-[14px] text-[#92a4a6] mt-1">
//                 학생들에게 전달할 공지사항을 관리하세요
//               </p>
//             </div>
//             <button
//               onClick={() => setIsCreating(true)}
//               className="flex items-center gap-2 bg-[#5eb9ca] text-white px-6 py-3 rounded-[12px] font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#4fa8b9] transition-colors shadow-lg shadow-[#5eb9ca]/30"
//             >
//               <Plus className="size-5" />
//               새 공지 작성
//             </button>
//           </div>
//         </div>

//         <div className="p-8">
//           {/* Search */}
//           <div className="bg-white rounded-[16px] p-6 shadow-sm mb-6">
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#92a4a6]" />
//               <input
//                 type="text"
//                 placeholder="공지사항 제목으로 검색"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               />
//             </div>
//           </div>

//           {/* Notices Table */}
//           <div className="bg-white rounded-[16px] shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[800px]">
//                 <thead className="bg-[#f6fbff]">
//                   <tr>
//                     <th className="px-6 py-4 text-left font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#92a4a6]">제목</th>
//                     <th className="px-6 py-4 text-left font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#92a4a6]">작성일</th>
//                     <th className="px-6 py-4 text-left font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#92a4a6]">조회수</th>
//                     <th className="px-6 py-4 text-right font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#92a4a6]">관리</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredNotices.map((notice) => (
//                     <tr key={notice.id} className="border-t border-[#e5f4f5] hover:bg-[#f6fbff] transition-colors">
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => setSelectedNotice(notice)}
//                           className="font-['Pretendard:SemiBold',sans-serif] text-[14px] text-[#054a57] hover:text-[#5eb9ca] text-left"
//                         >
//                           {notice.title}
//                         </button>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2 text-[#92a4a6]">
//                           <Calendar className="size-4" />
//                           <span className="font-['Pretendard:Medium',sans-serif] text-[13px]">{notice.date}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2 text-[#5eb9ca]">
//                           <Eye className="size-4" />
//                           <span className="font-['Pretendard:SemiBold',sans-serif] text-[13px]">{notice.views.toLocaleString()}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => handleStartEdit(notice)}
//                             className="p-2 rounded-[8px] bg-[#5eb9ca]/10 text-[#5eb9ca] hover:bg-[#5eb9ca] hover:text-white transition-colors"
//                           >
//                             <Edit2 className="size-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(notice.id)}
//                             className="p-2 rounded-[8px] bg-[#ea5455]/10 text-[#ea5455] hover:bg-[#ea5455] hover:text-white transition-colors"
//                           >
//                             <Trash2 className="size-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Create Modal */}
//       {isCreating && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setIsCreating(false)}>
//           <div className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
//             <div className="p-8">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="font-['Pretendard:Bold',sans-serif] text-[24px] text-[#054a57]">새 공지사항 작성</h2>
//                 <button onClick={() => setIsCreating(false)} className="text-[#92a4a6] hover:text-[#054a57] text-[24px]">×</button>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">제목</label>
//                   <input
//                     type="text"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                     placeholder="공지사항 제목을 입력하세요"
//                     className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//                   />
//                 </div>
//                 <div>
//                   <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">내용</label>
//                   <textarea
//                     value={formData.content}
//                     onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//                     placeholder="공지사항 내용을 입력하세요"
//                     rows={10}
//                     className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none resize-none"
//                   />
//                 </div>
//                 <div className="flex gap-3 pt-4">
//                   <button onClick={() => setIsCreating(false)} className="flex-1 py-3 rounded-[12px] bg-[#f6fbff] text-[#92a4a6] font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#e5f4f5] transition-colors">취소</button>
//                   <button onClick={handleCreate} className="flex-1 py-3 rounded-[12px] bg-[#5eb9ca] text-white font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#4fa8b9] transition-colors shadow-lg shadow-[#5eb9ca]/30">등록</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {isEditing && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setIsEditing(false)}>
//           <div className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
//             <div className="p-8">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="font-['Pretendard:Bold',sans-serif] text-[24px] text-[#054a57]">공지사항 수정</h2>
//                 <button onClick={() => setIsEditing(false)} className="text-[#92a4a6] hover:text-[#054a57] text-[24px]">×</button>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">제목</label>
//                   <input
//                     type="text"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                     className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//                   />
//                 </div>
//                 <div>
//                   <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">내용</label>
//                   <textarea
//                     value={formData.content}
//                     onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//                     rows={10}
//                     className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] focus:border-[#5eb9ca] focus:bg-white focus:outline-none resize-none"
//                   />
//                 </div>
//                 <div className="flex gap-3 pt-4">
//                   <button onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-[12px] bg-[#f6fbff] text-[#92a4a6] font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#e5f4f5] transition-colors">취소</button>
//                   <button onClick={handleEdit} className="flex-1 py-3 rounded-[12px] bg-[#5eb9ca] text-white font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#4fa8b9] transition-colors shadow-lg shadow-[#5eb9ca]/30">수정</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Detail Modal */}
//       {selectedNotice && !isCreating && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setSelectedNotice(null)}>
//           <div className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
//             <div className="p-8">
//               <div className="flex items-start justify-between mb-6">
//                 <h2 className="font-['Pretendard:Bold',sans-serif] text-[24px] text-[#054a57]">{selectedNotice.title}</h2>
//                 <button onClick={() => setSelectedNotice(null)} className="text-[#92a4a6] hover:text-[#054a57] text-[24px]">×</button>
//               </div>
//               <div className="flex items-center gap-4 mb-6 text-[#92a4a6] text-[13px]">
//                 <div className="flex items-center gap-2"><Calendar className="size-4" /><span>{selectedNotice.date}</span></div>
//                 <div className="flex items-center gap-2"><Eye className="size-4" /><span>조회 {selectedNotice.views.toLocaleString()}</span></div>
//               </div>
//               <div className="bg-[#f6fbff] rounded-[12px] p-6 mb-6">
//                 <p className="font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</p>
//               </div>
//               <div className="flex gap-3">
//                 <button onClick={() => setSelectedNotice(null)} className="flex-1 py-3 rounded-[12px] bg-[#f6fbff] text-[#92a4a6] font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#e5f4f5] transition-colors">닫기</button>
//                 <button onClick={() => handleStartEdit(selectedNotice)} className="px-6 py-3 rounded-[12px] bg-[#5eb9ca]/10 text-[#5eb9ca] font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#5eb9ca] hover:text-white transition-colors">수정</button>
//                 <button onClick={() => handleDelete(selectedNotice.id)} className="px-6 py-3 rounded-[12px] bg-[#ea5455]/10 text-[#ea5455] font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#ea5455] hover:text-white transition-colors">삭제</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Custom Alert Modal (앞서 반영된 알림창 디자인) */}
//       {alertConfig?.isOpen && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-in zoom-in duration-150">
//           <div className="bg-white rounded-[20px] p-6 max-w-[340px] w-full text-center shadow-2xl">
//             <div className={`size-14 rounded-full flex items-center justify-center mx-auto mb-4 ${alertConfig.type === 'danger' || alertConfig.type === 'confirm' ? 'bg-[#ea5455]/10' : 'bg-[#f6fbff]'}`}>
//               {alertConfig.type === 'danger' || alertConfig.type === 'confirm' ? (
//                 <AlertTriangle className="size-7 text-[#ea5455]" />
//               ) : (
//                 <Info className="size-7 text-[#5eb9ca]" />
//               )}
//             </div>
//             <p className="font-['Pretendard:SemiBold',sans-serif] text-[16px] text-[#054a57] mb-6 leading-relaxed whitespace-pre-wrap">
//               {alertConfig.message}
//             </p>
//             <div className="flex gap-2">
//               {alertConfig.type === 'confirm' && (
//                 <button
//                   onClick={() => setAlertConfig(null)}
//                   className="flex-1 py-3 bg-[#f6fbff] text-[#92a4a6] rounded-[12px] font-['Pretendard:Bold',sans-serif] text-[14px] hover:bg-[#e5f4f5] transition-colors"
//                 >
//                   취소
//                 </button>
//               )}
//               <button
//                 onClick={() => {
//                   if (alertConfig.onConfirm) alertConfig.onConfirm();
//                   setAlertConfig(null);
//                 }}
//                 className={`flex-1 py-3 text-white rounded-[12px] font-['Pretendard:Bold',sans-serif] text-[14px] transition-colors ${alertConfig.type === 'confirm' || alertConfig.type === 'danger' ? 'bg-[#ea5455] hover:bg-[#d93939]' : 'bg-[#5eb9ca] hover:bg-[#4fa8b9]'}`}
//               >
//                 확인
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AdminLayout>
//   );
// }