import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, X, Loader2, Check, ChevronDown,
  Wrench, ScrollText, Eraser, Volume2, HelpCircle, ImagePlus, AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── 타입 ─────────────────────────────────────────────────

interface CategoryOption {
  id: string;
  name: string;
  Icon: LucideIcon;
  iconClass: string;
}

interface ImageEntry {
  file: File;
  previewUrl: string;
}

type AlertState =
  | { show: false }
  | { show: true; message: string; type: "success" | "error" };

// ─── 상수 ─────────────────────────────────────────────────

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: "FACILITY", name: "시설 수리", Icon: Wrench, iconClass: "text-orange-400" },
  { id: "RULE", name: "생활 규칙", Icon: ScrollText, iconClass: "text-blue-400" },
  { id: "CLEANING", name: "청소 요청", Icon: Eraser, iconClass: "text-green-400" },
  { id: "NOISE", name: "소음 신고", Icon: Volume2, iconClass: "text-red-400" },
  { id: "ETC", name: "기타 문의", Icon: HelpCircle, iconClass: "text-purple-400" },
];

const MAX_IMAGES = 5;

const LABEL_CLASS =
  "ml-1 flex items-center text-[11px] font-black uppercase tracking-widest text-nav-inactive";

// ─── API 에러 파싱 유틸 ───────────────────────────────────

