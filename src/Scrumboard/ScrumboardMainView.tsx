import React, { useState } from "react";
import { Alert, Button, Card, Modal, Tab, Tabs } from "react-bootstrap";
import MainSetup from "../React/MainSetupReact";
import CurrentSprintTab from "./CurrentSprint/CurrentSprintTab";
import MyTasksTab from "./MyTasks/MyTasksTab";
import PlanningTab from "./Planning/PlanningTab";
import ScrumboardApi from "./ScrumboardApi";
import TimesSummaryTab from "./TimesSummary/TimesSummaryTab";
import "./Scrumboard.css";

interface ConfirmState {
    title: string;
    body: string;
    action: () => void;
}

/** Główny widok Scrumboarda z 4 zakładkami (następca arkuszy Google). */
export default function ScrumboardMainView() {
    const [activeKey, setActiveKey] = useState("currentSprint");
    const [confirm, setConfirm] = useState<ConfirmState | null>(null);
    const [reportUrl, setReportUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const canManage = MainSetup.isRoleAllowed(["ADMIN", "ENVI_MANAGER"]);

    function askResetDiscussed() {
        setConfirm({
            title: "Resetuj status omówienia",
            body: "Na pewno wyzerować „Omówiony na planowaniu” dla WSZYSTKICH umów?",
            action: () => runAction(() => ScrumboardApi.resetDiscussed()),
        });
    }
    function askResetHours() {
        setConfirm({
            title: "Resetuj czasy rzeczywiste",
            body: "Na pewno wyzerować wszystkie godziny rzeczywiste bieżącego tygodnia dla WSZYSTKICH zadań?",
            action: () => runAction(() => ScrumboardApi.resetHours()),
        });
    }
    async function runAction(fn: () => Promise<unknown>) {
        setConfirm(null);
        try {
            await fn();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }
    async function generateReport() {
        setReportUrl(null);
        try {
            const result = await ScrumboardApi.generateReport();
            setReportUrl(result.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    return (
        <Card className="scrumboard-view">
            <Card.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {reportUrl && (
                    <Alert variant="success" dismissible onClose={() => setReportUrl(null)}>
                        Raport wygenerowany.{" "}
                        <Alert.Link href={reportUrl} target="_blank" rel="noreferrer">
                            Otwórz arkusz
                        </Alert.Link>
                    </Alert>
                )}

                <div className="scrum-tabbar-wrap">
                    {canManage && (
                        <div className="scrum-tab-actions d-flex gap-2">
                            <Button variant="outline-secondary" size="sm" onClick={askResetDiscussed}>
                                Resetuj omówienie
                            </Button>
                            <Button variant="outline-secondary" size="sm" onClick={askResetHours}>
                                Resetuj czasy
                            </Button>
                            <Button variant="primary" size="sm" onClick={generateReport}>
                                Generuj raport
                            </Button>
                        </div>
                    )}
                    <Tabs
                        id="scrumboard-tabs"
                        activeKey={activeKey}
                        onSelect={(k) => setActiveKey(k ?? "currentSprint")}
                        className="mb-3"
                        mountOnEnter
                    >
                        <Tab eventKey="currentSprint" title="Aktualny Sprint">
                            <CurrentSprintTab />
                        </Tab>
                        <Tab eventKey="timesSummary" title="Podsumowanie godzin">
                            <TimesSummaryTab active={activeKey === "timesSummary"} />
                        </Tab>
                        <Tab eventKey="myTasks" title="Moje zadania">
                            <MyTasksTab />
                        </Tab>
                        <Tab eventKey="planning" title="Planowanie">
                            <PlanningTab />
                        </Tab>
                    </Tabs>
                </div>
            </Card.Body>

            <Modal show={!!confirm} onHide={() => setConfirm(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{confirm?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{confirm?.body}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirm(null)}>
                        Anuluj
                    </Button>
                    <Button variant="danger" onClick={() => confirm?.action()}>
                        Potwierdź
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}
