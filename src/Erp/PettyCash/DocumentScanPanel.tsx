import React, { useRef, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { analyzeDocument, ReceiptSuggestion } from "./pettyCashApi";
import { AiMetaInfo } from "../../View/CommonComponents/AiMetaInfo";

/**
 * Zdjęcie paragonu albo faktury zamiast przepisywania kwot.
 *
 * `capture="environment"` otwiera na telefonie tylnią kamerę od razu, a na komputerze
 * degraduje się do zwykłego wyboru pliku — więc jeden przycisk obsługuje oba urządzenia.
 *
 * Wynik jest **podpowiedzią**: wpada do pól formularza, które i tak widać w podglądzie
 * arkusza przed zatwierdzeniem. Dlatego komunikat mówi „sprawdź", a nie „gotowe".
 */
export default function DocumentScanPanel({
    onSuggestion,
}: {
    onSuggestion: (suggestion: ReceiptSuggestion) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
    const [aiMeta, setAiMeta] = useState<Pick<ReceiptSuggestion, "_model" | "_usage"> | null>(
        null
    );
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        setBusy(true);
        setMessage(null);
        setAiMeta(null);
        try {
            const suggestion = await analyzeDocument(file);
            onSuggestion(suggestion);
            // Brak zużycia = bramka nie przepuściła tekstu do modelu, więc nic nie kosztowało.
            if (suggestion._model || suggestion._usage)
                setAiMeta({ _model: suggestion._model, _usage: suggestion._usage });
            setMessage(
                suggestion.recognized
                    ? { text: "Uzupełniono z dokumentu — sprawdź kwoty przed zapisem.", ok: true }
                    : { text: suggestion.reason ?? "Nie udało się nic odczytać.", ok: false }
            );
        } catch (error) {
            setMessage({ text: (error as Error).message, ok: false });
        } finally {
            setBusy(false);
            // Bez tego wybranie tego samego pliku drugi raz nie wywoła zdarzenia.
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className="mb-3">
            <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="d-none"
                onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <Button
                variant="outline-primary"
                size="sm"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
            >
                {busy ? (
                    <Spinner size="sm" animation="border" className="me-2" />
                ) : (
                    <FontAwesomeIcon icon={faCamera} className="me-2" />
                )}
                {busy ? "Odczytuję…" : "Wypełnij ze zdjęcia dokumentu"}
            </Button>

            {message && (
                <Alert
                    variant={message.ok ? "success" : "warning"}
                    className="py-2 mt-2 mb-0 small"
                >
                    {message.text}
                </Alert>
            )}

            {aiMeta && <AiMetaInfo _model={aiMeta._model} _usage={aiMeta._usage} />}
        </div>
    );
}
