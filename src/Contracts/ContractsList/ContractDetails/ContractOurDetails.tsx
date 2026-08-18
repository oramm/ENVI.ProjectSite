import React, { createContext, useContext, useEffect, useState } from "react";
import { Container, Card, Col, Row, Button, Alert, Placeholder } from "react-bootstrap";
import { ContractsSettlementData, Invoice, OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import MainSetup from "../../../React/MainSetupReact";
import Tools from "../../../React/Tools/Tools";
import ToolsDate from "../../../React/Tools/ToolsDate";
import { InvoiceStatusBadge, MyTooltip } from "../../../View/Resultsets/CommonComponents";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { contractsSettlementRepository, invoicesRepository } from "../ContractsController";
import { useContractDetails } from "./ContractDetailsContext";
import { InvoiceAddNewModalButton } from "../../../Erp/InvoicesList/Modals/InvoiceModalButtons";
import ToolsFetch from "../../../React/Tools/ToolsFetch";

export default function ContractOurDetails() {
    const { contract, setContract, contractsRepository } = useContractDetails();
    const [settlemenData, setSettlemenData] = useState(undefined as ContractsSettlementData | undefined);
    const [invoices, setInvoices] = useState([] as Invoice[]);
    const [externalUpdate, setExternalUpdate] = useState(0);
    const [summarySheet, setSummarySheet] = useState(undefined as { url: string } | undefined);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState(undefined as string | undefined);

    if (!contract) return <Alert variant="danger">Nie wybrano umowy</Alert>;
    if (!contract._lastUpdated) return <Alert variant="danger">Umowa nie ma daty aktualizacji</Alert>;

    //fetch data
    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        if (!contract?.id) throw new Error("Nie wybrano kontraktu");
        const contractIdString = contract.id.toString();
        const fetchSettlementData = (
            await contractsSettlementRepository.loadItemsFromServerPOST([{ id: contractIdString }])
        )[0];
        // Bez uprawnień do faktur nie ma po co pytać serwera - odpowiedziałby 403.
        const fetchInvoicesData = MainSetup.canViewInvoices()
            ? await invoicesRepository.loadItemsFromServerPOST([{ contractId: contractIdString }])
            : [];
        try {
            const [settlementData] = await Promise.all([fetchSettlementData, fetchInvoicesData]);
            setSettlemenData(settlementData);
            setInvoices(fetchInvoicesData);
            setExternalUpdate((prevState) => prevState + 1);
        } catch (error) {
            console.error("Error fetching data", error);
            // Handle error as you see fit
        }
    }

    function renderInvoiceTotaValue(invoice: Invoice) {
        return (
            <>
                {invoice._totalNetValue && <div className="text-end">{Tools.formatNumber(invoice._totalNetValue)}</div>}
            </>
        );
    }

    function renderCoordinatorData() {
        if (!contract)
            return (
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
            );
        const contractTyped = contract as OurContract;
        const coordinatorName = contractTyped._manager
            ? `${contractTyped._manager.name} ${contractTyped._manager.surname}`
            : "Nie określono";
        return <>{`Koordynator(ka): ${coordinatorName}`}</>;
    }

    /**
     * Arkusz powstaje po stronie serwera na Dysku kontraktu - tu tylko wołamy endpoint
     * i otwieramy wynik. Link zostaje też w alercie, bo przeglądarka potrafi zablokować
     * window.open otwierane po odpowiedzi serwera (poza gestem użytkownika).
     */
    async function generateSummarySheet() {
        if (!contract?.id) return;
        setIsGeneratingSummary(true);
        setSummaryError(undefined);
        setSummarySheet(undefined);
        try {
            const result = await ToolsFetch.fetchJsonWithSafeError(
                MainSetup.serverUrl + "contractInvoiceSummarySheet",
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contractId: contract.id }),
                },
                "Nie udało się wygenerować arkusza podsumowującego"
            );
            setSummarySheet(result);
            if (result?.url) window.open(result.url, "_blank");
        } catch (error) {
            setSummaryError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsGeneratingSummary(false);
        }
    }

    function renderActionsMenu() {
        const contractTyped = contract as OurContract;
        return (
            <>
                <InvoiceAddNewModalButton
                    modalProps={{
                        onAddNew: async () => {
                            // Faktura jest już zapisana, a modal czeka na ten callback - nieudane
                            // odświeżenie widoku nie może wyglądać jak nieudany zapis i blokować
                            // zamknięcia. Dane wrócą przy następnym wejściu w kontrakt.
                            try {
                                await fetchData();
                            } catch (error) {
                                console.error("Nie udało się odświeżyć danych kontraktu po dodaniu faktury", error);
                            }
                        },
                        contextData: contract,
                    }}
                    buttonProps={{ buttonCaption: "Dodaj fakturę" }}
                />
                {/* Bez folderu na Dysku nie ma gdzie zapisać arkusza - backend i tak by odmówił. */}
                {MainSetup.canViewInvoices() && contractTyped.gdFolderId && (
                    <Button
                        variant="outline-secondary"
                        // size="sm" jak w GeneralAddNewModalButton - inaczej ten przycisk
                        // jest wyższy od sąsiada w tym samym rzędzie.
                        size="sm"
                        className="ms-2"
                        disabled={isGeneratingSummary}
                        onClick={generateSummarySheet}
                    >
                        {isGeneratingSummary ? "Generuję..." : "Arkusz podsumowujący"}
                    </Button>
                )}
            </>
        );
    }
    return (
        <Card>
            <Card.Body>
                <Container>
                    <Row className="mt-3">
                        <Col>{contract.comment && <p>Opis: {contract.comment}</p>}</Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>{renderActionsMenu()}</Col>
                    </Row>
                    {summaryError && (
                        <Row className="mt-3">
                            <Col>
                                <Alert variant="danger" dismissible onClose={() => setSummaryError(undefined)}>
                                    {summaryError}
                                </Alert>
                            </Col>
                        </Row>
                    )}
                    {summarySheet?.url && (
                        <Row className="mt-3">
                            <Col>
                                <Alert variant="success" dismissible onClose={() => setSummarySheet(undefined)}>
                                    Arkusz podsumowujący gotowy.{" "}
                                    <Alert.Link href={summarySheet.url} target="_blank" rel="noreferrer">
                                        Otwórz arkusz
                                    </Alert.Link>
                                </Alert>
                            </Col>
                        </Row>
                    )}
                    <Row className="mt-3 text-end">
                        <Col sm={4} md={2}>
                            <div>Wartość netto, zł:</div>
                            {settlemenData && Tools.isNumber(settlemenData.value) ? (
                                <h5>{Tools.formatNumber(settlemenData.value)}</h5>
                            ) : (
                                "Jeszcze nie określono"
                            )}
                        </Col>
                        <MyTooltip content="Na podstawie faktur wysłanych" placement="top">
                            <Col sm={4} md={2}>
                                <div>Rozliczono, zł:</div>
                                {settlemenData && Tools.isNumber(settlemenData?.totalIssuedValue) ? (
                                    <h5>{Tools.formatNumber(settlemenData.totalIssuedValue)}</h5>
                                ) : (
                                    "Jeszcze nie wysłano faktur"
                                )}
                            </Col>
                        </MyTooltip>
                        <MyTooltip content="Na podstawie faktur wysłanych" placement="top">
                            <Col sm={4} md={2}>
                                <div>Do rozliczenia, zł:</div>
                                {settlemenData && Tools.isNumber(settlemenData.remainingIssuedValue) ? (
                                    <h5>{Tools.formatNumber(settlemenData.remainingIssuedValue)}</h5>
                                ) : (
                                    "Jeszcze nie określono"
                                )}
                            </Col>
                        </MyTooltip>
                        <MyTooltip content="Na podstawie faktur zarejestrowanych" placement="top">
                            <Col sm={4} md={2} className="text-muted">
                                <div>Zarejestrowano, zł:</div>
                                {settlemenData && Tools.isNumber(settlemenData?.totalRegisteredValue) ? (
                                    <h5>{Tools.formatNumber(settlemenData.totalRegisteredValue)}</h5>
                                ) : (
                                    "Jeszcze nie wysłano faktur"
                                )}
                            </Col>
                        </MyTooltip>
                        <MyTooltip content="Na podstawie faktur zarejestrowanych" placement="top">
                            <Col sm={4} md={2} className="text-muted">
                                <div>Do zarejestrowania, zł:</div>
                                {settlemenData && Tools.isNumber(settlemenData.remainingRegisteredValue) ? (
                                    <h5>{Tools.formatNumber(settlemenData.remainingRegisteredValue)}</h5>
                                ) : (
                                    "Jeszcze nie określono"
                                )}
                            </Col>
                        </MyTooltip>
                    </Row>

                    {/* Wartości rozliczenia widzą wszystkie role kontraktowe, ale sam rejestr
                        faktur jest zamknięty dla pracownika kontraktowego (backend też go blokuje). */}
                    {MainSetup.canViewInvoices() && (
                    <Row className="mt-3">
                        <Col sm={12}>
                            <div>Faktury</div>
                        </Col>
                        <Col sm={12}>
                            <FilterableTable<Invoice>
                                id="invoices"
                                title=""
                                tableStructure={[
                                    { header: "Numer", objectAttributeToShow: "number", colMd: 1 },
                                    {
                                        header: "Sprzedaż",
                                        renderTdBody: (invoice: Invoice) => (
                                            <div className="text-end">{invoice.issueDate}</div>
                                        ),
                                        colMd: 2,
                                    },
                                    {
                                        header: "Status",
                                        renderTdBody: (invoice: Invoice) => (
                                            <InvoiceStatusBadge status={invoice.status} />
                                        ),
                                        colMd: 1,
                                    },
                                    {
                                        header: "Wysłano",
                                        renderTdBody: (invoice: Invoice) => (
                                            <div className="text-end">{invoice.sentDate}</div>
                                        ),
                                        colMd: 2,
                                    },
                                    { header: "Netto, zł", renderTdBody: renderInvoiceTotaValue, colMd: 2 },
                                    {
                                        header: "Termin płatności",
                                        renderTdBody: (invoice: Invoice) => (
                                            <div className="text-end">{invoice.paymentDeadline}</div>
                                        ),
                                        colMd: 2,
                                    },
                                ]}
                                initialObjects={invoices}
                                repository={invoicesRepository}
                                selectedObjectRoute={"/invoice/"}
                                isDeletable={false}
                                externalUpdate={externalUpdate}
                            />
                        </Col>
                    </Row>
                    )}
                </Container>

                <p className="tekst-muted small">
                    Koordynator(ka): {renderCoordinatorData()}
                    <br />
                    Aktualizacja: {ToolsDate.dateToDDmmmYYYYHHMM(contract._lastUpdated)}
                </p>
            </Card.Body>
        </Card>
    );
}
