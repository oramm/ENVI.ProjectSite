import React, { useState, useEffect, useRef } from 'react';
import { Badge, Toast, ToastContainer } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import MainSetup from '../../../MainSetupReact';
import './GoodTipToast.css';

interface Tip {
    text: string;
    isNew?: boolean;
    category?: 'general' | 'lettersAi' | 'invoices' | 'costInvoices';
}

const tipCategoryLabels: Record<NonNullable<Tip['category']>, string> = {
    general: 'Ogólne',
    lettersAi: 'Rozpoznawanie pism AI',
    invoices: 'Faktury',
    costInvoices: 'Faktury kosztowe',
};

const tips: Tip[] = [
    // Ogólne porady
    { text: "Używaj krótkich nazw folderów i plików - zamieniaj niektóre słowa na skróty, wyrzucaj zbędne słowa.", category: 'general' },
    { text: "Aktualizuj statusy kamieni milowych i kontraktów na bieżąco.", category: 'general' },
    { text: "Aktualizuj daty zakończenia kamieni i kontraktów.", category: 'general' },

    // Porady o analizie AI pism
    { text: "Rozpoznawanie pism AI uzupełnia: numer pisma, daty, opis, kontrakt. Zawsze sprawdź żółte pola (średnia pewność)!" , isNew: true, category: 'lettersAi' },
    { text: "Aby poprawnie zaimportować dane z pisma, załączaj czytelne PDF - AI nie rozpozna słabych kopii i zeskanowanych dokumentów." , isNew: true, category: 'lettersAi' },
    { text: "Pola zielone = wysoka pewność AI. Pola żółte = sprawdź. Pola szare = brakuje danych, wypełnij.", isNew: true, category: 'lettersAi' },

    // Faktury i KSeF
    { text: "Po ustawieniu statusu \"Wysłana\" możliwe będzie wysłanie faktury do KSeF. Po pomyślnym przesłaniu możesz pobrać UPO jako potwierdzenie przyjęcia.", isNew: true, category: 'invoices' },
    { text: "Kliknij \"Pobierz z KSeF\" aby pobrać nowe faktury kosztowe. Wybierz tryb przyrostowy (zostaną pobrane faktury, od ostatniej aktualizacji) lub weryfikacyjny (wybrany zakres dat), aby upewnić się, czy żadna faktura nie została pominięta.", isNew: true, category: 'costInvoices' },
    { text: "Każdej fakturze kosztowej możesz przypisać kategorię kosztową oraz określić procent odliczenia VAT.", isNew: true, category: 'costInvoices' },
    { text: "W sekcji \"Raport miesięczny\" sprawdzisz zestawienie faktur kosztowych za wybrany miesiąc. Raport możesz wyeksportować do CSV lub XML.", isNew: true, category: 'costInvoices' },
];

interface GoodTipToastProps {
    delay?: number;
}

export function GoodTipToast({ delay = 5000 }: GoodTipToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [tip, setTip] = useState<Tip>({ text: '' });
    const [isPaused, setIsPaused] = useState(false);
    const toastWrapperRef = useRef<HTMLDivElement>(null); 
    const systemRoleName = MainSetup.currentUserOrNull?.systemRoleName;

    const canViewInvoices = !!systemRoleName && ["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(systemRoleName);
    const canViewCostInvoices = !!systemRoleName && ["ADMIN", "ENVI_MANAGER"].includes(systemRoleName);
    const tipCategoryLabel = tip.category ? tipCategoryLabels[tip.category] : null;
    const displayDuration = tip.isNew ? delay * 2 : delay;
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef(0);
    const remainingTimeRef = useRef(displayDuration);

    useEffect(() => {
        const availableTips = tips.filter((currentTip) => {
            if (currentTip.category === 'invoices') return canViewInvoices;
            if (currentTip.category === 'costInvoices') return canViewCostInvoices;
            return true;
        });

        const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)] ?? tips[0];
        remainingTimeRef.current = randomTip.isNew ? delay * 2 : delay;
        setTip(randomTip);
        setTimeout(() => setIsVisible(true), 100); 
    }, [canViewCostInvoices, canViewInvoices, delay]);

    useEffect(() => {
        if (!isVisible) return;

        if (isPaused) {
            if (timerRef.current) clearTimeout(timerRef.current);
            const elapsedTime = Date.now() - startTimeRef.current;
            remainingTimeRef.current -= elapsedTime;
        } else {
            startTimeRef.current = Date.now();
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setIsVisible(false), remainingTimeRef.current);
        }
        
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [displayDuration, isPaused, isVisible]);

    useEffect(() => {
        if (!isVisible || isPaused) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return;
        }

        const intervalTime = 50; 
        progressIntervalRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTimeRef.current;
            const totalElapsedTime = (displayDuration - remainingTimeRef.current) + elapsedTime;
            const percentage = (totalElapsedTime / displayDuration) * 100;
            
            if (toastWrapperRef.current) {
                toastWrapperRef.current.style.setProperty('--progress-width', `${Math.min(percentage, 100)}%`);
            }

            if (totalElapsedTime >= displayDuration) {
                if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            }
        }, intervalTime);

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [displayDuration, isPaused, isVisible]);


    if (typeof document === 'undefined') return null;

    return createPortal(
        <ToastContainer
            position="bottom-end"
            className="p-3"
            style={{ zIndex: 1050, overflowX: 'hidden', position: 'fixed', right: 0, bottom: 0 }}
        >
            <div 
                ref={toastWrapperRef} 
                className={`good-tip-toast-wrapper ${isVisible ? 'show' : 'hide'}`}
            >
                <Toast
                    onClose={() => setIsVisible(false)}
                    show={true} 
                    autohide={false}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Dobra rada</strong>
                        {tipCategoryLabel && (
                            <Badge bg="secondary" text="light" pill className="ms-2 text-uppercase">
                                {tipCategoryLabel}
                            </Badge>
                        )}
                        {tip.isNew && (
                            <Badge bg="info" text="light" pill className="ms-2">
                                nowe
                            </Badge>
                        )}
                    </Toast.Header>
                    <Toast.Body className="good-tip-toast-body">{tip.text}</Toast.Body>
                </Toast>
            </div>
        </ToastContainer>,
        document.body,
    );
}