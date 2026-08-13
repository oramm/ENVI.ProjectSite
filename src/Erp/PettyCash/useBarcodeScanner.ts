import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { describeRejection, normalizeTrackingNumber, ScanRejection } from "./trackingNumber";

export type ScannerStatus = "idle" | "starting" | "scanning" | "denied" | "unavailable" | "error";

/** Ten sam kod w kadrze dekoduje się kilka razy na sekundę — bez tego lista by się zapchała. */
const REPEAT_WINDOW_MS = 1500;

export type ScanDecision =
    | { action: "ignore" }
    | { action: "accept"; trackingNumber: string }
    | { action: "reject"; rejection: ScanRejection };

/**
 * Cała decyzja o pojedynczym odczycie, jako funkcja czysta — dzięki temu da się ją
 * przetestować bez kamery i bez Reacta. Hook tylko ją stosuje.
 */
export function evaluateScan(
    raw: string,
    known: readonly string[],
    previous: { value: string; at: number } | null,
    now: number
): ScanDecision {
    if (previous && previous.value === raw && now - previous.at < REPEAT_WINDOW_MS)
        return { action: "ignore" };

    const rejection = describeRejection(raw, known);
    if (rejection) return { action: "reject", rejection };

    return { action: "accept", trackingNumber: normalizeTrackingNumber(raw) as string };
}

/**
 * Zamknięcie kamery.
 *
 * Samo `controls.stop()` nie wystarcza: biblioteka próbuje jeszcze zmienić ustawienia
 * strumienia, a jeżeli ścieżka jest już zamykana, Chromium odrzuca to błędem
 * `setPhotoOptions failed`, który wypływa jako nieobsłużony wyjątek. Dlatego zamykamy
 * po kolei i sami: najpierw dekoder, potem ścieżki strumienia, na końcu odpinamy obraz.
 * Każdy krok osobno, bo blad jednego nie moze zablokować pozostałych.
 */
function stopCamera(controls: IScannerControls | null, video: HTMLVideoElement | null): void {
    try {
        controls?.stop();
    } catch {
        // biblioteka bywa hałaśliwa przy zamykaniu — zatrzymanie i tak następuje niżej
    }

    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => {
        try {
            track.stop();
        } catch {
            // ścieżka mogła już zostać zamknięta przez bibliotekę
        }
    });

    if (video) {
        try {
            video.srcObject = null;
        } catch {
            // nieistotne przy odmontowaniu komponentu
        }
    }
}

/**
 * Czyta numery nadania z kamery. Kamera jest wygodą, nie warunkiem pracy: pole numeru
 * w formularzu zostaje zwykłym polem tekstowym, więc odmowa dostępu albo słaba kamera
 * niczego nie blokują.
 *
 * Ograniczamy dekoder do Code 128, bo tylko taki kod jest na potwierdzeniu nadania —
 * to szybsze i mniej podatne na przypadkowy odczyt czegoś innego z tła.
 */
export function useBarcodeScanner({
    active,
    knownNumbers,
    onAccepted,
}: {
    active: boolean;
    knownNumbers: readonly string[];
    onAccepted: (trackingNumber: string) => void;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const previousRef = useRef<{ value: string; at: number } | null>(null);
    const knownRef = useRef(knownNumbers);
    const onAcceptedRef = useRef(onAccepted);

    const [status, setStatus] = useState<ScannerStatus>("idle");
    const [rejection, setRejection] = useState<ScanRejection | null>(null);
    const [acceptedCount, setAcceptedCount] = useState(0);

    // Świeże wartości bez restartu kamery — restart gubiłby ostrość i denerwował.
    useEffect(() => {
        knownRef.current = knownNumbers;
    }, [knownNumbers]);
    useEffect(() => {
        onAcceptedRef.current = onAccepted;
    }, [onAccepted]);

    const handleResult = useCallback((raw: string) => {
        const decision = evaluateScan(raw, knownRef.current, previousRef.current, Date.now());
        previousRef.current = { value: raw, at: Date.now() };

        if (decision.action === "ignore") return;
        if (decision.action === "reject") {
            setRejection(decision.rejection);
            return;
        }
        setRejection(null);
        setAcceptedCount((count) => count + 1);
        onAcceptedRef.current(decision.trackingNumber);
    }, []);

    useEffect(() => {
        if (!active) return;

        if (!navigator.mediaDevices?.getUserMedia) {
            setStatus("unavailable");
            return;
        }

        let cancelled = false;
        setStatus("starting");
        setRejection(null);
        previousRef.current = null;

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserMultiFormatReader(hints, {
            delayBetweenScanAttempts: 100,
            delayBetweenScanSuccess: 300,
        });

        reader
            .decodeFromConstraints(
                { video: { facingMode: "environment" } },
                videoRef.current ?? undefined,
                (result) => {
                    if (result) handleResult(result.getText());
                }
            )
            .then((controls) => {
                if (cancelled) {
                    controls.stop();
                    return;
                }
                controlsRef.current = controls;
                setStatus("scanning");
            })
            .catch((error: any) => {
                if (cancelled) return;
                setStatus(error?.name === "NotAllowedError" ? "denied" : "error");
            });

        return () => {
            cancelled = true;
            stopCamera(controlsRef.current, videoRef.current);
            controlsRef.current = null;
            setStatus("idle");
        };
    }, [active, handleResult]);

    return { videoRef, status, rejection, acceptedCount };
}
