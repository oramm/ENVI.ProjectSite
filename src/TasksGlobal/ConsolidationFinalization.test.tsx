import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {cleanup,render,screen,fireEvent,waitFor} from '@testing-library/react';
import MainSetup from '../React/MainSetupReact';
import Action from './MilestoneConsolidationAction';
import {MilestoneSharingContractsContext} from './MilestoneSharingAction';
import {useConsolidationWorkGuard} from './useConsolidationWorkGuard';
import {publicFixtures as fixture} from './ConsolidationFinalization.fixture';
import type {MilestoneData} from '../../Typings/bussinesTypes';
import type {ContractsWithChildren} from './TasksGlobalTypes';
vi.mock('../React/Tools/ToolsFetch',()=>({default:{notifySessionExpired:vi.fn()}}));
vi.mock('../View/Resultsets/FilterableTable/FilterableTableContext',()=>({useFilterableTableContext:()=>({refreshSectionsAfterMutation:async()=>true})}));
vi.mock('./MilestoneSharingAction',async()=>({MilestoneSharingContractsContext:(await import('react')).createContext([])}));
const source={id:1,name:'Źródło syntetyczne',_type:{id:5},_contract:{id:10,ourId:'SOURCE',alias:'Źródłowy'}} as MilestoneData;
const target={...source,id:2,name:'Cel syntetyczny',_contract:{id:20,ourId:'TARGET',alias:'Docelowy'}};
const contracts=[source,target].map(m=>({id:m._contract!.id,contract:m._contract,milestonesWithCases:[{milestone:m,casesWithTasks:[{caseItem:{id:m.id===1?11:21,name:'Sprawa',_type:{id:9,name:'Typ'}},subCasesWithTasks:[],tasks:[]}]}]})) as unknown as ContractsWithChildren[];
function view(personId=7){MainSetup.currentUser={enviId:personId,systemRoleId:1,systemRoleName:'ADMIN',userName:'Synthetic manager',systemEmail:'synthetic@example.invalid'} as typeof MainSetup.currentUser;
    return render(<MilestoneSharingContractsContext.Provider value={contracts}><Action dataObject={source} layout='horizontal'/></MilestoneSharingContractsContext.Provider>);}
