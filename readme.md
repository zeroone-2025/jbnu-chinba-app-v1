# Chinba Frontend (When2Meet 스타일 일정 조율)

Next.js 기반의 단일 페이지 일정 조율 웹앱입니다.  
when2meet UX를 참고하여 **방 생성 → 참여 → 시간 선택 → Heatmap 확인**까지 한 화면에서 처리합니다.

---

## 1. 기술 스택 (Tech Stack)

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: lucide-react
- **State Management**: React Hooks (필요 시 Zustand 확장)
- **Date Utils**: dayjs
- **Auth**: Google OAuth (백엔드 세션/JWT 연동)

---

## 2. 시스템 아키텍처 (System Architecture)

```
[ Browser ]
     ↓
[ Next.js Frontend ]  (port: 3000)
     ↓  REST API
[ Backend API ]       (port: 8000)
     ↓
[ SQLite Database ]
```

- 프론트는 API 서버와만 통신
- 인증은 Google OAuth → 백엔드 세션/JWT 기반
- DB는 SQLite (백엔드 내부에서만 접근)

---

## 3. 네트워크 / 포트

| 구분 | 포트 | 설명 |
|---|---|---|
| Frontend | 3000 | Next.js 개발 서버 |
| Backend | 8000 | API 서버 |
| DB | - | SQLite (파일 기반) |

---

## 4. 라우팅 구조 (Frontend)

| Path | Description |
|---|---|
| `/chinba` | 메인 페이지 (방 생성 / 방 리스트) |
| `/chinba/events/[eventId]` | 이벤트(방) 일정 선택 화면 |
| `/auth/callback` | Google OAuth 콜백 |

---

## 5. 프로젝트 구조

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # /chinba
│   ├── chinba/
│   │   ├── page.tsx            # 메인
│   │   └── events/
│   │       └── [eventId]/page.tsx
│   └── auth/callback/page.tsx
├── components/
│   ├── layout/                 # TopBar, Sidebar
│   ├── room/                   # RoomView, MemberList
│   ├── timetable/              # Grid, Drag logic
│   └── ui/                     # shadcn/ui
├── lib/
│   ├── api.ts                  # API client
│   ├── auth.ts                 # 로그인 상태 유틸
│   ├── time.ts                 # slot_index ↔ 시간 계산
│   └── constants.ts
├── styles/
└── public/
```

---

## 6. Configuration (.env)

`.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/chinba
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000
```

---

## 7. API 연동 규칙

- **API Prefix**: `/chinba`
- 모든 요청은 `NEXT_PUBLIC_API_BASE_URL` 기준
- 인증 필요 API는 로그인 세션/JWT 자동 포함

### 주요 API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chinba/events` | 이벤트 생성 |
| GET | `/chinba/events/{eventId}` | 이벤트 정보 + heatmap |
| POST | `/chinba/events/{eventId}/join` | 이벤트 참여 |
| PUT | `/chinba/events/{eventId}/me/availability` | 내 시간 저장 |
| GET | `/chinba/events/{eventId}/me/availability` | 내 시간 조회 |

---

## 8. Heatmap 렌더링 방식

- 시간 단위: **30분 슬롯 고정**
- 서버 응답:
```json
heatmap[date][slot_index] = 가능한 사람 수
```
- 프론트 계산:
```ts
minute = start_minute + slot_index * 30
```
- 색상 농도는 프론트에서 계산

---

## 9. 로컬 개발 실행 방법

```bash
npm install
npm run dev
```

- 접속: http://localhost:3000/chinba
- 백엔드 서버가 함께 실행되어야 정상 동작

---

## 10. 배포 가이드 (Frontend)

### 1) 빌드
```bash
npm run build
```

### 2) 실행
```bash
npm run start
```

### 3) 배포 시 주의사항
- `NEXT_PUBLIC_API_BASE_URL`을 배포 환경에 맞게 설정
- OAuth Redirect URI에 배포 도메인 추가

---

## 11. 개발 원칙

- 한 페이지 내 패널 전환 방식 유지 (라우팅 최소화)
- 시간 계산/변환 로직은 `lib/time.ts`로 집중
- UI 컴포넌트는 shadcn/ui 기반으로 일관성 유지

---

## 12. 한 줄 요약

> Chinba Frontend는 30분 슬롯 기반 heatmap 구조를 사용한
> 단일 페이지 일정 조율 웹앱으로, SQLite 기반 백엔드와 연동됩니다.

