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

## 기술 스택

- **프론트엔드**: React 19, TypeScript, Vite
- **상태 관리**: Zustand
- **스타일링**: styled-components
- **실시간 동기화**: y.js, y-websocket
- **백엔드**: 별도 프로젝트 (Node.js + Express + PostgreSQL)

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 환경변수 설정

`.env` 파일을 생성하고 다음을 설정하세요:

```env
VITE_WS_URL=ws://localhost:1234
VITE_CANVAS_ID=default-canvas
```

## 서버 연동

이 프로젝트는 별도의 서버 프로젝트와 연동됩니다.

### 서버 프로젝트 구축

서버 프로젝트를 구축하려면 다음 문서를 참조하세요:

- **`SERVER_SETUP.md`** - 서버 설정 상세 가이드
- **`SERVER_PROJECT_PLAN.md`** - 서버 프로젝트 구축 계획

### 서버 없이 사용

서버가 없어도 로컬에서 정상 동작합니다. 다만 실시간 협업 기능은 서버가 필요합니다.

## 프로젝트 구조

```
src/
├── components/     # React 컴포넌트
├── hooks/          # 커스텀 훅
├── store/          # Zustand 스토어 + y.js 통합
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수
└── constants/      # 상수 정의
```

## 주요 파일

- `src/App.tsx` - 메인 앱 컴포넌트
- `src/hooks/useYjsConnection.ts` - y.js WebSocket 연결 관리
- `src/store/yjsStore.ts` - y.js 문서 관리
- `src/store/yjsBindings.ts` - y.js와 Zustand 바인딩

## 개발 가이드

### y.js 통합

이 프로젝트는 y.js를 사용하여 실시간 협업을 구현합니다:

- **로컬 동작**: 서버 없이도 정상 동작
- **서버 연결**: 서버가 있으면 자동 연결 및 동기화
- **데이터 동기화**: `paths`, `shapes`, `texts` 배열이 자동 동기화

자세한 내용은 계획 파일(`.cursor/plans/`)을 참조하세요.
