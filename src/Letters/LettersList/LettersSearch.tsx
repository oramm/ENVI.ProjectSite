import React from 'react';
import FilterableTable from '../../View/Resultsets/FilterableTable/FilterableTable';
import LettersController from './LettersController';
import { LettersFilterBody } from './LetterFilterBody';
import { LetterEditModalButton, IncomingLetterAddNewModalButton, OurLetterAddNewModalButton } from './Modals/LetterModalButtons';
import { IncomingLetter, OurLetter, RepositoryDataItem } from '../../../Typings/bussinesTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEnvelope } from '@fortawesome/free-solid-svg-icons';


export const lettersRepository = LettersController.lettersRepository;
export const entitiesRepository = LettersController.entitiesRepository;
export const projectsRepository = LettersController.projectsRepository;
export const contractsRepository = LettersController.contractsRepository;
export const milestonesRepository = LettersController.milestonesRepository;
export const casesRepository = LettersController.casesRepository;

export default function LettersSearch({ title }: { title: string }) {
    function makeEntitiesLabel(letter: OurLetter | IncomingLetter) {
        const entities = letter._entitiesMain;
        let label = '';
        for (var i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + ', '
        }
        if (entities[i])
            label += entities[i].name;
        return <>{label}</>;
    }

    function renderIconTdBody(letter: OurLetter | IncomingLetter) {
        letter = letter as OurLetter | IncomingLetter;
        const icon = letter.isOur ? faPaperPlane : faEnvelope;

        return <FontAwesomeIcon icon={icon} size="lg" />
    }

    return (
        <FilterableTable<OurLetter | IncomingLetter>
            title={title}
            FilterBodyComponent={LettersFilterBody}
            tableStructure={[
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIconTdBody },
                { header: 'Utworzono', objectAttributeToShow: 'creationDate' },
                { header: 'Wysłano &nbs', objectAttributeToShow: 'registrationDate' },
                { header: 'Numer', objectAttributeToShow: 'number' },
                { header: 'Dotyczy', objectAttributeToShow: 'description' },
                { header: 'Odbiorca', renderTdBody: makeEntitiesLabel },
            ]}
            AddNewButtonComponents={[OurLetterAddNewModalButton, IncomingLetterAddNewModalButton]}
            EditButtonComponent={LetterEditModalButton}
            isDeletable={true}
            repository={lettersRepository}
            selectedObjectRoute={'/letter/'}
        />
    );
}