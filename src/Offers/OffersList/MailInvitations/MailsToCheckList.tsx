import React, { useEffect, useState } from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { mailsToCheckRepository } from "../OffersController";
import { MailsToCheckFilterBody } from "./MailsToCheckFilterBody";
import { SetAsGoodToOfferButton } from "./Modals/MailsModalButtons";
import { Button, Modal } from "react-bootstrap";
import { MailData } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/ToolsDate";

export default function MailsToCheckList({ show, handleClose }: { show: boolean; handleClose: () => void }) {
    const [activeMailBody, setActiveMailBody] = useState<string>("");
    const [activeMailId, setActiveMailId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!activeMailId) return;
            setActiveMailBody("Ładuję dane...");
            const response: MailData = await mailsToCheckRepository.loadCurrentItemDetailsFromServerPOST(
                "getEmailDetails"
            );
            mailsToCheckRepository.replaceCurrentItemById(response.id, response);
            mailsToCheckRepository.replaceItemById(response.id, response);
            setActiveMailBody(response.body || "treść maila nie została pobrana");
        }
        fetchData();
    }, [activeMailId]);

    function handleRowClick(dataItem: MailData) {
        if (activeMailId !== dataItem.id) {
            setActiveMailId(dataItem.id);
        }
    }

    function renderRowContent(dataItem: MailData, isActive: boolean = false) {
        return (
            <div onClick={() => handleRowClick(dataItem)}>
                <div>
                    Od: <strong>{dataItem.from}</strong>, Do <strong>{dataItem.to}</strong> Otrzymano:{" "}
                    {ToolsDate.formatTime(dataItem.date)}
                </div>
                <div className="mb-1">Temat: {dataItem.subject}</div>
                {isActive && (
                    <>
                        <div
                            style={{
                                marginLeft: "10px",
                                padding: "10px",
                                borderLeft: "solid 2pt rgb(241 146 146)",
                                backgroundColor: "#ebf5f0",
                                wordWrap: "break-word", // Łamanie długich słów
                                whiteSpace: "pre-wrap", // Obsługa nowych linii w tekście
                            }}
                        >
                            <p>Pierwsze 500 znaków maila:</p>
                            <div dangerouslySetInnerHTML={{ __html: activeMailBody?.substring(0, 300) + "..." }}></div>
                        </div>
                        {activeMailBody !== "Ładuję dane..." && <div className="mt-2 mb-2">{renderMenu()}</div>}
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
                FilterBodyComponent={MailsToCheckFilterBody}
            />
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Zamknij
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
