import { useEffect, useState } from "react";
import MainSetup from "../React/MainSetupReact";

export interface SbOwnAccessView {
    status: "INVITED" | "ACTIVE";
    githubState: "PENDING" | "LINKED" | "UNLINKED";
    githubLogin: string | null;
    driveState: "READY" | "MISSING";
    isGrantedManually: boolean;
}

export interface SbOwnAccess {
    canManage: boolean;
    canSeeSb: boolean;
    sb: SbOwnAccessView | null;
}

export async function fetchSbAccess(): Promise<SbOwnAccess | "error"> {
    try {
        const response = await fetch(`${MainSetup.serverUrl}sbAccess/access`, { credentials: "include" });
        if (response.status === 401 || response.status === 403)
            return { canManage: false, canSeeSb: false, sb: null };
        if (!response.ok) return "error";
        return await response.json();
    } catch {
        return "error";
    }
}

export async function linkOwnGithubAccount(login: string): Promise<
    { ok: true; result: string; note: string } | { ok: false; status: number; message: string }
> {
    try {
        const response = await fetch(`${MainSetup.serverUrl}sbAccess/me/githubAccount`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ githubLogin: login }),
        });
        if (!response.ok) {
            let message = "";
            try {
                const body = await response.json();
                if (typeof body?.errorMessage === "string") message = body.errorMessage;
            } catch { /* Odpowiedź bez JSON zachowuje kod błędu. */ }
            return { ok: false, status: response.status, message };
        }
        const body = await response.json();
        return { ok: true, result: body.result, note: body.note };
    } catch {
        return { ok: false, status: 0, message: "" };
    }
}

export function useSbAccess(enabled = true) {
    const [view, setView] = useState<{
        state: "loading" | "error" | "denied" | "granted";
        access: SbOwnAccess | null;
    }>({ state: enabled ? "loading" : "denied", access: null });
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        if (!enabled) {
            setView({ state: "denied", access: null });
            return;
        }
        let active = true;
        setView({ state: "loading", access: null });
        fetchSbAccess().then(access => {
            if (!active) return;
            setView(access === "error"
                ? { state: "error", access: null }
                : { state: access.canSeeSb && access.sb ? "granted" : "denied", access });
        });
        return () => { active = false; };
    }, [enabled, revision]);

    return {
        ...(enabled ? view : { state: "denied" as const, access: null }),
        reload: () => setRevision(value => value + 1),
    };
}