function parseApiError(error: any, fallback: string): string {
  return error.response?.data?.message ?? fallback;
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function ComplaintSubmit() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoggedIn] = useState(() => sessionStorage.getItem("isLoggedIn") === "true");
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState("FACILITY");
  const [openSelect, setOpenSelect] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [alert, setAlert] = useState<AlertState>({ show: false });

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth/login");
  }, [isLoggedIn, navigate]);

  // ── 이미지 URL 메모리 해제 ──
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  // ── 파생값 ──
  const selectedCategory = CATEGORY_OPTIONS.find(o => o.id === categoryId)!;

  // ── 이미지 추가 ──
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    setImages(prev => {
      if (prev.length + newFiles.length > MAX_IMAGES) {
        setAlert({ show: true, message: `최대 ${MAX_IMAGES}장까지 첨부 가능합니다.`, type: "error" });
        return prev;
      }
      return [
        ...prev,
        ...newFiles.map(file => ({ file, previewUrl: URL.createObjectURL(file) })),
      ];
    });
    e.target.value = "";
  }, []);

  // ── 이미지 제거 ──
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── 제출 ──
  const handleSubmit = useCallback(async () => {
    // 유효성 검사
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = "제목을 입력하세요.";
    if (!content.trim()) newErrors.content = "민원 내용을 입력하세요.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    await new Promise(res => setTimeout(res, 800));
    setAlert({ show: true, message: "민원이 정상적으로 접수되었습니다.", type: "success" });
    setLoading(false);
  }, [title, content, categoryId, images, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col bg-[#f0f9ff] font-sans shadow-2xl animate-in fade-in duration-500 antialiased">

      {/* ── 알림 모달 ── */}
      {alert.show && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-nav-primary/20 px-8 backdrop-blur-[3px]"
          onClick={() => setAlert({ show: false })}
        >
          <div
            className="w-full max-w-[320px] animate-in fade-in zoom-in duration-200 rounded-[28px] bg-white p-7 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-nav-active-bg-from">
                {alert.type === "success"
                  ? <Check className="text-nav-accent" size={28} />
                  : <AlertCircle className="text-red-400" size={28} />
                }
              </div>
              <h2 className="mb-2 text-[17px] font-bold text-nav-primary">알림</h2>
              <p className="mb-6 whitespace-pre-line text-[14px] font-medium leading-relaxed text-nav-accent">
                {alert.message}
              </p>
              <button
                onClick={() => {
                  setAlert({ show: false });
                  // 성공 시 확인 버튼 누르면 이동
                  if (alert.type === "success") navigate(-1);
                }}
                className="h-[50px] w-full rounded-[18px] bg-nav-accent font-bold text-white shadow-md transition-all active:scale-[0.96]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 헤더 ── */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[#eef6f7] bg-[#f0f9ff]/80 px-6 pb-4 pt-14 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="-ml-2 rounded-full p-2 transition-all hover:bg-white/50 active:scale-90"
          >
            <ChevronLeft className="size-6 text-nav-primary" />
          </button>
          <h1 className="text-[22px] font-bold tracking-tight text-nav-primary">민원 작성</h1>
        </div>
      </div>

      {/* ── 메인 컨텐츠 ── */}
      <div className="scrollbar-hide flex-1 space-y-7 overflow-y-auto px-6 pb-40 pt-6">

        {/* 카테고리 선택 */}
        <div className="relative space-y-2">
          <label className={LABEL_CLASS}>
            카테고리 <span className="ml-1 text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setOpenSelect(v => !v)}
            className={`flex h-[60px] w-full items-center justify-between rounded-[22px] border bg-white px-5 shadow-sm transition-all duration-300 ${openSelect ? "border-nav-accent shadow-lg shadow-nav-accent/10" : "border-[#eef6f7]"
              }`}
          >
            <div className="flex items-center gap-3.5">
              <selectedCategory.Icon size={20} className={selectedCategory.iconClass} />
              <span className="text-[15px] font-bold text-nav-primary">{selectedCategory.name}</span>
            </div>
            <ChevronDown className={`size-5 text-nav-inactive transition-transform duration-500 ${openSelect ? "rotate-180" : ""}`} />
          </button>

          {openSelect && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenSelect(false)} />
              <div className="absolute z-50 mt-1.5 w-full animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-[24px] border border-[#eef6f7] bg-white/95 shadow-2xl backdrop-blur-2xl">
                {CATEGORY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setCategoryId(opt.id); setOpenSelect(false); }}
                    className="flex w-full items-center justify-between border-b border-[#eef6f7] px-6 py-[18px] text-left transition-colors last:border-none hover:bg-[#f8fbff]"
                  >
                    <div className="flex items-center gap-4">
                      <opt.Icon size={20} className={opt.iconClass} />
                      <span className={`text-[15px] font-bold ${categoryId === opt.id ? "text-nav-accent" : "text-nav-primary"
                        }`}>
                        {opt.name}
                      </span>
                    </div>
                    {categoryId === opt.id && <Check size={20} className="text-nav-accent" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 제목 */}
        <div className="space-y-2">
          <label className={LABEL_CLASS}>
            제목 <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: "" })); }}
            placeholder="제목을 입력하세요"
            className="h-[60px] w-full rounded-[22px] border border-[#eef6f7] bg-white px-6 text-[15px] font-bold text-nav-primary shadow-sm outline-none transition-all placeholder:text-nav-inactive focus:border-nav-accent"
          />
          <div className="h-[18px]">
            {errors.title && (
              <p className="ml-1 mt-0.5 animate-in fade-in text-[10px] font-bold text-red-500">
                * {errors.title}
              </p>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="space-y-2">
          <label className={LABEL_CLASS}>
            민원 내용 <span className="ml-1 text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setErrors(prev => ({ ...prev, content: "" })); }}
            placeholder="민원 내용을 자세히 입력해주세요"
            className="w-full min-h-[180px] resize-none rounded-[28px] border border-[#eef6f7] bg-white p-6 text-[15px] font-medium leading-relaxed text-nav-primary shadow-sm outline-none transition-all placeholder:text-nav-inactive focus:border-nav-accent"
          />
          <div className="h-[18px]">
            {errors.content && (
              <p className="ml-1 mt-0.5 animate-in fade-in text-[10px] font-bold text-red-500">
                * {errors.content}
              </p>
            )}
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className={LABEL_CLASS}>
              사진 첨부
              <span className="ml-2 text-[10px] font-medium text-nav-inactive">(선택)</span>
            </label>
            <span className={`text-[11px] font-bold ${images.length >= MAX_IMAGES ? "text-red-400" : "text-nav-accent"}`}>
              {images.length}/{MAX_IMAGES}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center rounded-[20px] border border-[#eef6f7] bg-white text-nav-accent shadow-sm transition-all hover:border-nav-accent hover:bg-[#f8fbff]"
            >
              <ImagePlus size={24} />
              <span className="mt-1.5 text-[9px] font-black uppercase">추가하기</span>
            </button>

            {images.map((img, i) => (
              <div
                key={img.previewUrl}
                className="relative aspect-square animate-in zoom-in-95 overflow-hidden rounded-[20px] border border-[#eef6f7] shadow-sm"
              >
                <img src={img.previewUrl} className="h-full w-full object-cover" alt={`첨부 이미지 ${i + 1}`} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/40 p-1 text-white backdrop-blur-md transition-colors hover:bg-red-500"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* ── 하단 제출 버튼 ── */}
      <div className="fixed bottom-0 z-40 w-full max-w-[448px] bg-gradient-to-t from-[#f0f9ff] via-[#f0f9ff] to-transparent p-6 pb-8">
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-[24px] bg-nav-accent font-bold text-[16px] text-white shadow-xl shadow-nav-accent/20 transition-all active:scale-[0.98] disabled:bg-nav-inactive"
        >
          {loading
            ? <Loader2 className="animate-spin" />
            : <span className="tracking-tight">민원 접수하기</span>
          }
        </button>
      </div>
    </div>
  );
}