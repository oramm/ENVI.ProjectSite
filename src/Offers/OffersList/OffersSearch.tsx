import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { OffersRepository as offersRepository } from "./OffersController";
import { OffersFilterBody } from "./OfferFilterBody";
import {
    OfferEditModalButton,
    ExternalOfferAddNewModalButton,
    OurOfferAddNewModalButton,
} from "./Modals/OfferModalButtons";
import { ExternalOffer, OurOffer } from "../../../Typings/bussinesTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faHome } from "@fortawesome/free-solid-svg-icons";
import { DaysLeftBadge, OfferBondStatusBadge, OfferStatusBadge } from "../../View/Resultsets/CommonComponents";
import { Alert, Card } from "react-bootstrap";
import {
    OfferBondAddNewModalButton,
    OfferBondDeleteModalButton,
    OfferBondEditModalButton,
} from "./OfferBonds/Modals/OfferBondModalButtons";
import Tools from "../../React/Tools";
import { PartialEditTrigger } from "../../View/Modals/GeneralModalButtons";
import { OfferModalBodyStatus } from "./Modals/OfferModalBodiesPartial";
import { makeOfferStatusValidationSchema } from "./Modals/OfferValidationSchema";
import { useFilterableTableContext } from "../../View/Resultsets/FilterableTable/FilterableTableContext";
import ToolsDate from "../../React/ToolsDate";
import MainSetup from "../../React/MainSetupReact";

export default function OffersSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderEntityData(offer: OurOffer | ExternalOffer) {
        return (
            <>
                <div>{offer.employerName}</div>
            </>
        );
    }

    function renderIcon(offer: OurOffer | ExternalOffer) {
        offer = offer as OurOffer | ExternalOffer;
        const icon = offer.isOur ? faHome : faFileLines;
        return <FontAwesomeIcon icon={icon} size="lg" />;
    }

    function renderRowContent(offer: OurOffer | ExternalOffer, isActive: boolean = false) {
        if (!offer.submissionDeadline) throw new Error("Brak terminu składania oferty");
        return (
            <>
                <h5>
                    {offer._type.name} {offer._city.name} | {renderTenderLink(offer) ?? offer.alias}{" "}
                    <small>{renderStatus(offer)}</small>
                </h5>
                {renderEntityData(offer)}
                <div className="mb-2">
                    <span className="text-muted">Termin składania:</span>{" "}
                    <span className="fw-bold">{offer.submissionDeadline}</span>
                    <span> {renderDaysLeft(offer)}</span>
                    <span className="ml-3"> Forma wysyłki:</span> <span className="fw-bold">{offer.form}</span>
                </div>
                <div className="text-muted" style={{ whiteSpace: "pre-line" }}>
                    {offer.description}
                </div>
                {renderOfferBond(offer, isActive)}
            </>
        );
    }

    function renderDaysLeft(offer: OurOffer | ExternalOffer) {
        if (!offer.submissionDeadline) return null;
        if (!offer.status) return null;
        if (![MainSetup.OfferStatus.DECISION_PENDING, MainSetup.OfferStatus.TO_DO].includes(offer.status)) return null;
        const daysLeft = ToolsDate.countDaysLeftTo(offer.submissionDeadline);
        return <DaysLeftBadge daysLeft={daysLeft} />;
    }

    function renderTenderLink(offer: OurOffer | ExternalOffer) {
        if (!("tenderUrl" in offer) || !offer.tenderUrl) return null;
        return (
            <a
                href={(offer as ExternalOffer).tenderUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-decoration-none"
            >
                {offer.alias}
            </a>
        );
    }

    function renderStatus(offer: OurOffer | ExternalOffer) {
        if (!offer.status) return <Alert variant="danger">Brak statusu</Alert>;
        const { handleEditObject } = useFilterableTableContext<OurOffer | ExternalOffer>();

        return (
            <PartialEditTrigger
                modalProps={{
                    initialData: offer,
                    modalTitle: "Edycja statusu",
                    repository: offersRepository,
                    ModalBodyComponent: OfferModalBodyStatus,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ["status"],
                    makeValidationSchema: makeOfferStatusValidationSchema,
                }}
            >
                <OfferStatusBadge status={offer.status} />
            </PartialEditTrigger>
        );
    }

    function renderOfferBond(offer: ExternalOffer, isActive: boolean) {
        if (offer.isOur) return null;
        if (!offer._offerBond)
            return (
                isActive && (
                    <OfferBondAddNewModalButton
                        modalProps={{ onEdit: () => {}, initialData: offer, contextData: offer }}
                    />
                )
            );
        return (
            <Card className="mt-2 mb-2" style={{ whiteSpace: "pre-line" }}>
                <Card.Body>
                    <div className="card-title h6">
                        Wadium {Tools.formatNumber(offer._offerBond.value)} {offer._city.name}
                        <small>
                            <OfferBondStatusBadge status={offer._offerBond.status} />
                        </small>
                    </div>
                    <Card.Text>
                        {offer._offerBond.form}{" "}
                        {offer._offerBond.form === "Gwarancja" && <>ważna do: {offer._offerBond.expiryDate}</>}
                        <div>{offer._offerBond.paymentData}</div>
                        <div>{offer._offerBond.comment}</div>
                    </Card.Text>
                    {isActive && renderOfferBondMenu(offer)}
                </Card.Body>
            </Card>
        );
    }

    function renderOfferBondMenu(offer: ExternalOffer) {
        return (
            <div>
                <OfferBondEditModalButton
                    modalProps={{ onEdit: () => {}, initialData: offer, contextData: offer }}
                    buttonProps={{ layout: "horizontal" }}
                />{" "}
                <OfferBondDeleteModalButton
                    modalProps={{ onEdit: () => {}, initialData: offer, contextData: offer }}
                    buttonProps={{ layout: "horizontal" }}
                />
            </div>
        );
    }

    return (
        <FilterableTable<OurOffer | ExternalOffer>
            id="Offers"
            title={title}
            FilterBodyComponent={OffersFilterBody}
            tableStructure={[
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIcon },
                { header: "Oferta", renderTdBody: renderRowContent },
            ]}
            AddNewButtonComponents={[OurOfferAddNewModalButton, ExternalOfferAddNewModalButton]}
            EditButtonComponent={OfferEditModalButton}
            isDeletable={true}
            repository={offersRepository}
            selectedObjectRoute={"/offer/"}
        />
    );
}
