# 캔버스 드로잉 앱

React + TypeScript 기반의 실시간 협업 캔버스 드로잉 애플리케이션입니다.

## 기능

- ✏️ 자유 곡선 그리기
- ⬜ 도형 그리기 (사각형, 다이아몬드, 원)
- 📝 텍스트 추가
- 🧹 지우개
- 👆 선택 및 이동/리사이즈
- ✋ 팬 (캔버스 이동)
- 🔍 줌 (Ctrl + 스크롤)
- 🔄 실시간 협업 (y.js 기반)
- 🔗 URL 기반 캔버스 공유

## 기술 스택

- **프론트엔드**: React 19, TypeScript, Vite
- **상태 관리**: Zustand
- **스타일링**: styled-components
- **실시간 동기화**: y.js, y-websocket
- **백엔드**: TEMP2 프로젝트 (Node.js 클러스터 + MongoDB)

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 환경변수 설정

`.env` 파일을 생성하고 다음을 설정하세요:

```env
VITE_WS_URL=ws://localhost:1234
```

캔버스 ID는 URL 쿼리 파라미터로 자동 관리됩니다.

## 캔버스 ID 관리

캔버스 ID는 URL 쿼리 파라미터로 관리됩니다:

- **자동 생성**: URL에 `canvasId`가 없으면 자동으로 생성되어 URL에 추가됩니다
- **공유**: URL을 공유하면 같은 캔버스를 함께 편집할 수 있습니다
- **예시**: `http://localhost:5173?canvasId=canvas-abc123`

## 서버 연동

이 프로젝트는 `TEMP2` 디렉토리의 서버 프로젝트와 연동됩니다.

### 서버 프로젝트 실행

서버를 실행하려면 `TEMP2` 디렉토리에서:

```bash
cd ../TEMP2
npm install
npm run dev
```

### 서버 연동

이 애플리케이션은 y.js를 기반으로 상태 관리를 하며, WebSocket 서버를 통해 y.js 문서를 생성하고 동기화합니다.

- **자동 연결**: `VITE_WS_URL`이 설정되어 있고 서버가 실행 중이면 자동으로 연결됩니다.
- **실시간 동기화**: 서버를 통해 여러 클라이언트 간 실시간 협업이 가능합니다.
- **상태 관리**: 모든 드로잉 데이터(paths, shapes, texts)가 y.js를 통해 관리됩니다.

사용하기 전에 `TEMP2` 서버를 실행하세요.

## 프로젝트 구조

```
src/
├── components/        # React 컴포넌트
│   ├── Canvas.tsx    # 메인 캔버스 컴포넌트
│   ├── ToolBar.tsx   # 도구 모음
│   ├── TextInput.tsx # 텍스트 입력 컴포넌트
│   └── ...
├── hooks/            # 커스텀 훅
│   ├── useYjsConnection.ts  # y.js 연결 관리
│   ├── useDraw.ts    # 그리기 훅
│   ├── useShape.ts   # 도형 훅
│   ├── useText.ts    # 텍스트 훅
│   └── ...
├── store/            # Zustand 스토어 + y.js 통합
│   ├── yjsStore.ts   # y.js 문서 관리
│   ├── pathStore.ts  # 경로 데이터
│   ├── shapeStore.ts # 도형 데이터
│   ├── textStore.ts  # 텍스트 데이터
│   └── ...
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
│   ├── yjsBindings.ts      # y.js와 Zustand 바인딩
│   ├── yjsSync.utils.ts    # y.js 동기화 유틸
│   └── ...
└── constants/        # 상수 정의
```

## 주요 파일

- `src/App.tsx` - 메인 앱 컴포넌트 (캔버스 ID 관리, y.js 연결 초기화)
- `src/hooks/useYjsConnection.ts` - y.js WebSocket 연결 관리
- `src/store/yjsStore.ts` - y.js 문서 및 awareness 관리
- `src/utils/yjsBindings.ts` - y.js와 Zustand 스토어 바인딩
- `src/components/Canvas.tsx` - 메인 캔버스 렌더링 및 이벤트 처리

## 개발 가이드

### y.js 통합

이 프로젝트는 y.js를 사용하여 상태 관리와 실시간 협업을 구현합니다:

- **WebSocket 연결**: `VITE_WS_URL`이 설정되어 있으면 서버에 자동으로 연결하여 y.js 문서를 생성합니다.
- **자동 재연결**: 연결이 끊어지면 최대 5회까지 자동 재연결을 시도합니다.
- **데이터 동기화**: `paths`, `shapes`, `texts` 배열이 y.js를 통해 자동 동기화됩니다.
- **Awareness**: 다른 사용자의 커서 위치 및 상태를 실시간으로 표시합니다.

### 상태 관리

- **Zustand**: 로컬 상태 관리 (도구 선택, 뷰포트 등)
- **y.js**: 공유 상태 관리 (경로, 도형, 텍스트)
- **바인딩**: `yjsBindings.ts`에서 y.js Y.Array와 Zustand 스토어를 양방향 바인딩

### 도구 시스템

각 도구는 독립적인 훅으로 구현되어 있습니다:

- `useDraw` - 자유 곡선 그리기
- `useShape` - 도형 그리기
- `useText` - 텍스트 추가
- `useEraser` - 지우개
- `useSelect` - 선택 및 이동/리사이즈
- `usePan` - 팬 (캔버스 이동)
- `useZoom` - 줌

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물은 dist/ 디렉토리에 생성됩니다
```
