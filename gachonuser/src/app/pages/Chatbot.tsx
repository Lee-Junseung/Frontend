import { useState, useRef, useEffect, memo, useCallback } from "react";
import BottomNav from "../components/BottomNav";
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Check } from "lucide-react";
import api from "../api/axios";

import iconShortcut from "../icons/Togo.svg";
import iconLogo from "../icons/GAONI.svg";
import iconLike from "../icons/Like.svg";
import iconLikeBlue from "../icons/LikeBlue.svg";
import iconDislike from "../icons/Dislike.svg";
import iconDislikeRed from "../icons/DislikeRed.svg";

// ─── 타입 ─────────────────────────────────────────────────

type FeedbackStatus = "like" | "dislike" | null;

type ReasonCode =
  | "INCORRECT_ANSWER" | "BAD_CITATION" | "TOO_LONG"
  | "TOO_VAGUE" | "OUTDATED_INFO" | "NO_SOURCE" | "OTHER";

interface Message {
  id: string;
  chatLogId?: number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  isInitial?: boolean;
  feedbackStatus?: FeedbackStatus;
  selectedReason?: ReasonCode;
  feedbackText?: string;
  isFeedbackOpen?: boolean;
  isFeedbackSubmitted?: boolean;
}

interface ApiResponse {
  data: {
    chatLogId: number;
    sessionId: string;
    answer: string;
    answerStatus: string;
    responseTime: number;
  } | null;
  code: number;
  message: string;
}

interface FeedbackPayload {
  chat_log_id: number;
  is_helpful: boolean;
  reason_code?: ReasonCode | null;
  feedback_comment?: string | null;
}

interface FeedbackSectionProps {
  msg: Message;
  onFeedbackClick: (id: string, status: FeedbackStatus) => void;
  onReasonSelect: (id: string, reason: ReasonCode) => void;
  onFeedbackTextChange: (id: string, text: string) => void;
  onFeedbackSubmit: (id: string) => void;
}

// ─── 상수 ─────────────────────────────────────────────────

const SUGGESTED_QUESTIONS: readonly string[] = [
  "통금은 언제인가요?",
  "휴게실에는 어떤 시설이 있나요?",
  "기숫가 카드를 잃어버렸어요.",
  "외부인이 방문하려면 어떻게 해야하나요?",
];

const REASON_OPTIONS: readonly { code: ReasonCode; label: string }[] = [
  { code: "INCORRECT_ANSWER", label: "잘못된 답변" },
  { code: "BAD_CITATION", label: "잘못된 인용" },
  { code: "TOO_LONG", label: "너무 김" },
  { code: "TOO_VAGUE", label: "너무 모호함" },
  { code: "OUTDATED_INFO", label: "오래된 정보" },
  { code: "NO_SOURCE", label: "출처 없음" },
  { code: "OTHER", label: "기타" },
];

const STORAGE_KEY_HISTORY = "chat_history";
const STORAGE_KEY_SESSION = "chat_sessionId";

// ─── 유틸 ─────────────────────────────────────────────────

const formatTime = () =>
  new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true });

const fetchSessionId = async (): Promise<string | null> => {
  try {
    const response = await api.post("/chatbot/sessions", {});
    const newSessionId: string = response.data.data.sessionId;
    sessionStorage.setItem(STORAGE_KEY_SESSION, newSessionId);
    return newSessionId;
  } catch (error: any) {
    const status = error.response?.status;

    if (status === 422) {
      console.error("세션 생성 실패: 요청 검증 오류 (422)", error);
    } else if (status === 500) {
      console.error("세션 생성 실패: 서버 내부 오류 (500)", error);
    } else {
      console.error("세션 생성 실패:", error);
    }
    return null;
  }
};

