import React, { useState, useEffect, useRef } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './GoodTipToast.css';

const tips = [
    "Używaj krótkich nazw folderów i plików - zamieniaj niektóre słowa na skróty, wyrzucaj zbędne słowa.",
    "Aktualizuj statusy kamieni milowych i kontraktów na bieżąco.",
    "Aktualizuj daty zakończenia kamieni i kontraktów.",
];

interface GoodTipToastProps {
    delay?: number;
}

export function GoodTipToast({ delay = 5000 }: GoodTipToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [tip, setTip] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const toastWrapperRef = useRef<HTMLDivElement>(null); 
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef(0);
    const remainingTimeRef = useRef(delay);

    useEffect(() => {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setTip(randomTip);
        setTimeout(() => setIsVisible(true), 100); 
    }, []);

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
    }, [isPaused, isVisible]);

    useEffect(() => {
        if (!isVisible || isPaused) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return;
        }

        const intervalTime = 50; 
        progressIntervalRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTimeRef.current;
            const totalElapsedTime = (delay - remainingTimeRef.current) + elapsedTime;
            const percentage = (totalElapsedTime / delay) * 100;
            
            if (toastWrapperRef.current) {
                toastWrapperRef.current.style.setProperty('--progress-width', `${Math.min(percentage, 100)}%`);
            }

            if (totalElapsedTime >= delay) {
                if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            }
        }, intervalTime);

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isPaused, isVisible, delay]);


    return (
        <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1050, overflowX: 'hidden' }}>
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
                    </Toast.Header>
                    <Toast.Body className="good-tip-toast-body">{tip}</Toast.Body>
                </Toast>
            </div>
        </ToastContainer>
    );
}