# 가천대 기숙사 챗봇 — 데모 버전

> [`gachon-dorm-chatbot`](https://github.com/Lee-Junseung/gachon-dorm-chatbot)의 데모 브랜치.
> 실제 서비스(main 브랜치)는 팀 프로젝트 종료 후 백엔드 서버가 종료되어 더 이상 API 연동 화면을 확인할 수 없음.
> 이 브랜치는 화면 구성과 UI 로직을 그대로 살리되, 모든 데이터를 컴포넌트 내부 mock 데이터로 대체해 백엔드 서버 없이도 로컬에서 바로 실행하고 클릭해볼 수 있도록 만듦.

> 실제 프로젝트 개요, 담당 역할 등 상세 설명은 [`main` 브랜치 README](https://github.com/Lee-Junseung/gachon-dorm-chatbot/blob/main/README.md)를 참고. 이 문서는 데모 버전 사용법 위주로 정리함.

---

## 이 브랜치가 원본과 다른 점

- `gachonuser` / `gachonadmin`으로 분리되어 있던 main 브랜치와 달리, 이 브랜치는 학생용 + 관리자용 페이지가 하나의 앱(`src/`) 안에 함께 구성되어 있음.
- `axios` 등 외부 API 호출이 전혀 없음. 로그인 인증, 민원 목록, 학생 목록, 챗봇 통계 등 화면에 필요한 데이터는 각 페이지 컴포넌트 내부에 mock 데이터로 직접 작성되어 있어, 백엔드 없이도 모든 화면이 실제처럼 동작함.
- 로그인은 정해진 데모 계정과 일치할 때만 `sessionStorage`에 로그인 상태를 저장하는 방식으로 동작함 (아래 데모 계정 참고).

---

## 실행 방법

백엔드 서버 없이 바로 실행 가능.

```bash
git clone -b demo https://github.com/Lee-Junseung/gachon-dorm-chatbot.git
cd gachon-dorm-chatbot
npm install
npm run dev
```

데모 로그인 정보
| 구분 | 계정 |
|---|---|
| 학생용 | `test@gachon.ac.kr` / `qwer!@#$` |
| 관리자용 | `test2@gachon.ac.kr` / `zxcv!@#$` |

접속 후 하단(모바일)/좌측(관리자) 내비게이션으로 아래 화면들을 확인하실 수 있음.

학생용
- 홈, 챗봇(AI 대화 + 좋아요/싫어요 피드백 UI), 공지사항, 민원(목록/접수), 내정보
- 회원가입, 비밀번호 찾기 등 인증 관련 화면

관리자용
- 민원 관리, 챗봇 통계(차트), 학생 관리, 규정 문서 관리

---

## 참고 사항

- 표시되는 모든 데이터(민원 내역, 학생 목록, 챗봇 통계, 규정 문서 등)는 실제 데이터가 아닌 화면 확인용 mock 값.
- 등록/수정/삭제 등의 액션은 브라우저 메모리(컴포넌트 상태)에만 반영되며, 새로고침 시 초기화됨.
- `src/app/pages/admin/AdminNotices.tsx`, `AdminStudentsEdit.tsx`는 개발 과정에서 구현했던 화면이지만, 서비스 범위상 불필요하다고 판단하여 라우팅/메뉴에서 제외함. (코드는 참고용으로 남겨둔 상태)
