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

## 전체 아키텍처

![전체 아키텍처](https://tennis-upload.s3.ap-northeast-2.amazonaws.com/pictures/architecture.png)

## 주요 파일

- `src/App.tsx` - 메인 앱 컴포넌트 (캔버스 ID 관리, y.js 연결 초기화)
- `src/hooks/useYjsConnection.ts` - y.js WebSocket 연결 관리
- `src/store/yjsStore.ts` - y.js 문서 및 awareness 관리
- `src/utils/yjsBindings.ts` - y.js와 Zustand 스토어 바인딩
- `src/components/Canvas.tsx` - 메인 캔버스 렌더링 및 이벤트 처리

## 캔버스 ID 관리

캔버스 ID는 URL 쿼리 파라미터로 관리됩니다:

- **자동 생성**: URL에 `canvasId`가 없으면 자동으로 생성되어 URL에 추가됩니다
- **공유**: URL을 공유하면 같은 캔버스를 함께 편집할 수 있습니다
- **예시**: `http://localhost:5173?canvasId=canvas-abc123`
