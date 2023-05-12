import React from 'react';
import FilterableTable from '../../View/Resultsets/FilterableTable';
import LettersController from './LettersController';
import { LettersFilterBody } from './LetterFilterBody';
import { LetterEditModalButton, IncomingLetterAddNewModalButton, OurLetterAddNewModalButton } from './Modals/LetterModalButtons';
import { IncomingLetter, OurLetter, RepositoryDataItem } from '../../../Typings/bussinesTypes';

export const lettersRepository = LettersController.lettersRepository;
export const entitiesRepository = LettersController.entitiesRepository;
export const projectsRepository = LettersController.projectsRepository;
export const contractsRepository = LettersController.contractsRepository;
export const milestonesRepository = LettersController.milestonesRepository;
export const casesRepository = LettersController.casesRepository;

export default function LettersSearch({ title }: { title: string }) {
    function makeEntitiesLabel(letter: RepositoryDataItem) {
        letter = letter as OurLetter | IncomingLetter;
        const entities = letter._entitiesMain;
        let label = '';
        for (var i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + ', '
        }
        if (entities[i])
            label += entities[i].name;
        return <>{label}</>;
    }

    function renderIconTdBody(letter: RepositoryDataItem) {
        letter = letter as OurLetter | IncomingLetter;
        const icon = letter.isOur ? 'fa fa-paper-plane fa-lg' : 'fa fa-envelope fa-lg';
        return <i className={icon}></i>
    }

    return (
        <FilterableTable
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