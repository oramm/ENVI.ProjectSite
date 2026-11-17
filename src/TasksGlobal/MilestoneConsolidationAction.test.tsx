import React from "react";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import MainSetup from "../React/MainSetupReact";
import {publicFixtures as finalFixture} from "./ConsolidationFinalization.fixture";
import MilestoneConsolidationAction from "./MilestoneConsolidationAction";
import { MilestoneSharingContractsContext } from "./MilestoneSharingAction";
import { MilestoneData } from "../../Typings/bussinesTypes";
import { ContractsWithChildren } from "./TasksGlobalTypes";

vi.mock("../React/Tools/ToolsFetch", () => ({ default: { notifySessionExpired: vi.fn() } }));
const { refreshSectionsAfterMutation } = vi.hoisted(() => ({ refreshSectionsAfterMutation: vi.fn(async () => true) }));
vi.mock("../View/Resultsets/FilterableTable/FilterableTableContext", () => ({ useFilterableTableContext: () => ({ refreshSectionsAfterMutation }) }));
vi.mock("./MilestoneSharingAction", async () => ({ MilestoneSharingContractsContext: (await import("react")).createContext([]) }));
const source = { id: 1, name: "Źródło TEST", _type: { id: 5 }, _contract: { id: 10, ourId: "TEST-SOURCE", alias: "Źródłowy kontrakt" } } as MilestoneData;
const destination = { ...source, id: 2, name: "Cel TEST", _contract: { id: 20, ourId: "TEST-DEST", alias: "Docelowy kontrakt" } };
const caseItem = { id: 101, name: "Sprawa TEST", _type: { id: 9, name: "Typ TEST" } };
const contracts = [{ id: 10, contract: source._contract, milestonesWithCases: [{ milestone: source, casesWithTasks: [{ caseItem, subCasesWithTasks: [], tasks: [] }] }] },
    { id: 20, contract: destination._contract, milestonesWithCases: [{ milestone: destination, casesWithTasks: [201, 202].map(id => ({ caseItem: { ...caseItem, id }, subCasesWithTasks: [], tasks: [] })) }] }] as unknown as ContractsWithChildren[];
const preview = { previewId: "22222222-2222-4222-8222-222222222222", revision: "a".repeat(64), sourceContractId: 10, accountingContractId: 20,
    sourceMilestoneId: 1, destinationMilestoneId: 2, mappings: [{ sourceCaseId: 101, target: null, candidateCaseIds: [201, 202], state: "BLOCKED", conflictCodes: ["AMBIGUOUS_MAPPING"] }],
    units: [{ unitId: "33333333-3333-4333-8333-333333333333", sourceCaseIds: [101], state: "BLOCKED", counts: { tasks: 2, relations: 1, notes: 1 } }], movedUnits: [], conflicts: [{ code: "AMBIGUOUS_MAPPING", reference: "101", sourceCaseId:101 }], numbers: [],
    cases:{source:[{id:101,milestoneId:1,typeId:9,typeName:"Typ TEST",name:"Sprawa TEST",isUniquePerMilestone:false,parentCaseId:null,folderId:"source-case",taskCount:2,relationCount:1}],destination:[201,202].map(id=>({id,milestoneId:2,typeId:9,typeName:"Typ TEST",name:"Cel "+id,isUniquePerMilestone:false,parentCaseId:null,folderId:"dest-"+id,taskCount:0,relationCount:0}))}, milestoneFolderPair: { sourceFolderId: "source-test", destinationFolderId: "dest-test" }, folderPairs: [{sourceCaseId:101,destinationCaseId:null,sourceFolderId:"source-case",destinationFolderId:null}] };
