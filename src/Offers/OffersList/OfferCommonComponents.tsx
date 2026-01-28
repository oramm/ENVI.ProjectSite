import React from "react";
import { ExternalOffer, OurOffer } from "../../../Typings/bussinesTypes";

export function OfferTenderLink({ offer }: { offer: OurOffer | ExternalOffer }) {
    if (!("tenderUrl" in offer) || !offer.tenderUrl) return <>{offer.alias}</>;
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
