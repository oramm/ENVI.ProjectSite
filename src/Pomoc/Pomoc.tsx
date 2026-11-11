import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { PomocButton, PomocDrawer, PomocMessage } from "@envi/agent-panel";
import MainSetup from "../React/MainSetupReact";
import ToolsFetch from "../React/Tools/ToolsFetch";
import { clearPomocHighlight, highlightPomocMarker, visiblePomocMarkers } from "./pomoc-markers";
import "@envi/agent-panel/style.css";
import "./Pomoc.css";

type Exchange = { role: "user" | "assistant"; content: string };
type Ticket = { title: string; description: string };
type Answer = { decision: string; text: string; reason?: string; conversation: Exchange[]; markers: string[]; ticket_draft: Ticket | null };
type Message = PomocMessage & { path?: string };

async function request(path: string, input?: unknown) {
    const response = await fetch(`${MainSetup.serverUrl}pomoc/${path}`, {
        credentials: "include",
        ...(input === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
    });
    if (response.status === 401) ToolsFetch.notifySessionExpired();
    if (!response.ok) throw new Error("Pomoc jest teraz niedostępna. Spróbuj ponownie później.");
    return response.json();
}

export default function Pomoc() {
    const location = useLocation();
    const [version, setVersion] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Exchange[]>([]);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [notice, setNotice] = useState("");
    const [manualDraft, setManualDraft] = useState("");
    const asking = useRef(false);
    const generation = useRef(0);
    const path = location.pathname;
    const currentPath = useRef(path);
    currentPath.current = path;
    const focusQuestion = () => document.querySelector<HTMLInputElement>('#envi-pomoc-pytanie')?.focus();
    const close = () => { setOpen(false); document.querySelector<HTMLButtonElement>('.envi-pomoc-button')?.focus(); };

    useEffect(() => {
        let active = true;
        request('available').then((data) => {
            if (active && data.available === true && typeof data.version === 'string') setVersion(data.version);
        }).catch(() => { /* Brak odpowiedzi nie udostępnia Pomocy. */ });
        document.addEventListener('click', clearPomocHighlight, true);
        return () => { active = false; generation.current++; clearPomocHighlight(); document.removeEventListener('click', clearPomocHighlight, true); };
    }, []);
    useEffect(() => { clearPomocHighlight(); setNotice(""); setManualDraft(""); }, [path]);
    useEffect(() => { if (open) focusQuestion(); }, [open]);
    useEffect(() => {
        if (!version) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            // Nie przejmujemy klawiatury formularzom i rozwiniętym menu.
            if (document.querySelector('.modal.show, [role="menu"], .dropdown-menu.show')) return;
            if (event.key === 'F1') { event.preventDefault(); setOpen(true); focusQuestion(); }
            if (event.key === 'Escape' && open) { event.preventDefault(); close(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [version, open]);

    async function ask(question: string) {
        if (asking.current) return;
        asking.current = true;
        const id = generation.current;
        setBusy(true); setTicket(null); setNotice(""); setManualDraft(""); clearPomocHighlight();
        setMessages((items) => [...items, { id: crypto.randomUUID(), role: 'user', text: question }]);
        try {
            const task = await request('ask', { question, history: conversation,
                screen: { name: document.title || 'PS ENVI', path }, markers: visiblePomocMarkers() });
            let result: Answer | undefined;
            for (let attempt = 0; attempt < 150; attempt++) {
                if (id !== generation.current) return;
                const status = await ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}sessionTaskStatus/${task.taskId}`, { credentials: 'include' });
                if (status.status === 'error') throw new Error('Pomoc nie odpowiedziała.');
                if (status.status === 'done') { result = status.result; break; }
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            if (!result) throw new Error('Upłynął czas oczekiwania na Pomoc.');
            if (id !== generation.current) return;
            setConversation(result.conversation);
            setTicket(result.ticket_draft);
            const allowed = result.decision === 'allowed' && !!result.text.trim();
            setMessages((items) => [...items, { id: crypto.randomUUID(), role: 'assistant', path,
                text: allowed ? result.text : result.reason || 'Pomoc jest teraz niedostępna.', refusal: !allowed,
                reportProblem: !allowed || !!result.ticket_draft,
                actions: allowed ? result.markers.map((id) => ({ id, label: 'Pokaż przycisk' })) : undefined }]);
            if (allowed && result.markers[0] && currentPath.current === path) highlightPomocMarker(result.markers[0]);
        } catch {
            if (id === generation.current) setMessages((items) => [...items, { id: crypto.randomUUID(), role: 'assistant',
                text: 'Nie udało się uzyskać odpowiedzi Pomocy. Spróbuj ponownie później.', refusal: true, reportProblem: true }]);
        } finally { asking.current = false; if (id === generation.current) setBusy(false); }
    }

    async function report() {
        const text = [ticket?.title || 'Pomoc ENVI: zgłoszenie z rozmowy', ticket?.description,
            `Ekran: ${path}\nPS ENVI ${version}`, ...messages.map((m) => `${m.role === 'user' ? 'Pytanie' : 'Odpowiedź'}: ${m.text}`)].filter(Boolean).join('\n\n');
        try { await navigator.clipboard.writeText(text); setNotice('Szkic zgłoszenia skopiowano do schowka. Przekaż go do ENVI.'); }
        catch { setNotice('Nie udało się skopiować szkicu. Skopiuj poniższy tekst i przekaż go do ENVI.'); setManualDraft(text); }
    }

    if (!version) return null;
    return <>
        <PomocButton open={open} busy={busy} onClick={() => open ? close() : setOpen(true)} />
        {open && createPortal(<>
            <PomocDrawer model={{ system: 'PS ENVI', systemLocative: 'PS ENVI', systemAccusative: 'PS ENVI', version,
                screen: path, busy,
                messages: messages.map((message) => message.role === 'assistant' && message.reportProblem
                    ? { ...message, text: `${message.text}\n\nSkopiuję opis do schowka — wklej go w wiadomości do administratora.` } : message),
                starters: ['Jaką mam rolę i uprawnienia?', 'Jak dodać sprawę?', 'Jak zarejestrować pismo?'] }}
                onClose={close} onAsk={(question) => void ask(question)}
                onNewConversation={() => { generation.current++; setMessages([]); setConversation([]); setTicket(null); setBusy(false); setNotice(""); setManualDraft(""); clearPomocHighlight(); }}
                onFeedback={(id, value) => setMessages((items) => items.map((m) => m.id === id && m.role === 'assistant' ? { ...m, feedback: value } : m))}
                onAction={(id, marker) => { if (messages.find((m) => m.id === id)?.path === currentPath.current) highlightPomocMarker(marker); }}
                onReport={() => void report()} />
            {notice && <div className="pomoc-notice" role="status">{notice}
                {manualDraft && <textarea aria-label="Szkic zgłoszenia" readOnly value={manualDraft} />}
                <button type="button" onClick={() => { setNotice(""); setManualDraft(""); }}>Zamknij komunikat</button>
            </div>}
        </>, document.body)}
    </>;
}
