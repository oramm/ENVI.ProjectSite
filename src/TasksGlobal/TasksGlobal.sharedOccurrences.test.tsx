import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Task } from '../../Typings/bussinesTypes';
import { buildTree } from './TasksGlobal';
import MainSetup from '../React/MainSetupReact';
import { FilterableTableContext } from '../View/Resultsets/FilterableTable/FilterableTableContext';
import { ContractsWithChildren } from './TasksGlobalTypes';
import RepositoryReact from '../React/RepositoryReact';
import { Section } from '../View/Resultsets/FilterableTable/Section';
import FilterableTable from '../View/Resultsets/FilterableTable/FilterableTable';
import { casesRepository, tasksGlobalRepository } from './TasksGlobalController';

describe('shared work occurrences', () => {
    it('shows sharing and consolidation only after expanding the milestone menu and opens both dialogs', async () => {
        const previousUser = sessionStorage.getItem('Current User');
        MainSetup.currentUser = { id: 1, enviId: 1, userName: 'Test', systemRoleName: 'ENVI_EMPLOYEE', systemRoleId: 3,
            googleId: 'synthetic', picture: '', systemEmail: 'test@example.invalid' };
        const request = vi.fn(async (url: string) => new Response(JSON.stringify(url.endsWith('/consolidation') ? { operation: null } : {
            milestoneId: 10, sourceContractId: 1, revision: 'a'.repeat(64), links: [],
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        vi.stubGlobal('fetch', request);
        try {
            const contract = { id: 1, ourId: 'TEST/1' };
            const milestone = { id: 10, _contract: contract, _type: { id: 5, name: 'Przetarg', isUniquePerContract: false }, _dates: [] };
            const tree = buildTree([{ id: 1, contract, milestonesWithCases: [{ milestone, casesWithTasks: [] }] }] as unknown as ContractsWithChildren[]);
            const node = tree[0].children[0];
            const view = render(<MemoryRouter><FilterableTableContext.Consumer>{context =>
                <FilterableTableContext.Provider value={{ ...context, editingSectionId: node.id }}>
                    <Section sectionNode={node} onClick={() => {}}
                        resulsetTableProps={{ showTableHeader: false, onRowClick: () => {} }} />
                </FilterableTableContext.Provider>
            }</FilterableTableContext.Consumer></MemoryRouter>);
            expect(view.queryByRole('button', { name: 'Przypięcia' })).toBeNull();
            expect(view.queryByRole('button', { name: 'Połącz kamienie' })).toBeNull();
            expect(request).not.toHaveBeenCalled();
            const toggle = view.container.querySelector('[data-icon="ellipsis"]')!.closest('span')!;
            fireEvent.click(toggle);
            const sharing = view.getByRole('button', { name: 'Przypięcia' });
            expect(sharing).toBeVisible();
            expect(view.getByRole('button', { name: 'Połącz kamienie' })).toBeVisible();
            expect(request).not.toHaveBeenCalled();
            fireEvent.click(sharing);
            expect(await view.findByText('Przypięcia kamienia')).toBeVisible();
            await waitFor(() => expect(request).toHaveBeenCalledWith(expect.stringContaining('milestones/10/sharing'), expect.objectContaining({ method: 'GET' })));
            fireEvent.click(view.getByRole('button', { name: 'Zamknij' }));
            await waitFor(() => expect(view.queryByText('Przypięcia kamienia')).toBeNull());
            fireEvent.click(view.getByRole('button', { name: 'Połącz kamienie' }));
            expect(await view.findByText('Połącz dwa kamienie')).toBeVisible();
            await waitFor(() => expect(request).toHaveBeenCalledWith(expect.stringContaining('milestones/10/consolidation'), expect.objectContaining({ method: 'GET' })));
            expect(request.mock.calls).toHaveLength(2);
            fireEvent.click(view.getByRole('button', { name: 'Zamknij' }));
            await waitFor(() => expect(view.queryByText('Połącz dwa kamienie')).toBeNull());
            fireEvent.click(toggle);
            expect(view.queryByRole('button', { name: 'Przypięcia' })).toBeNull();
            expect(view.queryByRole('button', { name: 'Połącz kamienie' })).toBeNull();
        } finally {
            vi.unstubAllGlobals();
            if (previousUser === null) sessionStorage.removeItem('Current User');
            else sessionStorage.setItem('Current User', previousUser);
        }
    });
    it('keeps section identities contextual and task cache canonical', () => {
        const task = { id: 30, status: 'W trakcie' } as Task;
        const milestone = { id: 10, _type: { id: 5, isUniquePerContract: false }, _dates: [] };
        const caseItem = { id: 20, _type: { id: 7, isUniquePerMilestone: true } };
        const groupedCase = { id: 21, _type: { id: 8, isUniquePerMilestone: false, _allowsSubCases: true } };
        const subcase = { id: 22, _type: { id: 8, isUniquePerMilestone: false } };
        const entry = { milestone, casesWithTasks: [
            { caseItem, tasks: [task], subCasesWithTasks: [] },
            { caseItem: groupedCase, tasks: [], subCasesWithTasks: [{ caseItem: subcase, tasks: [] }] },
        ] };
        const contracts = [1, 2].map(id => ({ id, contract: { id, ourId: `TEST/${id}` }, milestonesWithCases: [entry] })) as unknown as ContractsWithChildren[];
        const leavesRepository = { items: [] } as unknown as RepositoryReact<Task>;

        const tree = buildTree(contracts, undefined, undefined, { leavesRepository });
        const milestones = tree.map(contract => contract.children[0]);
        const cases = milestones.map(node => node.children[0]);
        const allNodes = tree.flatMap(contract => [contract, ...contract.children.flatMap(milestoneNode =>
            [milestoneNode, ...milestoneNode.children.flatMap(caseNode =>
                [caseNode, ...caseNode.children.flatMap(child => [child, ...child.children])])])]);
        const ids = allNodes.map(node => node.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(milestones.map(node => node.dataItem.id)).toEqual([10, 10]);
        expect(cases.map(node => node.dataItem.id)).toEqual([20, 20]);
        expect(allNodes.filter(node => node.type === 'subcase').map(node => node.dataItem.id)).toEqual([22, 22]);
        expect(leavesRepository.items.map(item => item.id)).toEqual([30]);

        const view = render(<MemoryRouter>{tree.map(node =>
            <Section key={node.id} sectionNode={node} onClick={() => {}}
                resulsetTableProps={{ showTableHeader: false, onRowClick: () => {} }} />
        )}</MemoryRouter>);
        const renderedIds = [...view.container.querySelectorAll('[id]')].map(element => element.id);
        expect(new Set(renderedIds).size).toBe(renderedIds.length);
    });

    it('refreshes a shared subcase in both occurrences and keeps the selected occurrence', async () => {
        const makeTree = (status: string) => {
            const milestone = { id: 10, status: 'W trakcie', _type: { id: 5, isUniquePerContract: false }, _dates: [] };
            const parentCase = { id: 20, status: 'W trakcie', _type: { id: 8, isUniquePerMilestone: false, _allowsSubCases: true } };
            const subcase = { id: 22, status, _type: { id: 8, isUniquePerMilestone: false } };
            const entry = { milestone, casesWithTasks: [
                { caseItem: parentCase, tasks: [], subCasesWithTasks: [{ caseItem: subcase, tasks: [] }] },
            ] };
            const contracts = [1, 2].map(id => ({ id, contract: { id, ourId: `TEST/${id}` }, milestonesWithCases: [entry] })) as unknown as ContractsWithChildren[];
            return buildTree(contracts);
        };
        const edit = vi.spyOn(casesRepository, 'editItem').mockResolvedValue({ id: 22, status: 'Na zaś' } as never);
        const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        const criteria = { caseStatuses: ['Na zaś', 'W trakcie'], taskStatuses: ['W trakcie'] };
        const snapshotKey = 'filtersableTableSnapshot_shared-subcase-refresh';
        sessionStorage.setItem(snapshotKey, JSON.stringify({ criteria }));
        const refresh = vi.fn(async () => makeTree('Na zaś'));
        try {
            const view = render(<MemoryRouter><FilterableTable<Task>
                id="shared-subcase-refresh"
                repository={tasksGlobalRepository}
                initialSections={makeTree('W trakcie')}
                tableStructure={[]}
                sectionsFilterHandlers={{
                    onSubmitSections: async () => makeTree('W trakcie'),
                    onResetSections: () => makeTree('W trakcie'),
                    onRefreshSections: refresh,
                }}
            /></MemoryRouter>);
            const a = view.container.querySelector('#subcase22_contract1')!;
            const b = view.container.querySelector('#subcase22_contract2')!;
            fireEvent.click(b.querySelector('.section-header')!);
            fireEvent.click(b.querySelector('.scrum-status-toggle')!);
            fireEvent.click([...document.querySelectorAll('.dropdown-item')].find(x => x.textContent?.trim() === 'Na zaś')!);
            await waitFor(() => {
                expect(a.querySelector('.scrum-status-toggle')?.textContent?.trim()).toBe('Na zaś');
                expect(b.querySelector('.scrum-status-toggle')?.textContent?.trim()).toBe('Na zaś');
                expect(b.querySelector('.section-header')?.classList.contains('state-active')).toBe(true);
                expect(a.querySelector('.section-header')?.classList.contains('state-active')).toBe(false);
            });
            expect(edit).toHaveBeenCalledTimes(1);
            expect(refresh).toHaveBeenCalledWith(criteria);
        } finally {
            sessionStorage.removeItem(snapshotKey);
            edit.mockRestore();
            scroll.mockRestore();
        }
    });
});