function view(variantContracts:ContractsWithChildren[]=contracts,variantSource:MilestoneData=source,withToast=false) {
    MainSetup.currentUser = { enviId:7,userName:"Synthetic manager",systemRoleName:"ADMIN",systemRoleId: 1, googleId: "synthetic-manager" } as typeof MainSetup.currentUser;
    return render(<>{withToast && <ToastContainer autoClose={false} />}<MilestoneSharingContractsContext.Provider value={variantContracts}><MilestoneConsolidationAction dataObject={variantSource} layout="horizontal" /></MilestoneSharingContractsContext.Provider></>);
}
afterEach(() => { cleanup(); sessionStorage.clear(); vi.unstubAllGlobals(); });
describe("consolidation guidance", () => {
    it('id-only contracts explicitly require refresh instead of inventing a name',async()=>{
        const unlabeled=contracts.map(c=>({...c,contract:{id:c.contract.id},milestonesWithCases:c.milestonesWithCases.map(m=>({...m,milestone:{...m.milestone,_contract:{id:m.milestone._contract!.id}}}))})) as ContractsWithChildren[];
        const request=vi.fn(async(url:string)=>new Response(JSON.stringify(url.endsWith('/consolidation')?{operation:null}:preview)));vi.stubGlobal('fetch',request);
        view(unlabeled,{...source,_contract:{id:10}} as MilestoneData);fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));await waitFor(()=>expect(request).toHaveBeenCalledTimes(1));
        fireEvent.change(screen.getByLabelText('Z którym kamieniem połączyć?'),{target:{value:'2'}});await waitFor(()=>expect(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'})).toBeEnabled());fireEvent.click(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'}));await screen.findByText('Przed i po połączeniu');
        expect(screen.getByText(/Kontrakt źródłowy: Oznaczenie kontraktu niedostępne — odśwież drzewo; rozliczeniowy po transferze: Oznaczenie kontraktu niedostępne — odśwież drzewo/)).toBeTruthy();
        expect(screen.queryByText(/undefined/)).toBeNull();
    });
    it('shows existing contract labels and invalidates selected apply after mapping changes',async()=>{
        const reply={...preview,conflicts:[],mappings:[{...preview.mappings[0],state:'SELECTED',target:{mode:'existing',caseId:201}}],units:[{...preview.units[0],state:'ANALYZED'}],folderPairs:[{sourceCaseId:101,destinationCaseId:201,sourceFolderId:'source-case',destinationFolderId:'dest-201'}]};
        const request=vi.fn(async(url:string)=>new Response(JSON.stringify(url.endsWith('/consolidation')?{operation:null}:reply)));vi.stubGlobal('fetch',request);view();fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));await waitFor(()=>expect(request).toHaveBeenCalledTimes(1));
        expect(screen.getByText(/TEST-SOURCE.*Źródłowy kontrakt/)).toBeTruthy();expect(screen.getByRole('option',{name:/TEST-DEST.*Docelowy kontrakt.*Cel TEST/})).toBeTruthy();
        fireEvent.change(screen.getByLabelText('Z którym kamieniem połączyć?'),{target:{value:'2'}});await waitFor(()=>expect(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'})).toBeEnabled());fireEvent.change(screen.getByLabelText('Cel sprawy 101'),{target:{value:'201'}});fireEvent.click(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'}));await screen.findByText('Przed i po połączeniu');
        expect(screen.getByText(/Kontrakt źródłowy: TEST-SOURCE.*rozliczeniowy po transferze: TEST-DEST/)).toBeTruthy();
        expect(screen.getByLabelText(/Grupa Sprawa TEST: Gotowa grupa/)).toBeChecked();fireEvent.click(screen.getByLabelText(/Potwierdzam połączenie wybranych/));expect((screen.getByRole('button',{name:'Połącz sprawy i zadania'}) as HTMLButtonElement).disabled).toBe(false);
        fireEvent.change(screen.getByLabelText('Cel sprawy 101'),{target:{value:'202'}});expect(screen.queryByText('Przed i po połączeniu')).toBeNull();expect(screen.queryByRole('button',{name:'Połącz sprawy i zadania'})).toBeNull();expect(request.mock.calls.some(([url])=>url.endsWith('/apply'))).toBe(false);
    });
    it.each(['proposed','blocked-create'])('never treats %s as explicit transfer/preparation consent',async kind=>{
        const reply={...preview,mappings:[{...preview.mappings[0],state:kind==='proposed'?'PROPOSED':'BLOCKED',target:kind==='proposed'?{mode:'existing',caseId:201}:null}],
            units:[{...preview.units[0],state:'ANALYZED'}],folderPairs:[{sourceCaseId:101,destinationCaseId:kind==='proposed'?201:null,sourceFolderId:'source-case',destinationFolderId:kind==='proposed'?'dest-201':null}]};
        const request=vi.fn(async(url:string)=>new Response(JSON.stringify(url.endsWith('/consolidation')?{operation:null}:reply)));vi.stubGlobal('fetch',request);view();fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));await waitFor(()=>expect(request).toHaveBeenCalledTimes(1));
        fireEvent.change(screen.getByLabelText('Z którym kamieniem połączyć?'),{target:{value:'2'}});await waitFor(()=>expect(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'})).toBeEnabled());if(kind==='blocked-create')fireEvent.change(screen.getByLabelText('Cel sprawy 101'),{target:{value:'create'}});
        fireEvent.click(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'}));await screen.findByText('Przed i po połączeniu');
        if(kind==='proposed'){expect(screen.getByLabelText(/Grupa Sprawa TEST:/)).toBeDisabled();expect(screen.getByRole('button',{name:'Połącz sprawy i zadania'})).toBeDisabled();}else{expect(screen.queryByRole('button',{name:'Połącz sprawy i zadania'})).toBeNull();}
        if(kind==='blocked-create')expect((screen.getByRole('button',{name:'Utwórz sprawy i foldery'}) as HTMLButtonElement).disabled).toBe(true);
        expect(request.mock.calls.some(([url])=>url.endsWith('/apply')||url.endsWith('/prepare-targets'))).toBe(false);
    });
    it("complete server cards expose uncached cases and permit an unrelated complete group while another remains blocked",async()=>{
        const calls:{url:string;options?:RequestInit}[]=[];
        const card=(id:number,milestoneId:number)=>({id,milestoneId,typeId:9,typeName:'Typ TEST',name:'Sprawa '+id,parentCaseId:null,isUniquePerMilestone:false,folderId:'folder-'+id,taskCount:2,relationCount:1});
        vi.stubGlobal('fetch',vi.fn(async(url:string,options?:RequestInit)=>{calls.push({url,options});if(url.endsWith('/consolidation'))return new Response(JSON.stringify({operation:null}));if(url.endsWith('/apply'))throw new TypeError('lost');
            return new Response(JSON.stringify({...preview,cases:{source:[card(101,1),card(102,1)],destination:[card(201,2)]},folderPairs:[{sourceCaseId:101,destinationCaseId:201,sourceFolderId:"folder-101",destinationFolderId:"folder-201"},{sourceCaseId:102,destinationCaseId:null,sourceFolderId:"folder-102",destinationFolderId:null}],mappings:[{sourceCaseId:101,candidateCaseIds:[201],target:{mode:'existing',caseId:201},state:'SELECTED',conflictCodes:[]},{sourceCaseId:102,candidateCaseIds:[],target:null,state:'BLOCKED',conflictCodes:['MISSING_DESTINATION']}],
                units:[{...preview.units[0],state:'ANALYZED'},{unitId:'66666666-6666-4666-8666-666666666666',sourceCaseIds:[102],state:'BLOCKED',counts:{tasks:2,relations:1,notes:1}}]}));}));
        vi.stubGlobal('crypto',{randomUUID:()=> '55555555-5555-4555-8555-555555555555'});view();fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));await waitFor(()=>expect(calls.length).toBe(1));
        fireEvent.change(screen.getByLabelText('Z którym kamieniem połączyć?'),{target:{value:'2'}});await waitFor(()=>expect(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'})).toBeEnabled());fireEvent.change(screen.getByLabelText('Cel sprawy 101'),{target:{value:'201'}});fireEvent.click(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'}));
        await screen.findByLabelText('Cel sprawy 102');expect(screen.getByText('Przed i po połączeniu')).toBeTruthy();expect(screen.getAllByText(/Do przeniesienia: 2 zadań, 1 powiązań/)).toHaveLength(2);
        fireEvent.click(screen.getByLabelText(/Grupa Sprawa 101: Gotowa grupa/));fireEvent.click(screen.getByLabelText(/Potwierdzam połączenie wybranych/));fireEvent.click(screen.getByRole('button',{name:'Połącz sprawy i zadania'}));
        await waitFor(()=>expect(calls.filter(c=>c.url.endsWith('/apply')).length).toBe(1));expect(JSON.parse(String(calls.find(c=>c.url.endsWith('/apply'))?.options?.body)).unitIds).toEqual(['33333333-3333-4333-8333-333333333333']);
    });
    it("does not apply ambiguous proposals or claim documents ready", async () => {
        const request = vi.fn(async (url: string) => new Response(JSON.stringify(url.endsWith("/consolidation") ? { operation: null } : preview)));
        vi.stubGlobal("fetch", request); view();
        fireEvent.click(screen.getByRole("button", { name: "Połącz kamienie" }));
        await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
        fireEvent.change(screen.getByLabelText("Z którym kamieniem połączyć?"), { target: { value: "2" } });await waitFor(()=>expect(screen.getByRole("button",{name:"Dalej: zobacz, co się połączy"})).toBeEnabled());
        fireEvent.click(screen.getByRole("button", { name: "Dalej: zobacz, co się połączy" }));
        await screen.findByText(/Wymaga Twojego wyboru/);
        expect((screen.getByRole("button", { name: "Połącz sprawy i zadania" }) as HTMLButtonElement).disabled).toBe(true);
        expect(request.mock.calls.some(([url]) => url.endsWith("/apply"))).toBe(false);
        expect(screen.queryByRole("button", { name: /Zakończ|Usuń źródło/ })).toBeNull();
    });
    it("shows completed PS transfer after remount while Drive checking is unavailable", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ operation: { operationId: "11111111-1111-4111-8111-111111111111", revision:"a".repeat(64), allowedActions:["PREVIEW"],requiresRevalidation:true,units:[{unitId:"33333333-3333-4333-8333-333333333333",unitKey:"cases:101",moved:true,state:"MOVED"}], sourceMilestoneId: 1, destinationMilestoneId: 2,
            state: "TRANSFERRING", counts: { moved: 1, pending: 0 }, accountingContractId: 20, caseMappings: [{ sourceCaseId: 101, destinationCaseId: 201 }],
            cleanup: { sourceFolderStatus: "UNKNOWN", step: "NOT_STARTED", remainingCount:null,verificationComplete:false }, documentsReady: false } }))));
        view(); fireEvent.click(screen.getByRole("button", { name: "Połącz kamienie" }));
        await screen.findByText(/Sprawy i zadania są już w kamieniu docelowym/); expect(screen.getByRole('button',{name:'Kontynuuj łączenie'})).toBeDisabled();
        expect((screen.getByLabelText("Z którym kamieniem połączyć?") as HTMLSelectElement).disabled).toBe(true);
        expect((screen.getByLabelText("Cel sprawy 101") as HTMLSelectElement).disabled).toBe(true);
        expect(screen.queryByText("Połączenie zakończone")).toBeNull();
    });
    it("requires explicit mapping, group selection and consent before apply", async () => {
        const calls: { url: string; options?: RequestInit }[] = [];
        vi.stubGlobal("fetch", vi.fn(async (url: string, options?: RequestInit) => {
            calls.push({ url, options });
            if (url.endsWith("/consolidation")) return new Response(JSON.stringify({ operation: null }));
            if (url.endsWith("/apply")) throw new TypeError("lost response");
            return new Response(JSON.stringify({ ...preview, folderPairs:[{sourceCaseId:101,destinationCaseId:201,sourceFolderId:"source-case",destinationFolderId:"dest-201"}],mappings: [{ sourceCaseId: 101, target: { mode: "existing", caseId: 201 }, candidateCaseIds:[201], state: "SELECTED", conflictCodes: [] }],
                units: [{ ...preview.units[0], state: "ANALYZED" }], conflicts: [] }));
        }));
        vi.stubGlobal("crypto", { randomUUID: () => "55555555-5555-4555-8555-555555555555" });
        view(); fireEvent.click(screen.getByRole("button", { name: "Połącz kamienie" }));
        await waitFor(() => expect(calls).toHaveLength(1));
        fireEvent.change(screen.getByLabelText("Z którym kamieniem połączyć?"), { target: { value: "2" } });await waitFor(()=>expect(screen.getByRole("button",{name:"Dalej: zobacz, co się połączy"})).toBeEnabled());
        fireEvent.change(screen.getByLabelText("Cel sprawy 101"), { target: { value: "201" } });
        fireEvent.click(screen.getByRole("button", { name: "Dalej: zobacz, co się połączy" }));
        const group = await screen.findByLabelText(/Grupa Sprawa TEST: Gotowa grupa/);
        expect(group).toBeChecked(); expect((screen.getByRole("button", { name: "Połącz sprawy i zadania" }) as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(screen.getByLabelText(/Potwierdzam połączenie wybranych/));
        fireEvent.click(screen.getByRole("button", { name: "Połącz sprawy i zadania" }));
        await screen.findByText(/Nie można połączyć się z serwerem/); fireEvent.click(screen.getByRole("button", { name: "Ponów zapisane żądanie" }));
        await waitFor(() => expect(calls.filter(c => c.url.endsWith("/apply"))).toHaveLength(2));
        const sent = calls.filter(c => c.url.endsWith("/apply")); expect(sent[0].options?.body).toBe(sent[1].options?.body);
        expect(JSON.parse(String(sent[0].options?.body)).unitIds).toEqual(["33333333-3333-4333-8333-333333333333"]);
    });
});

