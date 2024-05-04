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
import { OfferBondStatusBadge, OfferStatusBadge } from "../../View/Resultsets/CommonComponents";
import { Alert } from "react-bootstrap";
import {
    OfferBondAddNewModalButton,
    OfferBondDeleteModalButton,
    OfferBondEditModalButton,
} from "./OfferBonds/Modals/OfferBondModalButtons";
import Tools from "../../React/Tools";

export default function OffersSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderEntityData(offer: OurOffer | ExternalOffer) {
        return (
            <>
                <div>{offer.employerName}</div>
                <div className="muted">{offer._city.name}</div>
            </>
        );
    }

    function renderIcon(offer: OurOffer | ExternalOffer) {
        offer = offer as OurOffer | ExternalOffer;
        const icon = offer.isOur ? faHome : faFileLines;

        return <FontAwesomeIcon icon={icon} size="lg" />;
    }

    function renderNameDescription(offer: OurOffer | ExternalOffer) {
        return (
            <>
                <div>
                    {renderTenderLink(offer) ?? offer.alias} {renderStatus(offer)}
                </div>
                <div className="muted" style={{ whiteSpace: "pre-line" }}>
                    {offer.description}
                </div>
                {renderOfferBond(offer)}
            </>
        );
    }

    function renderOfferBond(offer: ExternalOffer) {
        if (offer.isOur) return null;
        if (!offer._offerBond)
            return (
                <OfferBondAddNewModalButton modalProps={{ onEdit: () => {}, initialData: offer, contextData: offer }} />
            );
        return (
            <div className="muted" style={{ whiteSpace: "pre-line" }}>
                <strong>Wadium:</strong> {Tools.formatNumber(offer._offerBond.value)} {offer._offerBond.form}{" "}
                <OfferBondStatusBadge status={offer._offerBond.status} /> {offer._offerBond.expiryDate} {""}
                <div>{offer._offerBond.paymentData}</div>
                <div>{offer._offerBond.comment} </div>
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
            </div>
        );
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

    function renderType(offer: OurOffer | ExternalOffer) {
        return (
            <>
                <div>{offer._type.name}</div>
                <div className="muted">{offer._type.description}</div>
            </>
        );
    }

    function renderStatus(offer: OurOffer | ExternalOffer) {
        if (!offer.status) return <Alert variant="danger">Brak statusu</Alert>;
        return <OfferStatusBadge status={offer.status} />;
    }

    return (
        <FilterableTable<OurOffer | ExternalOffer>
            id="Offers"
            title={title}
            FilterBodyComponent={OffersFilterBody}
            tableStructure={[
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIcon },
                { header: "Nazwa", renderTdBody: renderNameDescription },
                { header: "Typ", renderTdBody: renderType },
                { header: "Odbiorcy", renderTdBody: renderEntityData },
                { header: "Termin", objectAttributeToShow: "submissionDeadline" },
                { header: "Wysyłka", objectAttributeToShow: "form" },
            ]}
            AddNewButtonComponents={[OurOfferAddNewModalButton, ExternalOfferAddNewModalButton]}
            EditButtonComponent={OfferEditModalButton}
            isDeletable={true}
            repository={offersRepository}
            selectedObjectRoute={"/offer/"}
        />
    );
}
