import React, { useEffect } from 'react';
import FilterableTable from '../View/Resultsets/FilterableTable/FilterableTable';
import { OffersRepository as offersRepository } from './OffersController';
import { OffersFilterBody } from './OfferFilterBody';
import { OfferEditModalButton, ExternalOfferAddNewModalButton, OurOfferAddNewModalButton } from './Modals/OfferModalButtons';
import { Entity, ExternalOffer, OurOffer } from '../../Typings/bussinesTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faHome } from '@fortawesome/free-solid-svg-icons';
import { OfferStatusBadge } from '../View/Resultsets/CommonComponents';


export default function OffersSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderEntityData(offer: OurOffer | ExternalOffer) {
        return (
            <>
                <div>{offer.employerName}</div>
                <div className='muted'>{offer._city.name}</div>
            </>
        );
    }

    function renderIcon(offer: OurOffer | ExternalOffer) {
        offer = offer as OurOffer | ExternalOffer;
        const icon = offer.isOur ? faHome : faFileLines;

        return <FontAwesomeIcon icon={icon} size="lg" />
    }

    function renderNameDescription(offer: OurOffer | ExternalOffer) {
        return (
            <>
                <div >{offer.alias}</div>
                <div className='muted' style={{ whiteSpace: 'pre-line' }}>{offer.description}</div>
            </>
        );
    }

    function renderType(offer: OurOffer | ExternalOffer) {
        return (
            <>
                <div >{offer._type.name}</div>
                <div className='muted'>{offer._type.description}</div>
            </>
        );
    }

    function renderstatus(offer: OurOffer | ExternalOffer) {
        return <OfferStatusBadge status={offer.status} />;
    }

    return (
        <FilterableTable<OurOffer | ExternalOffer>
            id='Offers'
            title={title}
            FilterBodyComponent={OffersFilterBody}
            tableStructure={[
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIcon },
                { header: 'Nazwa', renderTdBody: renderNameDescription },
                { header: 'Typ', renderTdBody: renderType },
                { header: 'Odbiorcy', renderTdBody: renderEntityData },
                { header: 'Termin', objectAttributeToShow: 'submissionDeadline' },
                { header: 'Wysyłka', objectAttributeToShow: 'form' },
                { header: 'Status', renderTdBody: renderstatus },
            ]}
            AddNewButtonComponents={[OurOfferAddNewModalButton, ExternalOfferAddNewModalButton]}
            EditButtonComponent={OfferEditModalButton}
            isDeletable={true}
            repository={offersRepository}
            selectedObjectRoute={'/offer/'}
        />
    );
}