it('distinguishes choices from technical blockers and guides the user back without any mutation',async()=>{
    const reply={...preview,conflicts:[...preview.conflicts,{code:'UNHANDLED_REFERENCE',sourceCaseId:null,reference:'UnexpectedTable.CaseId'}]};
    const request=vi.fn(async(url:string)=>new Response(JSON.stringify(url.endsWith('/consolidation')?{operation:null}:reply)));vi.stubGlobal('fetch',request);view();
    fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));await waitFor(()=>expect(request).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('heading',{name:'Krok 1 z 3: wybierz drugi kamień'})).toBeVisible();
    expect(screen.getByRole('button',{name:'3. Dokończ łączenie'})).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Z którym kamieniem połączyć?'),{target:{value:'2'}});await waitFor(()=>expect(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'})).toBeEnabled());
    fireEvent.click(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'}));await waitFor(()=>expect(screen.getByText('Wymaga naprawy aplikacji')).toBeVisible());
    expect(screen.getByText('Wymaga Twojego wyboru')).toBeVisible();
    expect(within(screen.getByRole('region',{name:'Sprawdzenie i transfer'})).getByText(/W kamieniu docelowym pasuje kilka spraw/)).toBeVisible();
    expect(screen.queryByText(/Nie potwierdzono działania/)).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'Wróć do wyboru spraw'}));expect(screen.getByLabelText('Cel sprawy 101')).toBeVisible();
    expect(request.mock.calls.some(([url])=>url.endsWith('/apply')||url.endsWith('/prepare-targets')||url.endsWith('/finalize'))).toBe(false);
});

