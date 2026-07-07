import { useEffect, useRef } from "react";
import MainSetup from "../React/MainSetupReact";

export type ScrumboardEventType =
    | "contract-discussed-changed"
    | "discussed-reset"
    | "task-hours-changed"
    | "hours-reset"
    | "task-status-changed"
    | "planning-changed";

export type ScrumboardEventHandlers = Partial<
    Record<ScrumboardEventType, (payload: any) => void>
>;

const EVENT_TYPES: ScrumboardEventType[] = [
    "contract-discussed-changed",
    "discussed-reset",
    "task-hours-changed",
    "hours-reset",
    "task-status-changed",
    "planning-changed",
];

/**
 * Subskrybuje strumień SSE scrumboarda.
 * @param handlers mapa typ zdarzenia → handler (aktualizuje repository.items + stan)
 * @param onReconnect wywoływane po ponownym połączeniu (po zerwaniu) — pełny refetch
 */
export function useScrumboardEvents(
    handlers: ScrumboardEventHandlers,
    onReconnect?: () => void
) {
    // Trzymamy najświeższe handlery w ref, aby nie przepinać EventSource przy każdym renderze
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;
    const onReconnectRef = useRef(onReconnect);
    onReconnectRef.current = onReconnect;

    useEffect(() => {
        const source = new EventSource(`${MainSetup.serverUrl}scrumboard/events`, {
            withCredentials: true,
        });
        let hadError = false;

        const listeners: Array<[string, (e: MessageEvent) => void]> = [];
        for (const type of EVENT_TYPES) {
            const listener = (event: MessageEvent) => {
                const handler = handlersRef.current[type];
                if (!handler) return;
                try {
                    handler(event.data ? JSON.parse(event.data) : {});
                } catch (err) {
                    console.error(`SSE handler error (${type}):`, err);
                }
            };
            source.addEventListener(type, listener as EventListener);
            listeners.push([type, listener]);
        }

        source.onopen = () => {
            // Po reconnekcie (po błędzie) przeładuj dane — brak historii zdarzeń
            if (hadError) {
                hadError = false;
                onReconnectRef.current?.();
            }
        };
        source.onerror = () => {
            hadError = true; // EventSource sam ponowi połączenie
        };

        return () => {
            for (const [type, listener] of listeners)
                source.removeEventListener(type, listener as EventListener);
            source.close();
        };
    }, []);
}
