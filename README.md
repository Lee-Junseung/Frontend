# 가천대 기숙사 챗봇 (Gachon Dorm Chatbot)

> 가천대학교 팀 프로젝트로 진행한 AI 기반 기숙사 안내 챗봇 서비스.
> 기숙사 규정/공지 관련 질문에 AI가 답변하고, 민원 접수·통계 관리까지 가능한 학생용 앱과 관리자용 대시보드로 구성.
> React 기반 프론트엔드 개발을 담당.

> 이 브랜치(`main`)는 실제 백엔드 서버와 연동되는 원본 코드. 팀 프로젝트 종료 후 백엔드 서버가 종료되어, 현재는 로컬에서 API 연동 화면을 확인할 수 없음.
> `demo` 브랜치는 API 호출 부분을 mock 데이터로 대체해 백엔드 없이도 화면을 바로 실행해볼 수 있도록 만든 버전.

---

## 프로젝트 소개

가천대학교 기숙사생을 위한 AI 챗봇 기반 안내 서비스. 기숙사 규정, 생활 안내 등에 대한 질문에 AI가 근거(출처)를 바탕으로 답변하고, 답변 품질에 대한 사용자 피드백(좋아요/싫어요 + 사유)을 수집해 개선하는 구조로 설계. 이 외에도 공지사항 확인, 민원 접수, 관리자용 통계/학생 관리 기능을 포함.

- 팀 구성: 프론트엔드 1명, 백엔드 2명, AI 2명
- 프로젝트 구조: 학생용 앱(`gachonuser`) + 관리자용 앱(`gachonadmin`) 분리된 모노레포
- 배포 환경: Vercel (프론트) + 별도 백엔드 서버 연동, 현재 서버 미운영

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, MUI (Material UI), Radix UI |
| 라우팅 | React Router |
| 데이터 통신 | Axios |
| 데이터 시각화 | Recharts |
| 기타 | Emotion, react-hook-form, date-fns 등 |

---

## 담당 역할

이 프로젝트에서 프론트엔드 개발 전체를 담당 (학생용 앱 + 관리자용 앱).

- 학생용 앱 라우팅 및 인증 흐름 구현 (`UserRoutes.tsx`, `ProtectedRoute.tsx`)
- AI 챗봇 대화 UI 구현 — 메시지 송수신, 답변에 대한 좋아요/싫어요 피드백 및 사유 선택 기능 (`Chatbot.tsx`)
- 민원 접수/조회 화면 구현 (`Complaints.tsx`, `ComplaintSubmit.tsx`)
- 로그인/회원가입/비밀번호 찾기 등 인증 화면 구현
- 관리자용 대시보드 구현 — 학생 관리, 민원 관리, 규정 관리, 챗봇 통계(질문 수·활성 유저·평균 응답시간 등 시각화)
- Axios 인터셉터로 인증 만료(401) 및 권한 오류(403) 공통 처리

---

## 프로젝트 구조

```
gachon-dorm-chatbot/
├── gachonuser/    # 학생용 앱
│   └── src/app/pages/
│       ├── Home.tsx           # 홈
│       ├── Chatbot.tsx        # AI 챗봇 (피드백 기능 포함)
│       ├── Notices.tsx        # 공지사항
│       ├── Complaints.tsx     # 민원 목록
│       ├── ComplaintSubmit.tsx# 민원 접수
│       ├── Profile.tsx        # 마이페이지
│       └── Login/SignUp/FindPassword.tsx  # 인증
│
└── gachonadmin/   # 관리자용 앱
    └── src/app/pages/
        ├── AdminLogin.tsx        # 관리자 로그인
        ├── AdminStudents.tsx     # 학생 관리
        ├── AdminComplaints.tsx   # 민원 관리
        ├── AdminRegulations.tsx  # 규정 관리
        └── AdminStatistics.tsx   # 챗봇 이용 통계 (질문 수/활성 유저/응답시간 차트)
```

---

## 실행 방법

```bash
# 학생용 앱
cd gachonuser
npm install
npm run dev

# 관리자용 앱
cd gachonadmin
npm install
npm run dev
```

> 현재 백엔드 서버가 종료되어 있어, 위 방법으로 실행해도 실제 데이터 연동 화면(로그인, 챗봇 답변, 통계 등)은 확인할 수 없음. 백엔드 없이 실제 동작을 확인하려면 [`demo` 브랜치](https://github.com/Lee-Junseung/gachon-dorm-chatbot/tree/demo)를 이용.
