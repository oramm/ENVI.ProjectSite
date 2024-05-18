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

    function renderNameDescription(offer: OurOffer | ExternalOffer, isActive: boolean = false) {
        return (
            <>
                <div>
                    {offer._type.name} | {renderTenderLink(offer) ?? offer.alias} {renderStatus(offer)}
                </div>
                <div className="text-muted" style={{ whiteSpace: "pre-line" }}>
                    {offer.description}
                </div>
                {renderOfferBond(offer, isActive)}
            </>
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
            <div className="mt-4 mb-4" style={{ whiteSpace: "pre-line" }}>
                <h6>
                    Wadium {Tools.formatNumber(offer._offerBond.value)}{" "}
                    <OfferBondStatusBadge status={offer._offerBond.status} />
                </h6>
                {offer._offerBond.form}{" "}
                {offer._offerBond.form === "Gwarancja" && <>ważna do: {offer._offerBond.expiryDate}</>}
                <div>{offer._offerBond.paymentData}</div>
                <div>{offer._offerBond.comment}</div>
                {isActive && renderOfferBondMenu(offer)}
            </div>
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
                { header: "Zamawiający", renderTdBody: renderEntityData },
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