it('walks all three steps and keeps the named success message after removing the source row',async()=>{
    function pauseResponse() {
        let release!: () => void;
        const wait = new Promise<void>(resolve => { release = resolve; });
        return { wait, release };
    }
    const opening = pauseResponse(), planning = pauseResponse(), preparation = pauseResponse();
    const transferResponse = pauseResponse(), checking = pauseResponse(), shortcut = pauseResponse();
    const finalization = pauseResponse(), finalStatus = pauseResponse();
    function expectActivity(text: string) {
        const activity = within(screen.getByRole('dialog')).getByRole('status');
        expect(activity).toHaveTextContent(text);
        expect(activity.querySelector('.spinner-border')).toBeVisible();
        expect(screen.getByRole('button', {name:'Zamknij'})).toBeDisabled();
    }
    let applied=false,completed=false,checks=0;const calls:{url:string;body:any}[]=[];
    const mapping={sourceCaseId:101,target:{mode:'existing',caseId:201}};
    const ready={...preview,conflicts:[],mappings:[{...preview.mappings[0],...mapping,state:'SELECTED',conflictCodes:[]}],units:[{...preview.units[0],state:'ANALYZED'}],folderPairs:[{sourceCaseId:101,destinationCaseId:201,sourceFolderId:'source-case',destinationFolderId:'dest-201'}]};
    const units=[{unitId:preview.units[0].unitId,unitKey:'cases:101',moved:true,state:'MOVED'}];
    const transfer={...finalFixture.transferStatus,caseMappings:[{sourceCaseId:101,destinationCaseId:201}],units};
    const done={...finalFixture.completedStatus,caseMappings:transfer.caseMappings,units};
    vi.stubGlobal('fetch',vi.fn(async(url:string,options?:RequestInit)=>{
        const body=options?.body?JSON.parse(String(options.body)):null;calls.push({url,body});
        if(url.endsWith('/consolidation')){await opening.wait;return new Response(JSON.stringify({operation:completed?done:null}));}
        if(url.endsWith('/prepare-targets')){await preparation.wait;return new Response(JSON.stringify({preparationId:'77777777-7777-4777-8777-777777777777',previewId:ready.previewId,revision:ready.revision,state:'PREPARED',transferPerformed:false,mappings:[mapping]}));}
        if(url.endsWith('/apply')){await transferResponse.wait;applied=true;return new Response(JSON.stringify(transfer));}
        if(url.endsWith('/shortcuts/10/prepare')){await shortcut.wait;return new Response(JSON.stringify({operationId:transfer.operationId,contractId:10}));}
        if(url.endsWith('/check')){checks++;if(checks===1)await checking.wait;return new Response(JSON.stringify(checks===2?{...finalFixture.readyCheck,ready:false,blockers:[{code:'SHORTCUT_NOT_READY',reference:'contract:10'}]}:checks===1?{...finalFixture.readyCheck,ready:false,blockers:[{code:'SOURCE_POPULATED',reference:'document'},{code:'SHORTCUT_NOT_READY',reference:'contract:10'}],sourceTree:{complete:true,remaining:[{id:'document',name:'Dokument TEST.pdf'}]}}:finalFixture.readyCheck));}
        if(url.endsWith('/finalize')){await finalization.wait;completed=true;return new Response(JSON.stringify({...finalFixture.completedAck,requestId:body.requestId}));}
        if(url.endsWith('/preview')){
            if(body.mappings[0]?.target.mode==='create'){await planning.wait;return new Response(JSON.stringify({...preview,mappings:[{...preview.mappings[0],target:body.mappings[0].target,state:'SELECTED',conflictCodes:['FOLDER_NOT_READY']}],conflicts:[{code:'FOLDER_NOT_READY',sourceCaseId:101,reference:''}]}));}
            return new Response(JSON.stringify(applied?{...ready,operationId:transfer.operationId,units:[],movedUnits:[{unitId:units[0].unitId,unitKey:units[0].unitKey,moved:true,state:'MOVED'}]}:ready));
        }
        if(completed)await finalStatus.wait;
        return new Response(JSON.stringify(completed?done:transfer));
    }));
    const page = view(contracts, source, true);
    fireEvent.click(screen.getByRole('button',{name:'Połącz kamienie'}));
    expectActivity('Sprawdzam stan połączenia…');
    opening.release();
    await waitFor(()=>expect(screen.getByLabelText('Z którym kamieniem połączyć?')).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Z którym kamieniem połączyć?'),{target:{value:'2'}});await waitFor(()=>expect(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'})).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Cel sprawy 101'),{target:{value:'create'}});
    fireEvent.change(screen.getByLabelText('Nazwa nowej sprawy 101'),{target:{value:'Nowa sprawa TEST'}});
    fireEvent.click(screen.getByRole('button',{name:'Dalej: zobacz, co się połączy'}));
    expectActivity('Przygotowuję plan połączenia…');
    planning.release();
    await waitFor(()=>expect(screen.getByRole('heading',{name:'Krok 2 z 3: połącz sprawy i zadania'})).toBeVisible());
    expect(screen.queryByText('Wymaga Twojego wyboru')).toBeNull();expect(screen.getByText('Najpierw utwórz nowe sprawy i ich foldery')).toBeVisible();expect(screen.getByRole('button',{name:'Utwórz sprawy i foldery'})).toBeDisabled();fireEvent.click(screen.getByLabelText(/Potwierdzam utworzenie wskazanych/));fireEvent.click(screen.getByRole('button',{name:'Utwórz sprawy i foldery'}));
    expectActivity('Tworzę sprawy i foldery…');
    preparation.release();
    await screen.findByText(/Nowe sprawy są gotowe/);expect(applied).toBe(false);expect(screen.getByRole('button',{name:'Połącz sprawy i zadania'})).toBeDisabled();
    expect(screen.getByLabelText(/Grupa Sprawa TEST: Gotowa grupa/)).toBeChecked();fireEvent.click(screen.getByLabelText(/Potwierdzam połączenie wybranych/));
    fireEvent.click(screen.getByRole('button',{name:'Połącz sprawy i zadania'}));
    expectActivity('Łączę sprawy i zadania…');
    transferResponse.release();
    await waitFor(()=>expect(screen.getByRole('heading',{name:'Krok 3 z 3: dokończ łączenie'})).toBeVisible());
    expect(screen.getByRole('button',{name:'Zakończ połączenie'})).toBeDisabled();
    await waitFor(() => expectActivity('Sprawdzam dokumenty i możliwość zakończenia…'));
    checking.release();
    expect(await screen.findByRole('link',{name:'Dokument TEST.pdf'})).toHaveAttribute('href','https://drive.google.com/open?id=document');
    expect(calls.some(call=>call.url.includes('/shortcuts/'))).toBe(false);
    expect(screen.queryByText(/contract:10|Na źródle pozostał dokument lub skrót/)).toBeNull();
    expect(screen.queryByLabelText(/Potwierdzam przeniesienie dokumentów/)).toBeNull();expect(completed).toBe(false);
    fireEvent.click(await screen.findByRole('button',{name:'Dokumenty są na miejscu — kontynuuj'}));
    await waitFor(() => expectActivity('Przygotowuję skrót na Dysku Google…'));
    expect(screen.queryByText(/PS nie potwierdził jeszcze dostępu/)).toBeNull();
    shortcut.release();
    await screen.findByText('Możesz zakończyć połączenie.');
    expect(calls.slice(-2).map(call=>call.url)).toEqual([expect.stringContaining('/shortcuts/10/prepare'),expect.stringContaining('/check')]);
    expect(completed).toBe(false);
    expect(screen.getByRole('button',{name:'Zakończ połączenie'})).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Potwierdzam przeniesienie dokumentów/));fireEvent.click(screen.getByRole('button',{name:'Zakończ połączenie'}));
    expectActivity('Kończę łączenie kamieni…');
    expect(screen.getByRole('button',{name:'Zakończ połączenie'})).toBeDisabled();
    expect(screen.getByRole('button',{name:'1. Wybierz kamień i sprawy'})).toBeDisabled();
    finalization.release();
    await waitFor(() => expect(completed).toBe(true));
    expectActivity('Kończę łączenie kamieni…');
    expect(screen.queryByText('Połączenie zakończone.')).toBeNull();
    refreshSectionsAfterMutation.mockImplementationOnce(async () => {
        page.rerender(<><ToastContainer autoClose={false} /></>);
        return true;
    });
    finalStatus.release();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByText('Kończę łączenie kamieni…')).toBeNull();
    const success = await screen.findByText('Połączenie zakończone.');
    expect(success.parentElement).toHaveTextContent(/Dane są dostępne w kamieniu „TEST-DEST.*Cel TEST”/);
    expect(calls.filter(c=>c.url.endsWith('/prepare-targets'))).toHaveLength(1);expect(calls.filter(c=>c.url.endsWith('/apply'))).toHaveLength(1);expect(calls.filter(c=>c.url.endsWith('/finalize'))).toHaveLength(1);
});
