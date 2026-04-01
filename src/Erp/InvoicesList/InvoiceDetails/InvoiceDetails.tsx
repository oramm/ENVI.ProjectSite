import React, { createContext, useContext, useEffect, useState } from "react";
import { Container, Card, Col, Row, Button, Alert, Badge, Table } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Invoice, InvoiceItem } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/Tools/ToolsDate";
import { GDDocFileIconLink, InvoiceStatusBadge, SpinnerBootstrap } from "../../../View/Resultsets/CommonComponents";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { invoiceItemsRepository, invoicesRepository } from "../InvoicesController";
import { InvoiceItemAddNewModalButton, InvoiceItemEditModalButton } from "../Modals/InvoiceItemModalButtons";
import { ActionButton, CopyButton, InvoiceEditModalButton } from "../Modals/InvoiceModalButtons";
import { makeInvoiceValidationSchema } from "../Modals/InvoiceValidationSchema";
import Tools from "../../../React/Tools/Tools";
import KsefSection from "./KsefSection";
import CorrectionModal from "../Modals/CorrectionModal";
import { GeneralDeleteModalButton } from "../../../View/Modals/GeneralModalButtons";

const THIRD_PARTY_ROLE_LABELS: Record<number, string> = {
    1: "Faktor",
    2: "Odbiorca",
    3: "Podmiot pierwotny",
    4: "Dodatkowy nabywca",
    5: "Wystawca faktury",
    6: "Dokonujący płatności",
    7: "JST wystawca",
    8: "JST odbiorca",
    9: "Członek GV wystawca",
    10: "Członek GV odbiorca",
};