afterEach(()=>{cleanup();sessionStorage.clear();vi.unstubAllGlobals();});
it('server-generated completed status remains visible through stale source row and never enables finalization again',async()=>{
    const fetch=vi.fn(async()=>new Response(JSON.stringify({operation:fixture.completedStatus})));vi.stubGlobal('fetch',fetch);view();fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));
    await screen.findByText(/PS: Połączenie zakończone/);expect(screen.getByText('Połączenie zakończone. Dane są dostępne w kamieniu docelowym.')).toBeTruthy();expect(screen.queryByRole('button',{name:'Zakończ połączenie'})).toBeNull();expect(fetch).toHaveBeenCalledTimes(1);
});
it('server-generated unconfirmed trash explains manual owner recovery and binds exact source folder',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({operation:fixture.unconfirmedStatus}))));view();fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));
    await screen.findByText(/Brak trwałego potwierdzenia własnego/);expect(screen.getByRole('link',{name:'Sprawdź dokładny folder źródłowy'}).getAttribute('href')).toBe('https://drive.google.com/drive/folders/sourceFolder');expect(screen.getByText(/ręcznie przywrócić dokładny folder/)).toBeTruthy();
});
it('new manager restore-only flow sends their own stored check, stable person slot and explicit destination confirmation',async()=>{
    const calls:{url:string;body:any}[]=[];vi.stubGlobal('crypto',{randomUUID:()=>fixture.restoredAck.requestId});
    vi.stubGlobal('fetch',vi.fn(async(url:string,options?:RequestInit)=>{calls.push({url,body:options?.body?JSON.parse(String(options.body)):null});if(url.endsWith('/consolidation'))return new Response(JSON.stringify({operation:fixture.ownedTrashStatus}));if(url.endsWith('/check'))return new Response(JSON.stringify(fixture.restoreOnlyCheck));if(url.endsWith('/retry'))return new Response(JSON.stringify(fixture.restoredAck));return new Response(JSON.stringify(fixture.restoredStatus));}));
    view(8);fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));await screen.findByText(/PS: Wymaga ponownego sprawdzenia/);fireEvent.click(screen.getByRole('button',{name:'Kontynuuj łączenie'}));await screen.findByText('Jeszcze nie można zakończyć połączenia.');
    fireEvent.click(screen.getByLabelText(/Potwierdzam przeniesienie dokumentów do celu/));fireEvent.click(screen.getByRole('button',{name:'Przywróć własne źródło i sprawdź ponownie'}));await waitFor(()=>expect(calls.some(c=>c.url.endsWith('/retry'))).toBe(true));
    expect(calls.find(c=>c.url.endsWith('/retry'))!.body).toEqual({requestId:fixture.restoredAck.requestId,expectedRevision:fixture.restoreOnlyCheck.revision,checkId:fixture.restoreOnlyCheck.checkId,confirmDocumentsMoved:true,destinationMilestoneId:2});
    await screen.findByText(/Zapisano wynik próby zakończenia połączenia/);expect(sessionStorage.getItem('milestone-consolidation:person:8:1')).toBeNull();expect(calls.some(c=>c.url.endsWith('/finalize'))).toBe(false);
});
it('ordinary stale GeneralModal hook consumes actual authorized history guidance and keeps creation disabled',async()=>{
    function View(){const state=useConsolidationWorkGuard('task',{_case:{id:11}},true);return <><button disabled={state.blocked}>Dodaj nową pracę</button><span>{state.message}</span></>;}
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({blocked:true,redirects:[fixture.completedHistory]}))));render(<View/>);
    await screen.findByText(/kamieniu \(nazwa niedostępna; ID 2\), w sprawie „Destination” \(ID 21\)/);expect((screen.getByRole('button',{name:'Dodaj nową pracę'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.getByText(/zachowanego wyboru nie zmieniono/)).toBeTruthy();expect(screen.getByText(/Odśwież dane/)).toBeTruthy();
});
it('ambiguous old SSO slot is retained and never automatically replayed under a different person',async()=>{
    const bytes='unknown old pending bytes';sessionStorage.setItem('milestone-consolidation:undefined:1',bytes);const fetch=vi.fn();vi.stubGlobal('fetch',fetch);view(8);fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));await screen.findByText(/Zachowano wcześniejsze żądanie bez pewnej tożsamości/);expect(fetch).not.toHaveBeenCalled();expect(sessionStorage.getItem('milestone-consolidation:undefined:1')).toBe(bytes);
});
it('authorized current destination names lead old-ID guidance while canonical IDs remain secondary',async()=>{
    function View(){const state=useConsolidationWorkGuard('task',{_case:{id:11}},true);return <><button disabled={state.blocked}>Dodaj nową pracę</button><span>{state.message}</span></>;}
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({blocked:true,redirects:[fixture.namedHistory]}))));render(<View/>);
    await screen.findByText(/kamieniu „Raport końcowy” \(ID 2\), w sprawie „Przegląd dokumentacji” \(ID 21\)/);expect((screen.getByRole('button',{name:'Dodaj nową pracę'}) as HTMLButtonElement).disabled).toBe(true);
    expect(document.body.textContent).not.toMatch(/receipt|root|cleanup/);
});
it('missing authorized destination names are explicitly unavailable with refresh guidance and no write retarget',async()=>{
    function View(){const state=useConsolidationWorkGuard('task',{_case:{id:11}},true);return <><button disabled={state.blocked}>Dodaj nową pracę</button><span>{state.message}</span></>;}
    const fetch=vi.fn(async(_url:string,_options?:RequestInit)=>new Response(JSON.stringify({blocked:true,redirects:[fixture.unavailableHistory]})));vi.stubGlobal('fetch',fetch);render(<View/>);
    await screen.findByText(/kamieniu \(nazwa niedostępna; ID 2\), w sprawie \(nazwa niedostępna; ID 21\)/);expect(screen.getByText(/Odśwież dane/)).toBeTruthy();expect((screen.getByRole('button',{name:'Dodaj nową pracę'}) as HTMLButtonElement).disabled).toBe(true);
    expect(JSON.parse(String(fetch.mock.calls[0][1]!.body))).toEqual({caseIds:[11],milestoneIds:[]});
});
