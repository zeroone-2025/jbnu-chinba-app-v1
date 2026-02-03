## 🚀 주요 기능 (MVP)

### 1) 🧭 메인 레이아웃 (Single Page)

- **상단(Top Bar)**
    - 친바 로고
    - 헤드바 영역(추후 “모이자?” / 예전 친바 기능 확장 고려)
    - 방 생성 진입(사이드바 첫 메뉴로 고정하고, 우측 메인에 방 생성 화면 표시)
- **사이드바(노션 느낌 선호)**
    - 로그인 박스(구글 로그인)
        - 로그인 후: 내 정보 표시, 참여한 방 표시
        - 로그아웃 버튼
    - 방 생성 메뉴
    - 방 리스트(내가 만든/참여한/최근 본 방)
- **메인 패널(방 화면 컴포넌트)**
    - 방 생성 화면 또는 방 상세 화면을 “우측 메인”에 렌더링

### 2) 🔗 방 상세 화면 (Room View)

- **초대 링크 복사 버튼**
    - 로그인 없이도 방 “열람” 가능 (읽기 전용)
- **참여 멤버 리스트**
    - 참여자 목록 표시
    - 각 멤버별 “일정 변경” 버튼
        - 시간 선택 UX
            - 드래그 선택 가능
            - 드롭다운 선택 가능
            - 저장
- **프리 타임(Free Time)**
    - 멤버 시간표에서 **겹치지 않는/겹치는** 시간을 계산해 표시
- **시간표 업로드 버튼(추후)**
    - 버튼 클릭 → 사진 업로드(미래 기능)
- **타임테이블(Time Table)**
    - 요일 선택 기능(탭/세그먼트)
    - 드래그로 블록 선택(when2meet 감성)

---

## 🛠 기술 스택 (Tech Stack)

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (@radix-ui)
- **Icons**: Lucide React
- **State**: React Hooks + (필요시) Zustand/React Query 도입 가능
- **Date/Time**: date-fns 또는 dayjs (KST/타임존 고려)
- **Auth**: Google OAuth (프론트는 버튼/리다이렉트 및 세션 UI 담당)

---

## 🏁 시작하기 (Getting Started)

### 1) 설치

```bash
npm install
# or
yarn

```

### 2) 환경 변수 (.env.local)

```
# 백엔드 API 주소 (예: FastAPI)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# 배포 시 프론트 도메인 (초대 링크 생성에 사용)
NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000

```

### 3) 실행

```bash
npm run dev

```

- [http://localhost:3000](http://localhost:3000/)

---

## 🧱 화면 구성 (Information Architecture)

> “라우팅은 최소화하되, 화면은 한 페이지에서 패널 전환으로 처리”
> 
- `/` : 단일 페이지
    - 좌측: Sidebar
    - 우측: Main Panel
        - 기본: 방 생성 패널
        - URL에 roomId가 있으면: 방 상세 패널
- `/auth/callback` : 구글 로그인 콜백 처리(토큰/세션 수립 후 `/`로 복귀)

---

## 📂 프로젝트 구조 (예시)

```
chinba-when2meet/
├── app/
│   ├── layout.tsx
│   ├── page.tsx# 단일 페이지(사이드바+메인패널)
│   ├── auth/
│   │   └── callback/page.tsx# OAuth 콜백 처리
│   └── (components)/
│       ├── TopBar.tsx
│       ├── Sidebar.tsx
│       ├── MainPanel.tsx
│       ├── RoomCreatePanel.tsx
│       ├── RoomViewPanel.tsx
│       ├── MemberList.tsx
│       ├── FreeTimePanel.tsx
│       ├── TimeTable/
│       │   ├── TimeTable.tsx
│       │   ├── DaySelector.tsx
│       │   ├── DragGrid.tsx
│       │   └── TimeDropdown.tsx
│       └── InviteLinkButton.tsx
├── components/
│   └── ui/# shadcn/ui
├── lib/
│   ├── api.ts# API client (fetch/axios)
│   ├── auth.ts# 세션/로그인 유틸
│   ├── time.ts# 시간표 변환/유틸(분 단위, 요일 등)
│   ├── constants.ts
│   └── utils.ts
└── public/

```

---

## 🔐 인증/권한 UX 정책

- **로그인 없이 가능**
    - 방 링크로 입장
    - 방 화면(타임테이블, 멤버 목록, 프리타임) **읽기 전용**으로 보기
    - 초대 링크 복사
- **로그인 필요**
    - “내 일정 선택/저장”
    - 내 참여 방 리스트/내 정보 표시

> 구현 팁: UI는 isLoggedIn 상태에 따라
> 
- 버튼을 disabled 처리 + “로그인 필요” 안내
- 혹은 클릭 시 로그인 모달/리다이렉트 유도

---

## 🧠 핵심 데이터 모델 (프론트 관점)

- **Room**
    - id, title, timezone(KST 기본), createdAt
- **Member**
    - id, name, avatar(optional)
- **Availability**
    - memberId, dayOfWeek, blocks(선택된 시간 블록들)
- **FreeTime**
    - dayOfWeek, blocks(교집합/합집합 등 정책에 따라)

---

## 🧩 타임테이블 UX 스펙 (when2meet 느낌)

- 시간 단위: 30분(또는 15분) 그리드
- 드래그 동작:
    - drag start → drag move → drag end
    - “선택” / “해제” 모드 결정(첫 셀 상태 기준)
- 요일 선택:
    - Tabs/Segmented Control로 요일 전환
- 저장:
    - 로컬 UI 즉시 반영(Optimistic) → API 저장 → 실패 시 롤백

---

## 🗺️ 로드맵 (Future)

- [ ]  시간표 이미지 업로드 → OCR/파싱(추후)
- [ ]  익명 참여(로그인 없이도 닉네임으로 참여) 옵션
- [ ]  멤버별 색상/가시성 토글
- [ ]  결과 공유(“이 시간대가 베스트” 카드 생성)
- [ ]  모바일 드래그 UX 최적화(스크롤/드래그 충돌 해결)

---

## ✅ 개발 컨벤션 (권장)

- 컴포넌트는 “작게 쪼개기”
- `lib/time.ts`에 시간표 변환 로직(요일/인덱스/블록 계산)을 몰아넣고 UI는 최대한 얇게
- API는 `lib/api.ts`에 통합하고 타입은 `types.ts`로 분리(원하면 추가)