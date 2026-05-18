import { useState, useEffect, useCallback, useRef } from "react";
import {
    FileText, Loader2, ChevronRight,
    Calendar, Link as LinkIcon, Tag, Eye, EyeOff,
    AlertCircle, LayoutGrid, Info, X, Globe, Clipboard,
    DoorOpen, Coffee, Building2, ScrollText,
    Wrench, Plug, ClipboardList, ChevronDown, Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

// ─── 타입 ─────────────────────────────────────────────────

interface CategoryItem {
    category: string;
    document_count: number;
}

interface RegulationDocument {
    regulation_document_id: number;
    document_id: string;
    document_version: string;
    category: string;
    dormitory: string | null;
    title: string;
    content: string;
    source: string | null;
    source_url: string | null;
    keywords: string[] | null;
    source_type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface DetailModalProps {
    doc: RegulationDocument;
    onClose: () => void;
}

interface AlertState {
    show: boolean;
    title: string;
    message: string;
}

// ─── 상수 ─────────────────────────────────────────────────

const ALL_CATEGORY = "__ALL__";

const CATEGORY_MAP: Record<string, { icon: LucideIcon; label: string }> = {
    "admission": { icon: DoorOpen, label: "입·퇴사 안내" },
    "facility": { icon: Plug, label: "편의시설" },
    "facility_usage": { icon: ClipboardList, label: "시설 이용 안내" },
    "intro": { icon: Building2, label: "생활관 소개" },
    "rules": { icon: ScrollText, label: "생활관 수칙" },
    "tip": { icon: Coffee, label: "생활 정보" },
    "tip_restroom": { icon: Wrench, label: "화장실 안내" },
};

const DUMMY_CATEGORIES: CategoryItem[] = [
    { category: "admission", document_count: 32 },
    { category: "facility", document_count: 24 },
    { category: "facility_usage", document_count: 31 },
    { category: "intro", document_count: 9 },
    { category: "rules", document_count: 21 },
    { category: "tip", document_count: 25 },
    { category: "tip_restroom", document_count: 2 },
];

const DUMMY_DOCUMENTS: RegulationDocument[] = [
    {
        regulation_document_id: 1,
        document_id: "admission_001",
        document_version: "v1.0",
        category: "admission",
        dormitory: null,
        title: "2025년 입사 안내문",
        content: "입사 절차 및 준비물 안내입니다.\n1. 입사 신청서 제출\n2. 보증금 납부\n3. 생활관 규칙 숙지",
        source: "학생생활관 공식 홈페이지",
        source_url: "https://dorm.example.ac.kr",
        keywords: ["입사", "신청", "보증금"],
        source_type: "OFFICIAL",
        is_active: true,
        created_at: "2025-01-10T09:00:00",
        updated_at: "2025-03-01T09:00:00",
    },
    {
        regulation_document_id: 2,
        document_id: "rules_001",
        document_version: "v2.1",
        category: "rules",
        dormitory: "제1학생생활관",
        title: "생활관 공동생활 수칙",
        content: "공동생활 수칙을 준수하여 쾌적한 환경을 유지합니다.\n1. 취침 시간 준수\n2. 소음 금지\n3. 공용 공간 청결 유지",
        source: null,
        source_url: null,
        keywords: ["수칙", "소음", "청결"],
        source_type: "INTERNAL",
        is_active: true,
        created_at: "2025-02-01T10:00:00",
        updated_at: "2025-04-01T10:00:00",
    },
    {
        regulation_document_id: 3,
        document_id: "facility_001",
        document_version: "v1.3",
        category: "facility",
        dormitory: null,
        title: "세탁실 이용 안내",
        content: "세탁실 운영 시간 및 이용 방법을 안내합니다.\n운영 시간: 07:00 ~ 23:00\n세탁기 1회 사용 요금: 1,000원",
        source: null,
        source_url: null,
        keywords: ["세탁", "세탁기", "이용"],
        source_type: "INTERNAL",
        is_active: false,
        created_at: "2025-01-15T11:00:00",
        updated_at: "2025-02-15T11:00:00",
    },
    {
        regulation_document_id: 4,
        document_id: "facility_usage_001",
        document_version: "v1.0",
        category: "facility_usage",
        dormitory: null,
        title: "공용시설 이용 안내",
        content: "공용시설 이용 방법 및 주의사항을 안내합니다.",
        source: null,
        source_url: null,
        keywords: ["공용시설", "이용"],
        source_type: "OFFICIAL",
        is_active: true,
        created_at: "2025-01-20T12:00:00",
        updated_at: "2025-01-20T12:00:00",
    },
    {
        regulation_document_id: 5,
        document_id: "tip_001",
        document_version: "v1.1",
        category: "tip",
        dormitory: "제2학생생활관",
        title: "생활 꿀팁 안내",
        content: "생활관 생활에 유용한 꿀팁을 안내합니다.",
        source: null,
        source_url: null,
        keywords: ["팁", "꿀팁", "생활"],
        source_type: "INTERNAL",
        is_active: true,
        created_at: "2025-03-01T08:00:00",
        updated_at: "2025-05-01T08:00:00",
    },
    {
        regulation_document_id: 6,
        document_id: "tip_restroom_001",
        document_version: "v1.0",
        category: "tip_restroom",
        dormitory: null,
        title: "화장실 이용 안내",
        content: "화장실 청결 유지 및 이용 수칙을 안내합니다.",
        source: null,
        source_url: null,
        keywords: ["화장실", "청결"],
        source_type: "INTERNAL",
        is_active: true,
        created_at: "2025-03-10T08:00:00",
        updated_at: "2025-03-10T08:00:00",
    },
];

// ─── 유틸 ─────────────────────────────────────────────────

function getCategoryIcon(category: string): LucideIcon {
    return CATEGORY_MAP[category]?.icon ?? LayoutGrid;
}

function getCategoryLabel(category: string): string {
    return CATEGORY_MAP[category]?.label ?? category;
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

// ─── 서브 컴포넌트 ─────────────────────────────────────────

function CategorySelectBox({
    categories,
    selected,
    totalCount,
    onChange,
}: {
    categories: CategoryItem[];
    selected: string;
    totalCount: number;
    onChange: (category: string) => void;
}) {
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

    const allOption = { category: ALL_CATEGORY, document_count: totalCount };
    const allOptions = [allOption, ...categories];

    const selectedItem = allOptions.find(o => o.category === selected);
    const selectedLabel = selected === ALL_CATEGORY ? "전체" : getCategoryLabel(selected);
    const SelectedIcon = selected === ALL_CATEGORY ? LayoutGrid : getCategoryIcon(selected);

    return (
        <div className="relative w-full max-w-xs" ref={containerRef}>
            <label className="mb-1.5 ml-1 block text-[12px] font-bold text-nav-primary">
                카테고리
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`flex w-full items-center justify-between rounded-[14px] border-2 px-4 py-3 outline-none transition-all ${isOpen
                    ? "border-nav-accent bg-white shadow-md"
                    : "border-transparent bg-white shadow-sm"
                    }`}
            >
                <div className="flex items-center gap-2">
                    <SelectedIcon
                        size={15}
                        className={isOpen ? "text-nav-accent" : "text-nav-inactive"}
                    />
                    <span className={`text-[14px] font-bold ${isOpen ? "text-nav-accent" : "text-nav-primary"}`}>
                        {selectedLabel}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isOpen ? "bg-nav-accent/10 text-nav-accent" : "bg-[#f0f9ff] text-nav-inactive"
                        }`}>
                        {selectedItem?.document_count ?? totalCount}
                    </span>
                </div>
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
                    <div className="max-h-[260px] overflow-y-auto">
                        {allOptions.map(item => {
                            const isAll = item.category === ALL_CATEGORY;
                            const Icon = isAll ? LayoutGrid : getCategoryIcon(item.category);
                            const label = isAll ? "전체" : getCategoryLabel(item.category);
                            const isSelected = selected === item.category;

                            return (
                                <li key={item.category} role="option" aria-selected={isSelected}>
                                    <button
                                        type="button"
                                        onClick={() => { onChange(item.category); setIsOpen(false); }}
                                        className={`flex w-full items-center justify-between border-b border-[#f8fafc] px-5 py-3.5 text-left text-[14px] font-medium transition-colors last:border-none ${isSelected
                                            ? "bg-nav-active-bg-from text-nav-accent"
                                            : "text-nav-primary hover:bg-[#f0f9ff] hover:text-nav-accent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon size={14} />
                                            <span className="font-bold">{label}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${isSelected
                                                ? "bg-nav-accent/10 text-nav-accent"
                                                : "bg-[#f0f9ff] text-nav-inactive"
                                                }`}>
                                                {item.document_count}
                                            </span>
                                        </div>
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

function RegulationDetailModal({ doc, onClose }: DetailModalProps) {
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-nav-primary/40 backdrop-blur-[8px]" />
            <div
                className="animate-in fade-in zoom-in duration-300 relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-nav-inactive/20 bg-white px-8 py-6">
                    <div>
                        <h2 className="text-[22px] font-bold text-nav-primary">규정 상세 정보</h2>
                        <p className="mt-1 text-[12px] text-nav-inactive">
                            문서 코드: {doc.document_id} • 버전: {doc.document_version}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="닫기"
                        className="rounded-full p-2 text-nav-inactive transition-all hover:bg-[#f0f9ff] hover:text-nav-primary"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto p-8">
                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-nav-primary">
                            <Clipboard size={16} className="text-nav-accent" /> 규정 명칭
                        </h3>
                        <div className="rounded-[16px] border border-nav-inactive/20 bg-[#f0f9ff] p-4 text-[15px] font-semibold text-nav-primary">
                            {doc.title}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <section>
                            <h3 className="mb-3 text-[14px] font-bold text-nav-primary">적용 대상 / 위치</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-lg bg-nav-accent/10 px-3 py-1.5 text-[13px] font-bold text-nav-accent">
                                    {getCategoryLabel(doc.category)}
                                </span>
                                <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-[13px] font-bold text-gray-500">
                                    {doc.dormitory || "전체 생활관"}
                                </span>
                            </div>
                        </section>
                        <section>
                            <h3 className="mb-3 text-[14px] font-bold text-nav-primary">데이터 속성</h3>
                            <div className="flex gap-2">
                                <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-[13px] font-bold text-orange-600">
                                    {doc.source_type}
                                </span>
                                <span className={`rounded-lg px-3 py-1.5 text-[13px] font-bold ${doc.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"
                                    }`}>
                                    {doc.is_active ? "현재 활성" : "비활성 상태"}
                                </span>
                            </div>
                        </section>
                    </div>

                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-nav-primary">
                            <FileText size={16} className="text-nav-accent" /> 규정 본문 내용
                        </h3>
                        <div className="min-h-[200px] whitespace-pre-wrap rounded-[24px] border border-nav-inactive/20 bg-white p-6 text-[14px] leading-[1.7] text-nav-primary/70 shadow-sm">
                            {doc.content}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {doc.source_url && (
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-nav-primary">
                                    <Globe size={16} className="text-nav-accent" /> 원문 출처
                                </h3>
                                <a
                                    href={doc.source_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-full items-center gap-2 rounded-[12px] bg-nav-active-bg-from p-3 text-[13px] font-medium text-nav-accent transition-all hover:bg-nav-accent hover:text-white"
                                >
                                    <LinkIcon size={14} />
                                    <span className="truncate">{doc.source || "원문 링크 바로가기"}</span>
                                </a>
                            </section>
                        )}
                        <section>
                            <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-nav-primary">
                                <Tag size={16} className="text-nav-accent" /> 검색 키워드
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {doc.keywords && doc.keywords.length > 0 ? (
                                    doc.keywords.map(tag => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-nav-inactive/20 bg-[#f0f9ff] px-3 py-1 text-[12px] text-nav-accent"
                                        >
                                            #{tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[12px] text-nav-inactive">설정된 키워드 없음</span>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="shrink-0 border-t border-nav-inactive/20 bg-[#f0f9ff] p-6">
                    <button
                        onClick={onClose}
                        className="w-full rounded-[20px] bg-nav-accent py-4 font-bold text-white shadow-lg transition-all hover:bg-nav-accent/90 active:scale-[0.98]"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div >
    );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function AdminRegulations() {
    const { alert, triggerAlert, closeAlert } = useAlert();

    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
    const [documents, setDocuments] = useState<RegulationDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<RegulationDocument | null>(null);

    const fetchCategories = useCallback(() => {
        setCategories(DUMMY_CATEGORIES);
    }, []);

    const fetchDocuments = useCallback((category: string) => {
        setLoading(true);
        const filtered = category === ALL_CATEGORY
            ? DUMMY_DOCUMENTS
            : DUMMY_DOCUMENTS.filter(d => d.category === category);
        setDocuments(filtered);
        setLoading(false);
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    useEffect(() => { fetchDocuments(selectedCategory); }, [selectedCategory, fetchDocuments]);

    const totalCount = categories.reduce((sum, c) => sum + c.document_count, 0);

    return (
        <AdminLayout>
            <div className="min-h-screen w-full overflow-x-hidden bg-[#f0f9ff]">

                <div className="border-b border-nav-inactive/20 bg-white px-8 py-6">
                    <h1 className="text-[32px] font-bold text-nav-primary">규정 문서 관리</h1>
                    <p className="mt-1 text-[14px] text-nav-inactive">
                        기숙사 운영 규정 및 안내 문서를 카테고리별로 관리하세요.
                    </p>
                </div>

                <div className="min-w-0 p-8">

                    <div className="mb-8">
                        <CategorySelectBox
                            categories={categories}
                            selected={selectedCategory}
                            totalCount={totalCount}
                            onChange={setSelectedCategory}
                        />
                    </div>

                    <div className="overflow-hidden rounded-[24px] border border-[#f1f5f9] bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <thead className="bg-[#f0f9ff]">
                                    <tr>
                                        <th className="w-[50%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive">문서 제목</th>
                                        <th className="hidden w-[10%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive xl:table-cell">버전</th>
                                        <th className="hidden w-[15%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive lg:table-cell">생활관</th>
                                        <th className="hidden w-[12%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive lg:table-cell">상태</th>
                                        <th className="hidden w-[13%] px-4 py-4 text-left text-[13px] font-semibold text-nav-inactive xl:table-cell">수정일</th>
                                        <th className="w-[10%] px-4 py-4 text-right text-[13px] font-semibold text-nav-inactive">상세</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-nav-inactive/20">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <Loader2 className="mx-auto animate-spin text-nav-accent" />
                                            </td>
                                        </tr>
                                    ) : documents.length > 0 ? (
                                        documents.map(doc => (
                                            <tr
                                                key={doc.regulation_document_id}
                                                onClick={() => setSelectedDoc(doc)}
                                                className="group cursor-pointer transition-colors hover:bg-[#f0f9ff]"
                                            >
                                                <td className="w-[50%] px-4 py-4">
                                                    <div className="flex items-start gap-2 min-w-0">
                                                        <div className="mt-0.5 shrink-0 rounded-lg bg-nav-active-bg-from p-1.5 text-nav-accent transition-colors group-hover:bg-nav-accent group-hover:text-white">
                                                            <FileText size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-[13px] font-bold text-nav-primary">{doc.title}</p>
                                                            <p className="truncate mt-0.5 text-[11px] text-nav-inactive">{doc.document_id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden w-[10%] px-4 py-4 xl:table-cell">
                                                    <div className="flex flex-col">
                                                        <span className="whitespace-nowrap text-[12px] font-medium text-nav-primary">{doc.document_version}</span>
                                                        <span className="whitespace-nowrap text-[11px] text-nav-inactive">{doc.source_type}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden w-[15%] whitespace-nowrap px-4 py-4 text-[12px] text-nav-primary lg:table-cell">
                                                    {doc.dormitory || "전체"}
                                                </td>
                                                <td className="hidden w-[12%] px-4 py-4 lg:table-cell">
                                                    <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${doc.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                                                        }`}>
                                                        {doc.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                                                        {doc.is_active ? "활성" : "비활성"}
                                                    </span>
                                                </td>
                                                <td className="hidden w-[13%] whitespace-nowrap px-4 py-4 text-[12px] text-nav-inactive xl:table-cell">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={13} />
                                                        {new Date(doc.updated_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="w-[10%] px-4 py-4 text-right">
                                                    <button className="rounded-lg p-1.5 text-nav-inactive transition-all group-hover:bg-nav-active-bg-from group-hover:text-nav-accent">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-nav-inactive">
                                                해당 카테고리에 등록된 문서가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3 rounded-[16px] border border-nav-accent/20 bg-nav-active-bg-from p-4">
                        <Info className="text-nav-accent" size={20} />
                        <p className="text-[13px] font-medium text-nav-accent">
                            현재 활성화된 문서만 챗봇 상담 및 학생 페이지에 노출됩니다.
                        </p>
                    </div>
                </div>
            </div>

            {selectedDoc && (
                <RegulationDetailModal
                    doc={selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                />
            )}

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