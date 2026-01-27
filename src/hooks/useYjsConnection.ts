import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { createYjsDoc, getYjsData, type YjsCanvasData, setGlobalClientId } from "../store/yjsStore";
import { fetchCanvasShapes } from "../utils/api";

export interface YjsConnectionState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}

export interface RemoteCursor {
  clientId: number;
  position: { x: number; y: number } | null;
  color: string;
}

export const useYjsConnection = (
  canvasId: string,
  wsUrl: string
): {
  doc: Y.Doc | null;
  yjsData: YjsCanvasData | null;
  connectionState: YjsConnectionState;
  awareness: { getLocalState: () => unknown; setLocalStateField: (field: string, value: unknown) => void; getStates: () => Map<number, unknown>; on: (event: string, handler: () => void) => void; clientID: number } | null;
  remoteCursors: Map<number, RemoteCursor>;
  updateCursorPosition: (position: { x: number; y: number } | null) => void;
  disconnect: () => void;
  reconnect: () => void;
} => {
  // useMemo로 doc과 data 생성 (canvasId나 wsUrl이 없으면 null)
  const doc = useMemo(() => {
    if (!canvasId || !wsUrl) return null;
    return createYjsDoc();
  }, [canvasId, wsUrl]);

  const yjsData = useMemo(() => {
    if (!doc) return null;
    return getYjsData(doc);
  }, [doc]);
  const [connectionState, setConnectionState] = useState<YjsConnectionState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const providerRef = useRef<WebsocketProvider | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectFnRef = useRef<(() => void) | null>(null);
  const connectFnRef = useRef<((yDoc: Y.Doc, url: string, id: string) => void) | null>(null);
  const shapesLoadedRef = useRef(false); // API를 통해 도형 데이터를 로드했는지 여부
  const yjsDataRef = useRef<YjsCanvasData | null>(null); // yjsData를 ref로 저장하여 이벤트 핸들러에서 접근
  const [awareness, setAwareness] = useState<{ getLocalState: () => unknown; setLocalStateField: (field: string, value: unknown) => void; getStates: () => Map<number, unknown>; on: (event: string, handler: () => void) => void; clientID: number } | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<Map<number, RemoteCursor>>(new Map());
  const cursorColors = useRef<string[]>([]); // 사용자별 색상 저장
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3초

  // 사용자별 색상 생성 (HSL 색상 공간 사용)
  const generateColor = useCallback((clientId: number): string => {
    if (!cursorColors.current[clientId]) {
      const hue = (clientId * 137.508) % 360; // 황금각을 사용하여 색상 분산
      cursorColors.current[clientId] = `hsl(${hue}, 70%, 50%)`;
    }
    return cursorColors.current[clientId];
  }, []);

  // 커서 위치 업데이트
  const updateCursorPosition = useCallback((position: { x: number; y: number } | null) => {
    if (providerRef.current?.awareness) {
      providerRef.current.awareness.setLocalStateField('cursor', position);
    }
  }, []);

  // yjsData가 변경될 때마다 ref 업데이트
  useEffect(() => {
    yjsDataRef.current = yjsData;
  }, [yjsData]);

  // 연결 해제
  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionState({
      connected: false,
      connecting: false,
      error: null,
    });
    reconnectAttemptsRef.current = 0;
  }, []);

  // 재연결
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setConnectionState((prev) => ({
        ...prev,
        connecting: false,
        error: new Error("최대 재연결 시도 횟수를 초과했습니다."),
      }));
      return;
    }

    reconnectAttemptsRef.current += 1;
    setConnectionState((prev) => ({
      ...prev,
      connecting: true,
      error: null,
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      if (doc && wsUrl && connectFnRef.current) {
        connectFnRef.current(doc, wsUrl, canvasId);
      }
    }, reconnectDelay);
  }, [doc, wsUrl, canvasId]);

  // reconnect 함수를 ref에 저장
  useEffect(() => {
    reconnectFnRef.current = reconnect;
  }, [reconnect]);

  // 연결 초기화
  useEffect(() => {
    if (!doc || !wsUrl || !canvasId) {
      return;
    }

    // 연결 함수 (외부 시스템과 동기화하므로 useEffect 내부에 정의)
    const connectFn = (yDoc: Y.Doc, url: string, id: string) => {
      try {
        // 기존 provider가 있으면 정리
        if (providerRef.current) {
          providerRef.current.destroy();
        }

        setConnectionState({
          connected: false,
          connecting: true,
          error: null,
        });

        // WebSocket Provider 생성
        const provider = new WebsocketProvider(url, id, yDoc);

        // Awareness 설정
        setAwareness(provider.awareness);
        
        // clientId를 전역으로 저장
        setGlobalClientId(provider.awareness.clientID);

        // 다른 사용자의 커서 변경 감지 및 유저 수 확인
        const awarenessChangeHandler = () => {
          const states = provider.awareness.getStates();
          const newCursors = new Map<number, RemoteCursor>();
          const myClientId = provider.awareness.clientID;

          states.forEach((state: { cursor?: { x: number; y: number } }, clientId: number) => {
            // 자신의 커서는 제외
            if (clientId === myClientId) return;

            const cursor = state.cursor;
            if (cursor) {
              newCursors.set(clientId, {
                clientId,
                position: cursor,
                color: generateColor(clientId),
              });
            }
          });

          setRemoteCursors(newCursors);
        };

        provider.awareness.on('change', awarenessChangeHandler);
        // 초기 상태 설정
        awarenessChangeHandler();

        provider.on("status", (event: { status: string }) => {
          if (event.status === "connected") {
            setConnectionState({
              connected: true,
              connecting: false,
              error: null,
            });
            reconnectAttemptsRef.current = 0;
          } else if (event.status === "disconnected") {
            setConnectionState({
              connected: false,
              connecting: false,
              error: null,
            });
            // 자동 재연결 시도
            if (reconnectFnRef.current) {
              reconnectFnRef.current();
            }
          } else if (event.status === "connecting") {
            setConnectionState({
              connected: false,
              connecting: true,
              error: null,
            });
          }
        });

        provider.on("sync", async (isSynced: boolean) => {
          if (isSynced) {
            setConnectionState((prev) => ({
              ...prev,
              connected: true,
              connecting: false,
            }));

            // 동기화 완료 후, y.js 문서가 비어있으면 API를 통해 도형 데이터 로드
            if (!shapesLoadedRef.current && yjsDataRef.current) {
              const pathsArray = yjsDataRef.current.paths;
              const shapesArray = yjsDataRef.current.shapes;
              const textsArray = yjsDataRef.current.texts;

              // y.js 문서가 비어있는지 확인
              const isEmpty = pathsArray.length === 0 && shapesArray.length === 0 && textsArray.length === 0;

              if (isEmpty) {
                try {
                  console.log('[YJS Connection] API를 통해 도형 데이터 로드 시작');
                  const shapes = await fetchCanvasShapes(id);

                  // 도형 데이터를 y.js 배열에 추가
                  if (shapes.paths.length > 0) {
                    pathsArray.insert(0, shapes.paths);
                  }
                  if (shapes.shapes.length > 0) {
                    shapesArray.insert(0, shapes.shapes);
                  }
                  if (shapes.texts.length > 0) {
                    textsArray.insert(0, shapes.texts);
                  }

                  shapesLoadedRef.current = true;
                  console.log('[YJS Connection] 도형 데이터 로드 완료', {
                    paths: shapes.paths.length,
                    shapes: shapes.shapes.length,
                    texts: shapes.texts.length,
                  });
                } catch (error) {
                  console.error('[YJS Connection] 도형 데이터 로드 실패:', error);
                  // 에러가 발생해도 계속 진행
                }
              } else {
                shapesLoadedRef.current = true;
              }
            }
          }
        });

        providerRef.current = provider;
      } catch (error) {
        setConnectionState({
          connected: false,
          connecting: false,
          error: error instanceof Error ? error : new Error("연결 실패"),
        });
      }
    };

    // ref에 저장하여 재연결 시 사용
    connectFnRef.current = connectFn;

    // 초기 연결
    connectFn(doc, wsUrl, canvasId);

    return () => {
      disconnect();
    };
  }, [doc, wsUrl, canvasId, disconnect, generateColor]);

  return {
    doc,
    yjsData,
    connectionState,
    awareness,
    remoteCursors,
    updateCursorPosition,
    disconnect,
    reconnect,
  };
};
