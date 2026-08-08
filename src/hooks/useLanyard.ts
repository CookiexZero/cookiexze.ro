import { useEffect, useRef, useState } from 'react';
import type { LanyardData } from '../lib/discord';

const REST = 'https://api.lanyard.rest/v1/users';
const SOCKET = 'wss://api.lanyard.rest/socket';

const OP_EVENT = 0;
const OP_HELLO = 1;
const OP_INITIALIZE = 2;
const OP_HEARTBEAT = 3;

export type LanyardState = {
  presence: LanyardData | null;
  /** False when the account hasn't joined discord.gg/lanyard — presence is
   *  simply unavailable then, which is not an error worth shouting about. */
  monitored: boolean;
  loading: boolean;
};

/**
 * Live Discord presence via Lanyard.
 *
 * A REST call decides up front whether the user is monitored at all; only then
 * is the WebSocket opened, which pushes presence changes as they happen.
 */
export function useLanyard(id: string): LanyardState {
  const [state, setState] = useState<LanyardState>({
    presence: null,
    monitored: true,
    loading: true,
  });
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const connect = () => {
      if (cancelled) return;
      const socket = new WebSocket(SOCKET);
      socketRef.current = socket;

      socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data as string) as {
          op: number;
          d: unknown;
          t?: string;
        };

        if (message.op === OP_HELLO) {
          attempt = 0;
          const { heartbeat_interval } = message.d as {
            heartbeat_interval: number;
          };
          socket.send(
            JSON.stringify({ op: OP_INITIALIZE, d: { subscribe_to_id: id } }),
          );
          heartbeat = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ op: OP_HEARTBEAT }));
            }
          }, heartbeat_interval);
          return;
        }

        if (message.op === OP_EVENT) {
          setState({
            presence: message.d as LanyardData,
            monitored: true,
            loading: false,
          });
        }
      });

      socket.addEventListener('close', () => {
        if (heartbeat) clearInterval(heartbeat);
        if (cancelled) return;
        // Exponential backoff, capped at 30s, so a flaky network doesn't spin.
        const delay = Math.min(1000 * 2 ** attempt++, 30_000);
        retry = setTimeout(connect, delay);
      });
    };

    const start = async () => {
      try {
        const res = await fetch(`${REST}/${id}`, { cache: 'no-store' });
        const body = (await res.json()) as
          | { success: true; data: LanyardData }
          | { success: false; error: { code: string; message: string } };

        if (cancelled) return;

        if (!body.success) {
          setState({ presence: null, monitored: false, loading: false });
          return;
        }

        setState({ presence: body.data, monitored: true, loading: false });
        connect();
      } catch {
        if (!cancelled) {
          setState({ presence: null, monitored: false, loading: false });
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      if (heartbeat) clearInterval(heartbeat);
      if (retry) clearTimeout(retry);
      socketRef.current?.close();
    };
  }, [id]);

  return state;
}
