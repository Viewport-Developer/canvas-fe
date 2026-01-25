import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { createYjsDoc, getYjsData, type YjsCanvasData } from "../store/yjsStore";

export interface YjsConnectionState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}

export const useYjsConnection = (
  canvasId: string,
  wsUrl: string
): {
  doc: Y.Doc | null;
  yjsData: YjsCanvasData | null;
  connectionState: YjsConnectionState;
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
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3초

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

        provider.on("sync", (isSynced: boolean) => {
          if (isSynced) {
            setConnectionState((prev) => ({
              ...prev,
              connected: true,
              connecting: false,
            }));
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
  }, [doc, wsUrl, canvasId, disconnect]);

  return {
    doc,
    yjsData,
    connectionState,
    disconnect,
    reconnect,
  };
};
