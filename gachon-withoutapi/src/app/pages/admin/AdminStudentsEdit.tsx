// import { useState } from "react";
// import { X } from "lucide-react";

// interface Student {
//   id: number;
//   name: string;
//   studentId: string;
//   building: string;
//   room: string;
//   phone: string;
//   email: string;
//   checkInDate: string;
//   department: string;
//   grade: string;
// }

// interface EditModalProps {
//   student: Student;
//   onClose: () => void;
//   onSave: (formData: Partial<Student>) => void;
// }

// export default function StudentEditModal({ student, onClose, onSave }: EditModalProps) {
//   const [formData, setFormData] = useState({
//     name: student.name,
//     studentId: student.studentId,
//     building: student.building,
//     room: student.room,
//     phone: student.phone,
//     email: student.email,
//     department: student.department,
//     grade: student.grade,
//   });

//   const handleSubmit = () => {
//     if (!formData.name || !formData.studentId) {
//       alert("이름과 학번은 필수 입력 항목입니다.");
//       return;
//     }
//     onSave(formData);
//   };

//   return (
//     <div 
//       className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <div 
//         className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="p-8">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="font-['Pretendard:Bold',sans-serif] text-[24px] text-[#054a57]">
//               학생 정보 수정
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-[#92a4a6] hover:text-[#054a57]"
//             >
//               <X className="size-6" />
//             </button>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             {/* Name */}
//             <div>
//               <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">
//                 이름 <span className="text-[#ea5455]">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="이름을 입력하세요"
//                 className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               />
//             </div>

//             {/* Student ID */}
//             <div>
//               <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">
//                 학번 <span className="text-[#ea5455]">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.studentId}
//                 onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
//                 placeholder="학번을 입력하세요"
//                 className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               />
//             </div>

//             {/* Department */}
//             <div>
//               <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">
//                 학과
//               </label>
//               <input
//                 type="text"
//                 value={formData.department}
//                 onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                 placeholder="학과를 입력하세요"
//                 className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               />
//             </div>

//             {/* Grade */}
//             <div>
//               <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">
//                 학년
//               </label>
//               <select
//                 value={formData.grade}
//                 onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
//                 className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               >
//                 <option value="1학년">1학년</option>
//                 <option value="2학년">2학년</option>
//                 <option value="3학년">3학년</option>
//                 <option value="4학년">4학년</option>
//               </select>
//             </div>

//             {/* Building */}
//             <div>
//               <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">
//                 생활관 동수
//               </label>
//               <select
//                 value={formData.building}
//                 onChange={(e) => setFormData({ ...formData, building: e.target.value })}
//                 className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               >
//                 <option value="제1학생생활관">제1학생생활관</option>
//                 <option value="제2학생생활관">제2학생생활관</option>
//                 <option value="제3학생생활관">제3학생생활관</option>
//               </select>
//             </div>

//             {/* Room */}
//             <div>
//               <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">
//                 호실
//               </label>
//               <input
//                 type="text"
//                 value={formData.room}
//                 onChange={(e) => setFormData({ ...formData, room: e.target.value })}
//                 placeholder="호실을 입력하세요"
//                 className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               />
//             </div>

//             {/* Email */}
//             <div className="col-span-2">
//               <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">
//                 이메일
//               </label>
//               <input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 placeholder="이메일을 입력하세요"
//                 className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               />
//             </div>

//             {/* Phone */}
//             <div className="col-span-2">
//               <label className="font-['Pretendard:SemiBold',sans-serif] text-[13px] text-[#054a57] mb-2 block">
//                 전화번호
//               </label>
//               <input
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                 placeholder="전화번호를 입력하세요"
//                 className="w-full px-4 py-3 bg-[#f6fbff] border-2 border-transparent rounded-[12px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#054a57] placeholder:text-[#c7d4d5] focus:border-[#5eb9ca] focus:bg-white focus:outline-none"
//               />
//             </div>
//           </div>

//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={onClose}
//               className="flex-1 py-3 rounded-[12px] bg-[#f6fbff] text-[#92a4a6] font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#e5f4f5] transition-colors"
//             >
//               취소
//             </button>
//             <button
//               onClick={handleSubmit}
//               className="flex-1 py-3 rounded-[12px] bg-[#5eb9ca] text-white font-['Pretendard:SemiBold',sans-serif] text-[14px] hover:bg-[#4fa8b9] transition-colors"
//             >
//               저장
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
