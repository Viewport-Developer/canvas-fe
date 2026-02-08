import { useEffect, useRef, useCallback, useMemo } from "react";
import { WebsocketProvider } from "y-websocket";
import { createYjsDoc, getYjsData, useYjsConnectionStore } from "../store/yjsStore";

export const useYjsConnection = (canvasId: string, wsUrl: string): void => {
  const doc = useMemo(() => {
    if (!canvasId || !wsUrl) return null;
    return createYjsDoc();
  }, [canvasId, wsUrl]);

  useEffect(() => {
    const yjsData = getYjsData(doc!);
    useYjsConnectionStore.getState().setYjsData(yjsData);
  }, [doc]);

  const providerRef = useRef<WebsocketProvider | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectFnRef = useRef<() => void | null>(null);

  const disconnect = useCallback(() => {
    useYjsConnectionStore.getState().resetConnection();
    providerRef.current?.destroy();
    providerRef.current = null;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= 5) return;
    reconnectAttemptsRef.current += 1;
    reconnectTimeoutRef.current = setTimeout(() => {
      connectFnRef.current?.();
    }, 3000);
  }, []);

  // WebSocket 연결 초기화 + 재연결 로직
  useEffect(() => {
    if (!doc || !wsUrl || !canvasId) return;

    const connect = () => {
      providerRef.current?.destroy();

      const provider = new WebsocketProvider(`${wsUrl}/canvas`, canvasId, doc);
      useYjsConnectionStore.getState().setClientId(provider.awareness.clientID);
      useYjsConnectionStore.getState().setAwareness(provider.awareness);

      provider.on("status", (event: { status: string }) => {
        if (event.status === "connected") {
          reconnectAttemptsRef.current = 0;
        }
        if (event.status === "disconnected") {
          reconnect();
        }
      });

      providerRef.current = provider;
    };

    connectFnRef.current = connect;
    connect();

    return () => {
      disconnect();
    };
  }, [doc, wsUrl, canvasId, disconnect, reconnect]);
};
