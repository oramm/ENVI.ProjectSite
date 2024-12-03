import React, { useEffect, useState } from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { MailData } from "../../../../Typings/bussinesTypes";
import { mailsToCheckRepository } from "../OffersController";
import { MailsFilterBody } from "./MailsFilterBody";
import { SetAsGoodToOfferButton } from "./MailsModalButtons";
import { Button, Modal } from "react-bootstrap";

export default function MailsToCheckList({ show, handleClose }: { show: boolean; handleClose: () => void }) {
    const [activeMailBody, setActiveMailBody] = useState<string>("");
    const [activeMailId, setActiveMailId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!activeMailId) return;
            setActiveMailBody("Ładuję dane...");
            const response: MailData = await mailsToCheckRepository.loadItemsFromServerPOST(
                [{ uid: activeMailId }],
                "getEmailDetails"
            );
            setActiveMailBody(response.body!);
        }
        fetchData();
    }, [activeMailId]);

    function renderRowContent(dataItem: MailData, isActive: boolean = false) {
        function handleRowClick() {
            if (activeMailId !== dataItem.id) {
                setActiveMailId(dataItem.id);
            }
        }

        return (
            <div onClick={handleRowClick}>
                <div>
                    Od: <strong>{dataItem.from}</strong>, Do <strong>{dataItem.to}</strong> Otrzymano: {dataItem.date}
                </div>
                <div className="mb-1">Temat: {dataItem.subject}</div>
                {isActive && (
                    <>
                        "Pierwsze 500 znaków maila:"
                        <div
                            style={{
                                maxWidth: "800px", // Ograniczenie szerokości
                                wordWrap: "break-word", // Łamanie długich słów
                                whiteSpace: "pre-wrap", // Obsługa nowych linii w tekście
                            }}
                            dangerouslySetInnerHTML={{ __html: activeMailBody?.substring(0, 300) + "..." }}
                        ></div>
                        {renderMenu()}
                    </>
                )}
            </div>
        );
    }

    function renderMenu() {
        return <SetAsGoodToOfferButton onError={() => {}} />;
    }

    return (
        <Modal
            size="xl"
            show={show}
            onHide={handleClose}
            onClick={(e: any) => e.stopPropagation()}
            onDoubleClick={(e: any) => e.stopPropagation()}
        >
            <Modal.Header closeButton>
                <Modal.Title>Lista maili do sprawdzenia</Modal.Title>
            </Modal.Header>
            <FilterableTable<MailData>
                id="mailsTocheck"
                tableStructure={[{ header: undefined, renderTdBody: renderRowContent }]}
                AddNewButtonComponents={[]}
                isDeletable={true}
                repository={mailsToCheckRepository}
                FilterBodyComponent={MailsFilterBody}
            />
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Zamknij
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