export default function InvoiceDetails() {
    const [invoice, setInvoice] = useState(invoicesRepository.currentItems[0]);
    const [invoiceItems, setInvoiceItems] = useState(undefined as InvoiceItem[] | undefined);
    const [errorMessage, setErrorMessage] = useState("");
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const [correctedInvoiceNumber, setCorrectedInvoiceNumber] = useState<string | null>(null);
    const navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        if (!id) throw new Error("Nie znaleziono id w adresie url");
        const idNumber = Number(id);

        async function fetchData() {
            // Zawsze pobieraj świeże dane z serwera (żeby mieć aktualne _corrections)
            const fetchInvoice = invoicesRepository.loadItemsFromServerPOST([{ id: idNumber }]);
            const fetchItems = invoiceItemsRepository.loadItemsFromServerPOST([{ invoiceId: id }]);
            try {
                const [invoicesData, itemsData] = await Promise.all([fetchInvoice, fetchItems]);
                const invoiceData = invoicesData?.find((inv: Invoice) => inv.id === idNumber);
                if (invoiceData) {
                    setInvoice(invoiceData);
                    invoicesRepository.addToCurrentItems(invoiceData.id);
                    
                    // Jeśli to korekta, pobierz numer faktury źródłowej
                    if (invoiceData.correctedInvoiceId && !invoiceData._correctedInvoice?.number) {
                        const correctedInvoices = await invoicesRepository.loadItemsFromServerPOST([{ id: invoiceData.correctedInvoiceId }]);
                        const correctedInvoice = correctedInvoices?.[0];
                        if (correctedInvoice?.number) {
                            setCorrectedInvoiceNumber(correctedInvoice.number);
                        }
                    }
                    document.title = `Faktura ${invoiceData._contract.ourId} | ${invoiceData.number || ""}`;
                }
                setInvoiceItems(itemsData);
            } catch (error) {
                console.error("Error fetching data", error);
                if (error instanceof Error) setErrorMessage(error.message);
            }
        }

        // Reset state przed załadowaniem nowej faktury
        setInvoice(undefined as unknown as Invoice);
        setInvoiceItems(undefined);
        setCorrectedInvoiceNumber(null);
        setErrorMessage("");
        
        fetchData();
    }, [id]);

    // Callback po utworzeniu korekty
    const handleCorrectionCreated = (correctionInvoice: Invoice) => {
        // Przekieruj do widoku korekty
        window.location.hash = `/invoice/${correctionInvoice.id}`;
    };

    function handleError(error: Error) {
        setErrorMessage(error.message || "An error occurred while copying the invoice.");
    }

    // Callback po usunięciu faktury
    const handleDelete = () => {
        navigate("/invoices");
    };

    if (!invoice) {
        return (
            <div>
                Ładuję dane... <SpinnerBootstrap />{" "}
            </div>
        );
    }

    // Czy można utworzyć korektę - tylko dla faktur z numerem KSeF i nie będących korektami
    const canCreateCorrection = invoice.ksefNumber && !invoice.correctedInvoiceId;

    // Czy faktura ma numer KSeF (nie można usunąć bezpośrednio)
    const hasKsefNumber = !!invoice.ksefNumber;

    function renderActionsMenu() {
        if (errorMessage)
            return (
                <Alert
                    style={{ whiteSpace: "pre-wrap" }}
                    className="mt-3"
                    variant="danger"
                    onClose={() => setErrorMessage("")}
                    dismissible
                >
                    {errorMessage}
                </Alert>
            );
        return (
            <>
                <ActionButton /> <CopyButton onError={handleError} />{" "}
                <InvoiceEditModalButton
                    modalProps={{
                        onEdit: setInvoice,
                        initialData: invoice,
                        makeValidationSchema: makeInvoiceValidationSchema,
                        repository: invoicesRepository,
                        shouldRetrieveDataBeforeEdit: true,
                    }}
                    buttonProps={{ buttonCaption: "Edytuj Fakturę" }}
                />
                {!hasKsefNumber && (
                    <GeneralDeleteModalButton<Invoice>
                        modalProps={{
                            onDelete: handleDelete,
                            initialData: invoice,
                            repository: invoicesRepository,
                            modalTitle: "Usuwanie faktury",
                        }}
                        buttonProps={{ layout: "horizontal" }}
                    />
                )}
            </>
        );
    }

    return (
        <InvoiceProvider invoice={invoice} setInvoice={setInvoice}>
            <Card>
                <Card.Body>
                    <Container>
                        <Row>
                            <Col sm={4} md={2}>
                                <div>Nr faktury:</div>
                                <h5>{invoice.number}</h5>
                            </Col>
                            <Col sm={4} md={3} lg="3">
                                <div>do Umowy:</div>
                                <h5>{invoice._contract.ourId}</h5>
                            </Col>
                            <Col sm={2}>
                                <InvoiceStatusBadge status={invoice.status} />
                                {invoice.correctedInvoiceId && (
                                    <Badge bg="warning" text="dark" className="ms-2">
                                        Korekta
                                    </Badge>
                                )}
                            </Col>
                            <Col md="auto">{renderActionsMenu()}</Col>
                            <Col sm={1} lg="auto">
                                {invoice._documentOpenUrl && <GDDocFileIconLink folderUrl={invoice._documentOpenUrl} />}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={4} md={2}>
                                <div>Data sprzedaży:</div>
                                {invoice.issueDate ? (
                                    <h5>{ToolsDate.dateYMDtoDMY(invoice.issueDate)} </h5>
                                ) : (
                                    "Jeszcze nie wystawiono"
                                )}
                            </Col>
                            <Col sm={4} md={2}>
                                <div>Data wysłania:</div>
                                {invoice.sentDate ? (
                                    <h5>{ToolsDate.dateYMDtoDMY(invoice.sentDate)}</h5>
                                ) : (
                                    "Jeszcze nie wysłano"
                                )}
                            </Col>
                            <Col sm={4} md={2}>
                                <div>Termin płatności:</div>
                                {invoice.paymentDeadline ? (
                                    <h5>{ToolsDate.dateYMDtoDMY(invoice.paymentDeadline)}</h5>
                                ) : (
                                    "Jeszcze nie okreśony"
                                )}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={4} md={2}>
                                <div>Wartość Brutto:</div>
                                <h5>{invoice._totalGrossValue && Tools.formatNumber(invoice._totalGrossValue)}</h5>
                            </Col>

                            <Col sm={4} md={2}>
                                <div>Wartość netto:</div>
                                <h5>{invoice._totalNetValue && Tools.formatNumber(invoice._totalNetValue)}</h5>
                            </Col>
                            <Col sm={12} md={8}>
                                <div>Nabywca</div>
                                <h5>{invoice._entity.name}</h5>
                                <h5>{invoice._entity.address}</h5>
                                <h5>NIP: {invoice._entity.taxNumber}</h5>
                            </Col>
                            {invoice.includeThirdParty && invoice._thirdParties && invoice._thirdParties.length > 0 && (
                                <Col sm={12} md={8}>
                                    <div>Podmioty 3 (KSeF)</div>
                                    <Table size="sm" striped bordered>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Rola</th>
                                                <th>Nazwa</th>
                                                <th>NIP</th>
                                                <th>Adres</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice._thirdParties.map((thirdParty, index) => (
                                                <tr key={`invoice-third-party-${index}`}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {typeof thirdParty.role === "number"
                                                            ? THIRD_PARTY_ROLE_LABELS[thirdParty.role] || `Rola ${thirdParty.role}`
                                                            : "-"}
                                                    </td>
                                                    <td>{thirdParty._entity?.name || "-"}</td>
                                                    <td>{thirdParty._entity?.taxNumber || "-"}</td>
                                                    <td>{thirdParty._entity?.address || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Col>
                            )}
                        </Row>
                        <Row>
                            <Col>
                                {invoice.description && (
                                    <Alert variant="succes">
                                        {" "}
                                        <p>Opis: {invoice.description}</p>{" "}
                                    </Alert>
                                )}
                            </Col>
                        </Row>

                        {/* Info o korekcie - jeśli ta faktura jest korektą */}
                        {invoice.correctedInvoiceId && (
                            <Alert variant="info" className="mt-3">
                                <strong>📋 Faktura korygująca</strong>
                                <br />
                                Ta faktura koryguje fakturę:{" "}
                                <Link to={`/invoice/${invoice.correctedInvoiceId}`}>
                                    {invoice._correctedInvoice?.number || correctedInvoiceNumber || `#${invoice.correctedInvoiceId}`}
                                </Link>
                                {invoice.correctionReason && (
                                    <>
                                        <br />
                                        <strong>Przyczyna:</strong> {invoice.correctionReason}
                                    </>
                                )}
                            </Alert>
                        )}

                        {/* Lista korekt tej faktury */}
                        {invoice._corrections && invoice._corrections.length > 0 && (
                            <Alert variant="warning" className="mt-3">
                                <strong>⚠️ Ta faktura ma korekty:</strong>
                                <ul className="mb-0 mt-2">
                                    {invoice._corrections.map((correction) => (
                                        <li key={correction.id}>
                                            <Link to={`/invoice/${correction.id}`}>
                                                {correction.number || `#${correction.id}`}
                                            </Link>
                                            {correction.correctionReason && ` - ${correction.correctionReason}`}
                                        </li>
                                    ))}
                                </ul>
                            </Alert>
                        )}

                        {/* Przycisk tworzenia korekty */}
                        {canCreateCorrection && (
                            <div className="mt-3">
                                <Button
                                    variant="outline-warning"
                                    onClick={() => setShowCorrectionModal(true)}
                                >
                                    ✏️ Utwórz korektę
                                </Button>
                            </div>
                        )}
                    </Container>

                    {invoiceItems ? (
                        <FilterableTable<InvoiceItem>
                            id="invoiceItems"
                            title=""
                            initialObjects={invoiceItems}
                            repository={invoiceItemsRepository}
                            AddNewButtonComponents={[InvoiceItemAddNewModalButton]}
                            EditButtonComponent={InvoiceItemEditModalButton}
                            tableStructure={[
                                { header: "Opis", objectAttributeToShow: "description", colMd: 7 },
                                {
                                    header: "Netto",
                                    renderTdBody: (item) => (
                                        <div className="text-end">{Tools.formatNumber(item._netValue)}</div>
                                    ),
                                    colMd: 2,
                                },
                                {
                                    header: "Brutto",
                                    renderTdBody: (item) => (
                                        <div className="text-end">{Tools.formatNumber(item._grossValue)}</div>
                                    ),
                                    colMd: 2,
                                },
                            ]}
                        />
                    ) : (
                        <>
                            "Ładowanie pozycji faktury..." <SpinnerBootstrap />
                        </>
                    )}

                    {/* Sekcja KSeF */}
                    <KsefSection 
                        invoice={invoice} 
                        onInvoiceUpdate={setInvoice} 
                        correctedInvoiceNumber={correctedInvoiceNumber}
                    />

                    <p className="tekst-muted small">
                        Przygotował(a): {`${invoice._owner.name} ${invoice._owner.surname}`}
                        <br />
                        Aktualizacja: {ToolsDate.dateToDDmmmYYYYHHMM(invoice._lastUpdated!)}
                    </p>
                </Card.Body>
            </Card>

            {/* Modal tworzenia korekty */}
            <CorrectionModal
                show={showCorrectionModal}
                onHide={() => setShowCorrectionModal(false)}
                invoice={invoice}
                onCorrectionCreated={handleCorrectionCreated}
            />
        </InvoiceProvider>
    );
}

// Utwórz kontekst
const InvoiceContext = createContext<{
    invoice: Invoice;
    setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}>({
    invoice: {} as Invoice,
    setInvoice: () => {},
});

type InvoiceProviderProps = {
    invoice: Invoice;
    setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
};

// Twórz dostawcę kontekstu, który przechowuje stan faktury
export function InvoiceProvider({ invoice, setInvoice, children }: React.PropsWithChildren<InvoiceProviderProps>) {
    if (!invoice) throw new Error("Invoice not found");

    return <InvoiceContext.Provider value={{ invoice, setInvoice }}>{children}</InvoiceContext.Provider>;
}

// Tworzy własny hook, który będzie używany przez komponenty podrzędne do uzyskania dostępu do faktury
export function useInvoice() {
    return useContext(InvoiceContext);
}