function buildFeedbackPayload(msg: Message): FeedbackPayload {
  const isHelpful = msg.feedbackStatus === "like";
  const payload: FeedbackPayload = {
    chat_log_id: msg.chatLogId!,
    is_helpful: isHelpful,
  };
  if (!isHelpful) {
    payload.reason_code = msg.selectedReason ?? "OTHER";
    if (payload.reason_code === "OTHER") {
      payload.feedback_comment = msg.feedbackText ?? "";
    }
  }
  return payload;
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────

const BotAvatar = memo(() => (
  <div className="mt-0.5 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent">
    <img src={iconLogo} className="h-full w-full scale-[0.9] object-contain" alt="가온이" />
  </div>
));
BotAvatar.displayName = "BotAvatar";

const TypingIndicator = memo(() => (
  <div className="flex items-start gap-2.5">
    <BotAvatar />
    <div className="flex w-fit space-x-1.5 rounded-[18px] rounded-tl-none border border-[#eef6f7] bg-white px-5 py-4 shadow-md">
      {["-0.3s", "-0.15s", "0s"].map(delay => (
        <div key={delay} style={{ animationDelay: delay }} className="size-1.5 animate-bounce rounded-full bg-nav-accent" />
      ))}
    </div>
  </div>
));
TypingIndicator.displayName = "TypingIndicator";

const FeedbackSection = memo(function FeedbackSection({
  msg, onFeedbackClick, onReasonSelect, onFeedbackTextChange, onFeedbackSubmit,
}: FeedbackSectionProps) {
  if (msg.isFeedbackSubmitted) {
    return (
      <div className="ml-1 mt-1 flex animate-in fade-in slide-in-from-left-2 items-center gap-2 text-[11px] font-bold text-nav-accent">
        <img
          src={msg.feedbackStatus === "like" ? iconLikeBlue : iconDislikeRed}
          alt="피드백"
          className="size-5 opacity-90"
        />
        <span>소중한 의견이 전달되었어요!</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
      {/* 좋아요 / 싫어요 버튼 */}
      <div className="ml-1 flex gap-2">
        <button onClick={() => onFeedbackClick(msg.id, "like")} className="p-1 transition-transform active:scale-90">
          <img src={msg.feedbackStatus === "like" ? iconLikeBlue : iconLike} alt="좋아요" className="size-5" />
        </button>
        <button onClick={() => onFeedbackClick(msg.id, "dislike")} className="p-1 transition-transform active:scale-90">
          <img src={msg.feedbackStatus === "dislike" ? iconDislikeRed : iconDislike} alt="싫어요" className="size-5" />
        </button>
      </div>

      {/* 싫어요 선택 시 상세 영역 */}
      {msg.isFeedbackOpen && msg.feedbackStatus === "dislike" && (
        <div className="mt-2 w-full animate-in fade-in zoom-in-95 rounded-[22px] border border-[#e2eef1] bg-[#f0f7f9] p-4 shadow-xl">
          <p className="mb-3 px-1 text-[12px] font-bold text-nav-primary/70">불만족 사유를 선택해주세요</p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {REASON_OPTIONS.map(option => (
              <button
                key={option.code}
                onClick={() => onReasonSelect(msg.id, option.code)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${msg.selectedReason === option.code
                  ? "border-nav-accent bg-nav-accent text-white"
                  : "border-[#e2eef1] bg-white text-nav-inactive"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {msg.selectedReason === "OTHER" && (
            <div className="rounded-[16px] border border-[#e2eef1] bg-white p-3 shadow-sm">
              <textarea
                value={msg.feedbackText ?? ""}
                onChange={e => onFeedbackTextChange(msg.id, e.target.value)}
                placeholder="추가 의견을 남겨주세요 (최대 2000자)"
                className="h-20 w-full resize-none border-none bg-transparent text-[13px] font-medium text-nav-primary outline-none"
              />
            </div>
          )}

          <button
            onClick={() => onFeedbackSubmit(msg.id)}
            disabled={!msg.selectedReason}
            className="mt-3 w-full rounded-[14px] bg-nav-accent py-3 text-[13px] font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:bg-nav-inactive"
          >
            피드백 제출하기
          </button>
        </div>
      )}
    </div>
  );
});
FeedbackSection.displayName = "FeedbackSection";

// ─── 메인 컴포넌트 ─────────────────────────────────────────

export default function Chatbot() {
  const [isLoggedIn] = useState(() => sessionStorage.getItem("isLoggedIn") === "true");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
    isConfirm?: boolean;
    onConfirm?: () => void;
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // 알림 닫기 및 확인 로직
  const handleAlertConfirm = useCallback(() => {
    if (alert.isConfirm && alert.onConfirm) {
      alert.onConfirm();
    }
    setAlert(prev => ({ ...prev, show: false }));
  }, [alert]);

  // 알림 호출 함수
  const showAlert = (message: string, type: "success" | "error" = "success", isConfirm = false, onConfirm?: () => void) => {
    setAlert({ show: true, message, type, isConfirm, onConfirm });
  };

  useEffect(() => {
    const initSession = async () => {
      const existing = sessionStorage.getItem(STORAGE_KEY_SESSION);
      if (!existing) {
        await fetchSessionId();
      }
    };
    initSession();
  }, []);

  // ── 초기 메시지 ──
  useEffect(() => {
    const initialMsg: Message = {
      id: "initial",
      text: isLoggedIn
        ? "안녕하세요! 가온이입니다. 무엇을 도와드릴까요?"
        : "안녕하세요! 가온이입니다.\n챗봇 서비스 품질 향상을 위해 대화 내용이 수집될 수 있으며, 수집된 정보는 서비스 개선 목적 외에는 사용되지 않습니다.",
      sender: "bot",
      timestamp: formatTime(),
      isInitial: true,
    };

    if (isLoggedIn) {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      setMessages(saved ? JSON.parse(saved) : [initialMsg]);
    } else {
      setMessages([initialMsg]);
    }
  }, [isLoggedIn]);

  // ── 스크롤 ──
  const scrollToBottom = useCallback(() => {
    // 메세지 전송 직후 최하단으로 이동
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const scrollToLastBotMsg = useCallback(() => {
    // 응답 메세지 직후 마지막 봇 메세지가 화면 중앙으로 오도록
    const container = scrollContainerRef.current;
    if (!container) return;
    const botMessages = container.querySelectorAll("[data-sender='bot']");
    const lastBot = botMessages[botMessages.length - 1] as HTMLElement;
    if (lastBot) {
      const containerHeight = container.clientHeight;
      const msgTop = lastBot.offsetTop;
      const targetScrollPos = msgTop - (containerHeight / 2) + 60;
      container.scrollTo({
        top: targetScrollPos,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    } else {
      const timer = setTimeout(() => {
        scrollToLastBotMsg();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping, scrollToBottom, scrollToLastBotMsg]);

  // ── 배경 클릭 > 피드백 닫기 ──
  const handleContainerClick = useCallback(() => {
    setMessages(prev => prev.map(msg =>
      msg.isFeedbackOpen && !msg.isFeedbackSubmitted
        ? { ...msg, isFeedbackOpen: false, feedbackStatus: null }
        : msg
    ));
  }, []);

  // ── 피드백 클릭 ──
  const handleFeedbackClick = useCallback((id: string, status: FeedbackStatus) => {
    if (status === "like") {
      setMessages(prev => {
        const target = prev.find(m => m.id === id);
        if (!target || !target.chatLogId) return prev;

        const updatedMsg = { ...target, feedbackStatus: status };
        const payload = buildFeedbackPayload(updatedMsg);

        api.post("/ai/chat/feedback", payload)
          .then((res) => {
            const _feedbackResult = res.data;
            setMessages(p => p.map(m =>
              m.id === id ? { ...m, isFeedbackSubmitted: true } : m
            ));
          })
          .catch((error: any) => {
            const status = error.response?.status;

            showAlert(
              status === 404 ? "해당 대화 로그를 찾을 수 없습니다." :
                "피드백 전송에 실패했습니다.",
              "error", true, () => { window.location.reload(); }
            );
          });

        return prev.map(m => m.id === id ? updatedMsg : m);
      });
    } else {
      // 싫어요 클릭 시: 상세 창 열기
      setMessages(prev => prev.map(m =>
        m.id === id
          ? { ...m, feedbackStatus: status, isFeedbackOpen: true, selectedReason: undefined }
          : m
      ));
    }
  }, []);

  // ── 사유 선택 ──
  const handleReasonSelect = useCallback((id: string, reason: ReasonCode) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, selectedReason: reason } : m));
  }, []);

  // ── 피드백 텍스트 변경 ──
  const handleFeedbackTextChange = useCallback((id: string, text: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, feedbackText: text } : m));
  }, []);

  // ── 피드백 제출 (싫어요) ──
  const handleFeedbackSubmit = useCallback((id: string) => {
    setMessages(prev => {
      const target = prev.find(m => m.id === id);
      if (!target?.chatLogId) return prev;

      api.post("/ai/chat/feedback", buildFeedbackPayload(target))
        .then((res) => {
          // 명세: 공통 래퍼 없이 피드백 객체 직접 반환
          const _feedbackResult = res.data; // 향후 활용 가능
          setMessages(p => p.map(m =>
            m.id === id ? { ...m, isFeedbackOpen: false, isFeedbackSubmitted: true } : m
          ));
        })
        .catch((error: any) => {
          const status = error.response?.status;
          showAlert(
            status === 422 ? "피드백 형식이 올바르지 않습니다." :
              status === 404 ? "해당 대화 로그를 찾을 수 없습니다." :
                "피드백 전송 중 오류가 발생했습니다.",
            "error", true, () => { window.location.reload(); }
          );
        });

      return prev;
    });
  }, []);

  // ── 메시지 전송 ──
  const handleSend = useCallback(async (text?: string) => {
    const textToSend = (text ?? inputValue).trim();
    if (!textToSend || isTyping) return;

    let currentSessionId = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (!currentSessionId) {
      currentSessionId = await fetchSessionId();
    }
    if (!currentSessionId) {
      showAlert("세션을 연결할 수 없습니다.\n 잠시 후 다시 시도해주세요.", "error", true, () => {
        window.location.reload();
      });
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(), text: textToSend, sender: "user", timestamp: formatTime(),
    };

    setMessages(prev => {
      const updated = [...prev, userMsg];
      if (isLoggedIn) localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      return updated;
    });
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await api.post<ApiResponse>("/chatbot/questions", {
        question: textToSend,
        sessionId: currentSessionId,
      });

      if (response.data.code === 200 && response.data.data) {
        const result = response.data.data;
        if (result.sessionId) sessionStorage.setItem(STORAGE_KEY_SESSION, result.sessionId);

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          chatLogId: result.chatLogId,
          text: result.answer,
          sender: "bot",
          timestamp: formatTime(),
          feedbackStatus: null,
          isFeedbackOpen: false,
          isFeedbackSubmitted: false,
        };

        setMessages(prev => {
          const updated = [...prev, botMsg];
          if (isLoggedIn) localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
          return updated;
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 409) {
        sessionStorage.removeItem(STORAGE_KEY_SESSION);
        showAlert("세션이 만료되었습니다. 다시 시도해주세요.", "error", true, () => {
          window.location.reload();
        });
      } else if (status === 400) {
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          text: "질문이 비어있습니다.",
          sender: "bot",
          timestamp: formatTime(),
        };
        setMessages(prev => [...prev, errorMsg]);
      } else {
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          text: (error as { response?: { data?: { message?: string } } }).response?.data?.message
            ?? "죄송합니다. 서버와 통신 중 오류가 발생했습니다.",
          sender: "bot",
          timestamp: formatTime(),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, isLoggedIn]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div
      className="relative mx-auto flex h-screen w-full max-w-[448px] flex-col overflow-hidden bg-[#f0f9ff] shadow-2xl"
      onClick={handleContainerClick}
    >
      {/* ── 헤더 ── */}
      <div className="z-10 shrink-0 bg-[#f0f9ff] px-7 pb-6 pt-16">
        <h1 className="text-[28px] font-bold tracking-tight text-nav-primary">챗봇</h1>
        <p className="mt-1 text-[13px] font-bold tracking-tight text-nav-inactive">기숙사 관련 질문을 해보세요</p>
      </div>

      {/* ── 메시지 리스트 ── */}
      <div
        ref={scrollContainerRef}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        className={`flex-1 space-y-8 overflow-y-auto px-6 py-4 transition-all hide-scrollbar ${isSuggestOpen ? "pb-[360px]" : "pb-52"
          }`}>
        {messages.map(msg => (
          <div
            key={msg.id}
            data-sender={msg.sender}
            className={`flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            onClick={e => e.stopPropagation()}
          >
            {msg.sender === "bot" && <BotAvatar />}

            <div className={`flex max-w-[85%] min-w-0 flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`rounded-[18px] border px-5 py-4 text-[14.5px] font-semibold leading-[1.65] shadow-md whitespace-pre-wrap overflow-hidden break-all ${msg.sender === "user"
                  ? "rounded-tr-none border-transparent bg-nav-accent text-white shadow-nav-accent/20"
                  : "rounded-tl-none border-[#eef6f7] bg-white text-nav-primary"
                  }`}
                  style={{ maxWidth: '100%' }}
                >
                  {msg.text}
                </div>
                <span className="mb-1 shrink-0 text-[10px] font-bold text-nav-inactive">{msg.timestamp}</span>
              </div>

              {msg.sender === "bot" && !msg.isInitial && (
                <div className="mt-2 w-full">
                  <FeedbackSection
                    msg={msg}
                    onFeedbackClick={handleFeedbackClick}
                    onReasonSelect={handleReasonSelect}
                    onFeedbackTextChange={handleFeedbackTextChange}
                    onFeedbackSubmit={handleFeedbackSubmit}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── 하단 입력 UI ── */}
      <div className="fixed bottom-0 z-20 w-full max-w-[448px] border-t border-[#eef6f7] bg-white/90 pt-5 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl">
        <div className="pb-[100px]">
          <div className="relative z-10 px-6">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-nav-inactive">추천 질문</p>
              <button
                onClick={() => setIsSuggestOpen(v => !v)}
                className="rounded-full p-1 text-nav-inactive transition-colors hover:bg-[#f1f5f9]"
              >
                {isSuggestOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            <div className={`grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300 ${isSuggestOpen ? "mb-2 pb-1 max-h-[200px] opacity-100" : "mb-0 max-h-0 opacity-0"
              }`}>
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="min-h-[35px] w-full rounded-[18px] border border-[#eef6f7] bg-white px-3 py-2.5 shadow-sm active:scale-95"
                >
                  <span className="break-keep text-center text-[11.5px] font-extrabold leading-[1.3] text-nav-primary/70">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 px-6 pb-5 pt-2">
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="flex-1 rounded-[22px] border border-transparent bg-[#f1f5f9] px-5 py-3.5 text-[14.5px] font-bold text-nav-primary outline-none transition-all focus:border-nav-accent/30 focus:bg-white"
            />
            <button
              onClick={() => handleSend()}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-nav-accent shadow-lg transition-all active:scale-90"
            >
              <img src={iconShortcut} alt="전송" className="size-5 brightness-0 invert" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 알림 모달 ── */}
      {alert.show && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-8"
          onClick={handleAlertConfirm}
        >
          {/* 배경 (Backdrop) */}
          <div className="absolute inset-0 bg-nav-primary/30 backdrop-blur-[4px]" />

          {/* 모달 컨텐츠 */}
          <div
            className="relative w-full max-w-[320px] animate-in fade-in zoom-in duration-300 rounded-[32px] border border-white bg-white p-8 text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* 아이콘 영역 */}
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#f0f7f9]">
              {alert.type === "success"
                ? <CheckCircle className="text-nav-accent" size={32} />
                : <AlertCircle className="text-red-400" size={32} />
              }
            </div>

            {/* 제목 */}
            <h2 className="mb-2 text-[19px] font-bold text-nav-primary">
              {alert.type === "success" ? "알림" : "오류"}
            </h2>

            {/* 메시지 */}
            <p className="mb-7 whitespace-pre-line text-[15px] font-medium leading-relaxed text-nav-primary/70">
              {alert.message}
            </p>

            {/* 버튼 영역 */}
            <div className="flex w-full gap-2">
              {alert.isConfirm ? (
                <>
                  <button
                    onClick={() => setAlert(prev => ({ ...prev, show: false }))}
                    className="h-12 flex-1 rounded-[20px] bg-[#f1f5f9] font-bold text-nav-inactive transition-all active:scale-[0.96]"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAlertConfirm}
                    className="h-12 flex-1 rounded-[20px] bg-nav-accent font-bold text-white shadow-lg shadow-nav-accent/20 transition-all active:scale-[0.96]"
                  >
                    확인
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAlertConfirm}
                  className="h-12 w-full rounded-[20px] bg-nav-accent font-bold text-white shadow-lg shadow-nav-accent/20 transition-all active:scale-[0.96]"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}