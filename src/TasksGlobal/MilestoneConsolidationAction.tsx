import {consolidationKeys,stablePersonId} from './ConsolidationIdentity';
import React, { useContext, useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { Case, MilestoneData, RepositoryDataItem } from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import ToolsFetch from "../React/Tools/ToolsFetch";
import { RowActionMenuItemProps } from "../View/Resultsets/FilterableTable/FilterableTableTypes";
import { useFilterableTableContext } from "../View/Resultsets/FilterableTable/FilterableTableContext";
import { MilestoneSharingContractsContext } from "./MilestoneSharingAction";
import { buildContractFirstLineLabel } from "./Modals/Case/CaseModalButtons";
import { ConsolidationApi, ConsolidationError, Mapping, Pending, Preview, PreviewRequest, Status, Target, CaseCard, ReadinessCheck, consolidationMessage } from "./ConsolidationApi";

const saveActivity: Record<Pending['path'], string> = {
    'prepare-targets': 'Tworzę sprawy i foldery…',
    apply: 'Łączę sprawy i zadania…',
    finalize: 'Kończę łączenie kamieni…',
    retry: 'Ponawiam ostatni krok łączenia…',
};
const checkActivity = 'Sprawdzam dokumenty i możliwość zakończenia…';
const previewActivity = 'Przygotowuję plan połączenia…';

function FolderLink({ id, label }: { id: string | null; label: string }) {
    return id ? <a href={`https://drive.google.com/drive/folders/${encodeURIComponent(id)}`} target="_blank" rel="noreferrer">{label}</a> : <span>{label}: nieprzygotowany</span>;
}

export default function MilestoneConsolidationAction({ dataObject }: RowActionMenuItemProps<RepositoryDataItem>) {
    const source = dataObject as MilestoneData;
    const contracts = useContext(MilestoneSharingContractsContext);
    const { refreshSectionsAfterMutation } = useFilterableTableContext();
    const keys=consolidationKeys(stablePersonId(MainSetup.currentUserOrNull),source.id,MainSetup.currentUserOrNull?.googleId);
    const api = useMemo(() => new ConsolidationApi(MainSetup.serverUrl, sessionStorage,
        keys.key,fetch,source.id,keys.legacyKeys), [source.id, MainSetup.currentUserOrNull?.enviId, MainSetup.currentUserOrNull?.id, MainSetup.currentUserOrNull?.googleId]);
    const milestones = [...new Map(contracts.flatMap(c => c.milestonesWithCases).map(m => [m.milestone.id, m])).values()];
    const treeSourceCases = milestones.find(m => m.milestone.id === source.id)?.casesWithTasks
        .flatMap(c => [c.caseItem, ...c.subCasesWithTasks.map(sc => sc.caseItem)]) ?? [];
    const [open, setOpen] = useState(false), [activity, setActivity] = useState(""), [error, setError] = useState("");
    const busy = !!activity;
    const [context, setContext] = useState<PreviewRequest | null>(null);
    const [preview, setPreview] = useState<Preview | null>(null), [status, setStatus] = useState<Status | null>(null);
    const [pending, setPending] = useState<Pending | null>(null), [selected, setSelected] = useState<string[]>([]), [confirmed, setConfirmed] = useState(false);
    const [notice, setNotice] = useState("");
    const [step,setStep] = useState<1|2|3>(1);
    const [inventory,setInventory]=useState<Preview['cases']|null>(null);
    const [check, setCheck] = useState<ReadinessCheck | null>(null), [documentsConfirmed,setDocumentsConfirmed] = useState(false);
    if (![1, 2, 3].includes(MainSetup.currentUserOrNull?.systemRoleId ?? 0) || source._type?.id !== 5 || source.offerId != null || source._offer) return null;
    if (!keys.bound) return <Alert variant="warning">Nie potwierdzono tożsamości osoby. Odśwież sesję przed połączeniem danych.</Alert>;

    function changed(next: PreviewRequest) { if(next.destinationMilestoneId!==context?.destinationMilestoneId)setInventory(null); setStep(1); setContext(next); setPreview(null); setSelected([]); setConfirmed(false); setCheck(null); setDocumentsConfirmed(false); }
    async function work(label: string, action: () => Promise<void>) {
        setActivity(label); setError(""); setNotice("");
        try { await action(); }
        catch (reason) {
            if (reason instanceof ConsolidationError && reason.status === 401) ToolsFetch.notifySessionExpired();
            setError(reason instanceof TypeError ? 'Nie można połączyć się z serwerem. Wynik żądania pozostał niepotwierdzony.' : reason instanceof Error ? reason.message : "Nie udało się odczytać stanu operacji.");
        } finally {
            try { setPending(api.pending()); } catch (reason) { setError(String(reason)); }
            setActivity("");
        }
    }
    function show() {
        setCheck(null);setDocumentsConfirmed(false);
        setInventory(null); setStep(1); setOpen(true); setPreview(null); setStatus(null); setContext(null); setSelected([]); setConfirmed(false);
        void work('Sprawdzam stan połączenia…', async () => {
            const saved = api.pending(); setPending(saved);
            if (saved) setContext(saved.context);
            const { operation } = await api.active(source.id);
            setStatus(operation);
            if(operation && operation.counts.pending===0)setStep(3);
            if (operation) setContext({ sourceMilestoneId: operation.sourceMilestoneId, destinationMilestoneId: operation.destinationMilestoneId,
                operationId: operation.operationId, mappings: operation.caseMappings.map(m => ({ sourceCaseId: m.sourceCaseId, target: { mode: "existing", caseId: m.destinationCaseId } })) });
        });
    }
    async function fresh(request: PreviewRequest,showPlan=false) {
        setCheck(null);setDocumentsConfirmed(false);
        const next = await api.preview(request);
        setContext(request); setPreview(next); setInventory(next.cases); setConfirmed(false);
        setSelected(next.units.every(unit => unitEligible(unit, next, request)) ? next.units.map(unit => unit.unitId) : []);
        if(showPlan)setStep(2);
    }
    function choose(row: Case, value: string) {
        if (!context) return;
        let target: Target | null = null;
        if (value === "create") target = { mode: "create", caseTypeId: row._type.id, name: row._type.isUniquePerMilestone ? "" : row.name ?? "", parentSourceCaseId: row.parentCaseId ?? row._parentCase?.id ?? null };
        else if (value) target = { mode: "existing", caseId: Number(value) };
        changed({ ...context, mappings: [...context.mappings.filter(m => m.sourceCaseId !== row.id), ...(target ? [{ sourceCaseId: row.id, target }] : [])] });
    }
    async function continueConnection(operation: Status) {
        setDocumentsConfirmed(false);
        setCheck(null);
        setActivity(checkActivity);
        const initial = await api.check(operation.operationId);

        // When documents need attention, show that before attempting to create shortcuts.
        if (!operation.allowedActions.includes('FINALIZE') || !initial.sourceTree.complete ||
            initial.sourceTree.remaining.length || !initial.blockers.length ||
            initial.blockers.some(blocker => blocker.code !== 'SHORTCUT_NOT_READY')) {
            setCheck(initial);
            return;
        }
        const contractIds = initial.blockers.map(blocker => /^contract:([1-9][0-9]*)$/.exec(blocker.reference)?.[1]);
        if (contractIds.some(id => !id)) {
            setCheck(initial);
            return;
        }

        setActivity('Przygotowuję skrót na Dysku Google…');
        try {
            for (const id of new Set(contractIds)) await api.prepareShortcut(operation.operationId, Number(id));
        } catch (error) {
            if (error instanceof ConsolidationError &&
                ['SHORTCUT_PREPARATION_FAILED', 'SHORTCUT_ACTION_UNAVAILABLE'].includes(error.code)) {
                setCheck(initial);
                return;
            }
            throw error;
        }
        setActivity(checkActivity);
        setCheck(await api.check(operation.operationId));
    }

    async function send(intent: Pending) {
        const result = await api.mutate<{ previewId?: string; revision?: string; mappings?: Mapping[]; operationId?: string }>(intent);
        let next = intent.context;
        if (intent.path === "prepare-targets") next = { ...next, mappings: result.mappings! };
        if (result.operationId) next = { ...next, operationId: result.operationId };
        if (intent.path === 'finalize' || intent.path === 'retry') {
            setStep(3); setCheck(null); setDocumentsConfirmed(false); setPreview(null);
            const saved = next.operationId ? await api.status(next.operationId, next) : null;
            if (saved) setStatus(saved);
            if (saved?.state === 'COMPLETED') {
                const destinationLabel = milestoneLabel(saved.destinationMilestoneId);
                toast.success(
                    <><strong>Połączenie zakończone.</strong> Dane są dostępne w kamieniu „{destinationLabel}”.</>,
                    { toastId: saved.operationId },
                );
            } else {
                setNotice('Zapisano wynik próby zakończenia połączenia. Sprawdź stan poniżej.');
            }
            await refreshSectionsAfterMutation();
            return;
        }
        // A failed read-back never turns confirmed transfer into a new apply request.
        setContext(next); setPreview(null); setConfirmed(false); setSelected([]);
        let progress:Status|null=null;
        if (next.operationId) {const saved=await api.status(next.operationId,next);progress=saved;setStatus(saved);if(saved.state!=='TRANSFERRING'){setStep(3);await refreshSectionsAfterMutation();setNotice('Potwierdzono historyczną partię. Dalszy stan pokazuje zachowana operacja.');return;}}
        setStep(progress?.counts.pending===0?3:2);
        await fresh(next);
        if (!await refreshSectionsAfterMutation()) throw new Error("Zapis potwierdzony, ale drzewo wymaga odświeżenia. Nie ponawiaj zakończonej partii.");
        if (progress?.counts.pending === 0 && progress.allowedActions.includes('CHECK')) {
            await continueConnection(progress);
        } else {
            setNotice(intent.path === 'prepare-targets'
                ? 'Nowe sprawy są gotowe. Możesz teraz połączyć sprawy i zadania.'
                : 'Wybrana część została połączona. Pozostałe sprawy możesz połączyć teraz lub później.');
        }
    }
    const destination = milestones.find(m => m.milestone.id === context?.destinationMilestoneId);
    const contractLabel = (id:number) => buildContractFirstLineLabel(contracts.find(c=>c.contract.id===id)?.contract)||'Oznaczenie kontraktu niedostępne — odśwież drzewo';
    const milestoneLabel = (id:number) => {
        const m=id===source.id?source:milestones.find(row=>row.milestone.id===id)?.milestone;
        return m ? [buildContractFirstLineLabel(m._contract),m.name||m._type?.name].filter(Boolean).join(' · ')||'Oznaczenie kamienia niedostępne — odśwież drzewo' : 'Oznaczenie celu niedostępne — odśwież drzewo';
    };
    const treeTargetCases = destination?.casesWithTasks.flatMap(c => [c.caseItem, ...c.subCasesWithTasks.map(sc => sc.caseItem)]) ?? [];
    const fromCard = (card:CaseCard) => ({id:card.id,name:card.name,parentCaseId:card.parentCaseId,gdFolderId:card.folderId,_type:{id:card.typeId,name:card.typeName,isUniquePerMilestone:card.isUniquePerMilestone}} as Case);
    const rows = context ? (inventory?.source.map(fromCard) ?? treeSourceCases) : [];
    const targetCases = inventory?.destination.map(fromCard) ?? treeTargetCases;
    const caseLabel=(id:number, side:'source'|'destination')=>{
        const row=(side==='source'?rows:targetCases).find(row=>row.id===id);
        return row?.name||row?._type.name||'Oznaczenie sprawy niedostępne — odśwież podgląd';
    };
    const hasCreate = context?.mappings.some(m => m.target.mode === "create") ?? false;
    const requestedCreates=context?.mappings.filter(m=>m.target.mode==='create')??[];
    const createsExplicit=!!preview&&requestedCreates.length>0&&requestedCreates.every(requested=>{
        const m=preview.mappings.find(m=>m.sourceCaseId===requested.sourceCaseId),target=requested.target;
        return m?.state==='SELECTED'&&m.target?.mode==='create'&&target.mode==='create'&&m.target.caseTypeId===target.caseTypeId&&m.target.name===target.name&&m.target.parentSourceCaseId===target.parentSourceCaseId;
    })&&preview.conflicts.every(c=>c.sourceCaseId!==null&&!requestedCreates.some(m=>m.sourceCaseId===c.sourceCaseId)||c.code==='FOLDER_NOT_READY'&&requestedCreates.some(m=>m.sourceCaseId===c.sourceCaseId));
    const unitEligible=(unit:Preview['units'][number], plan=preview, mappingRequest=context)=>unit.state==='ANALYZED'&&unit.sourceCaseIds.every(id=>{
        const m=plan?.mappings.find(m=>m.sourceCaseId===id),selectedMapping=mappingRequest?.mappings.find(m=>m.sourceCaseId===id);
        return m?.state==='SELECTED'&&m.target?.mode==='existing'&&selectedMapping?.target.mode==='existing'&&m.target.caseId===selectedMapping.target.caseId;
    });
    const stateName=(value:string)=>({TRANSFERRING:"W trakcie przenoszenia",FINALIZING:"Kończenie połączenia",RECONCILIATION_REQUIRED:"Wymaga ponownego sprawdzenia",COMPLETED:"Połączenie zakończone",MOVED:"Przeniesiono",PENDING:"Pozostaje",BLOCKED:"Zablokowano",ANALYZED:"Gotowa grupa",SELECTED:"Cel wybrany",PROPOSED:"Propozycja do potwierdzenia",TRASH_INTENT:"Zaplanowano porządkowanie",TRASH_CONFIRMED:"Potwierdzono folder w koszu",TRASHED:"Folder w koszu",NOT_STARTED:"Nie rozpoczęto",UNKNOWN:"Niepotwierdzony"} as Record<string,string>)[value] || "Wymaga sprawdzenia";
    const choiceCodes=new Set(['AMBIGUOUS_MAPPING','MISSING_DESTINATION','INVALID_MAPPING','INVALID_PARENT_MAPPING','INVALID_NAME','NAME_CONFLICT','FOLDER_NOT_READY']);
    const isPreparationNotice=(c:Preview['conflicts'][number])=>c.code==='FOLDER_NOT_READY'&&requestedCreates.some(m=>m.sourceCaseId===c.sourceCaseId);
    const choiceConflicts=preview?.conflicts.filter(c=>choiceCodes.has(c.code)&&!isPreparationNotice(c))??[];
    const technicalConflicts=preview?.conflicts.filter(c=>!choiceCodes.has(c.code))??[];
    return <>
        <Button size="sm" variant="outline-primary" onClick={e => { e.stopPropagation(); show(); }}>Połącz kamienie</Button>
        <Modal show={open} size="xl" scrollable onHide={() => { if (!busy) setOpen(false); }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Modal.Header closeButton={!busy}><Modal.Title>Połącz dwa kamienie</Modal.Title></Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger" role="alert">{error}</Alert>}{notice && <Alert variant="info" role="status">{notice}</Alert>}
                <p><strong>Skąd:</strong> {milestoneLabel(source.id)}</p>
                {context&&<p><strong>Dokąd:</strong> {milestoneLabel(context.destinationMilestoneId)}</p>}
                <nav aria-label="Etapy łączenia kamieni" className="d-flex flex-wrap gap-2 mb-3">
                    <Button variant={step===1?'primary':'outline-primary'} aria-current={step===1?'step':undefined} disabled={busy} onClick={()=>setStep(1)}>1. Wybierz kamień i sprawy</Button>
                    <Button variant={step===2?'primary':'outline-primary'} aria-current={step===2?'step':undefined} disabled={busy || !preview} onClick={()=>setStep(2)}>2. Połącz sprawy</Button>
                    <Button variant={step===3?'primary':'outline-primary'} aria-current={step===3?'step':undefined} disabled={busy || !status || status.counts.pending!==0} onClick={()=>setStep(3)}>3. Dokończ łączenie</Button>
                </nav>
                {!!status?.counts.pending && <p role="status">Część spraw została połączona. Pozostałe możesz połączyć poniżej.</p>}
                {pending && <Alert variant="warning">Poprzednie żądanie ma niepotwierdzony wynik. Ponowienie zachowa to samo żądanie.
                    <Button disabled={busy} onClick={() => void work(saveActivity[pending.path], () => send(pending))}>Ponów zapisane żądanie</Button></Alert>}
                <section hidden={step!==1} aria-label="Wybór spraw">
                <h5>Krok 1 z 3: wybierz drugi kamień</h5>
                <p>Wskaż kamień, do którego mają trafić dane. Przy każdej sprawie wybierz istniejącą sprawę w celu albo utworzenie nowej. Podsprawy wybieraj po ich sprawie nadrzędnej.</p>
                <Form.Label htmlFor={`consolidation-target-${source.id}`}>Z którym kamieniem połączyć?</Form.Label>
                <Form.Select id={`consolidation-target-${source.id}`} disabled={busy || !!pending || !!status} value={context?.destinationMilestoneId ?? ""}
                    onChange={e => { if (e.target.value) { const next={sourceMilestoneId:source.id,destinationMilestoneId:Number(e.target.value),mappings:[]}; changed(next); void work(previewActivity, () => fresh(next)); } }}>
                    <option value="">Wybierz kamień docelowy</option>
                    {milestones.filter(m => m.milestone.id !== source.id && m.milestone._type.id === 5 && m.milestone.offerId == null && !m.milestone._offer).map(m =>
                        <option key={m.milestone.id} value={m.milestone.id}>{milestoneLabel(m.milestone.id)}</option>)}
                </Form.Select>
                {context && <>
                    <Table responsive><thead><tr><th>Sprawa źródłowa</th><th>Cel / nowa sprawa</th><th>Stan podglądu</th></tr></thead><tbody>
                        {rows.map(row => {
                            const mapping = context.mappings.find(m => m.sourceCaseId === row.id), analysis = preview?.mappings.find(m => m.sourceCaseId === row.id);
                            const moved = status?.caseMappings.some(m => m.sourceCaseId === row.id);
                            return <tr key={row.id}><td>{row.name || row._type.name} (ID {row.id}){row._parentCase && <div>Podsprawa ID {row._parentCase.id}</div>}</td><td>
                                <Form.Select aria-label={`Cel sprawy ${row.id}`} disabled={busy || !!pending || moved} value={mapping?.target.mode === "existing" ? mapping.target.caseId : mapping ? "create" : ""} onChange={e => choose(row, e.target.value)}>
                                    <option value="">Wybierz sprawę docelową</option><option value="create">Utwórz nową sprawę w celu</option>
                                    {targetCases.filter(c => {
                                        const parent=row.parentCaseId??row._parentCase?.id??null;
                                        const mappedParent=context.mappings.find(m=>m.sourceCaseId===parent)?.target;
                                        const expectedParent=parent===null?null:mappedParent?.mode==='existing'?mappedParent.caseId:undefined;
                                        return c._type.id===row._type.id&&expectedParent!==undefined&&(c.parentCaseId??c._parentCase?.id??null)===expectedParent;
                                    }).map(c => <option key={c.id} value={c.id}>{c.name || c._type.name} · ID {c.id}</option>)}
                                </Form.Select>
                                {mapping?.target.mode === "create" && <Form.Control aria-label={`Nazwa nowej sprawy ${row.id}`} value={mapping.target.name} disabled={busy || !!pending || row._type.isUniquePerMilestone}
                                    onChange={e => changed({ ...context, mappings: context.mappings.map(m => m.sourceCaseId === row.id && m.target.mode === "create" ? { ...m, target: { ...m.target, name: e.target.value } } : m) })} />}
                            </td><td>{moved ? "Przeniesiono" : analysis ? stateName(analysis.state) : "Brak świeżego podglądu"}{analysis?.state==='PROPOSED'&&analysis.candidateCaseIds.length===1&&<div>Proponowana sprawa: {caseLabel(analysis.candidateCaseIds[0],'destination')}. Wybierz ją z listy, aby potwierdzić.</div>}{analysis?.conflictCodes.map(code=><div key={code}>{consolidationMessage(code)}</div>)}</td></tr>;
                        })}
                    </tbody></Table>
                    <Button disabled={busy || !!pending} onClick={() => void work(previewActivity, () => fresh(context,true))}>Dalej: zobacz, co się połączy</Button>
                </>}
                </section>
                {preview && <section hidden={step!==2} aria-label="Sprawdzenie i transfer">
                    <h5>Krok 2 z 3: połącz sprawy i zadania</h5>
                    <p>Sprawdź, do których spraw trafią zadania i powiązania pism. Po połączeniu PS sprawdzi foldery dokumentów i pokaże, czy coś trzeba zrobić.</p>
                    <Button variant="outline-secondary" className="me-2 mb-2" disabled={busy} onClick={()=>setStep(1)}>Wróć do wyboru spraw</Button>
                    <Button variant="outline-secondary" className="mb-2" disabled={busy||!!pending} onClick={()=>context&&void work(previewActivity, () => fresh(context))}>Odśwież plan</Button>
                    <h6>Przed i po połączeniu</h6>
                    <Table responsive><thead><tr><th>Przed: sprawa źródłowa</th><th>Po: sprawa docelowa</th><th>Zadania i powiązania</th></tr></thead><tbody>
                        {(preview.cases?.source??[]).map(card=>{
                            const target=context?.mappings.find(m=>m.sourceCaseId===card.id)?.target;
                            const destinationCard=target?.mode==='existing'?preview.cases.destination.find(c=>c.id===target.caseId):undefined;
                            return <tr key={card.id}><td>{card.name||card.typeName}{card.parentCaseId!==null&&<div>Podsprawa sprawy {card.parentCaseId}</div>}</td>
                                <td>{destinationCard?(destinationCard.name||destinationCard.typeName):target?.mode==='create'?`Nowa pusta sprawa: ${target.name||card.typeName}`:'Cel wymaga wyboru'}{destinationCard?.parentCaseId!=null&&<div>Podsprawa sprawy {destinationCard.parentCaseId}</div>}</td>
                                <td>Do przeniesienia: {card.taskCount} zadań, {card.relationCount} powiązań. Istniejący cel: {destinationCard?.taskCount??0} zadań, {destinationCard?.relationCount??0} powiązań.</td></tr>;
                        })}
                    </tbody></Table>
                    <p>Kontrakt źródłowy: {contractLabel(preview.sourceContractId)}; rozliczeniowy po transferze: {contractLabel(preview.accountingContractId)}. Godziny pozostają przy zadaniach.</p>
                    {choiceConflicts.length>0&&<Alert variant="warning"><strong>Wymaga Twojego wyboru</strong><p>Wróć do kroku 1 i popraw wskazane sprawy, a potem ponownie sprawdź plan.</p>{choiceConflicts.map((c,i)=><div key={i}>{c.sourceCaseId!==null?caseLabel(c.sourceCaseId,'source')+': ':''}{consolidationMessage(c.code)}</div>)}</Alert>}
                    {technicalConflicts.length>0&&<Alert variant="danger"><strong>Wymaga naprawy aplikacji</strong><p>Nie można bezpiecznie przenieść wszystkich danych. Tych blokad nie usuniesz wyborem sprawy. Nie usuwaj pism ani podpisów, aby kontynuować.</p>{[...new Set(technicalConflicts.map(c=>c.code))].map(code=><div key={code}>{consolidationMessage(code)}</div>)}<details><summary>Szczegóły techniczne dla obsługi</summary>{technicalConflicts.map((c,i)=><div key={i}>{c.code}: {c.reference}</div>)}</details></Alert>}
                    {hasCreate&&<Alert variant="info">
                        <strong>Najpierw utwórz nowe sprawy i ich foldery</strong>
                        <p>Wybór jest zapisany w planie, ale nowe sprawy jeszcze nie istnieją. Poniższe działanie utworzy je w kamieniu docelowym. Nie przeniesie jeszcze zadań ani pism.</p>
                        <ul>{requestedCreates.map(m=><li key={m.sourceCaseId}>{caseLabel(m.sourceCaseId,'source')} → nowa sprawa: {m.target.mode==='create'?(m.target.name||caseLabel(m.sourceCaseId,'source')):''}</li>)}</ul>
                        <Form.Check id={'consolidation-prepare-confirm-'+source.id} label="Potwierdzam utworzenie wskazanych nowych spraw i folderów." checked={confirmed} disabled={busy||!!pending} onChange={e=>setConfirmed(e.target.checked)}/>
                        <Button disabled={busy||!!pending||!confirmed||!createsExplicit} onClick={()=>void work(saveActivity['prepare-targets'], async()=>{
                            if(!context)return;await send({path:'prepare-targets',context,body:{requestId:window.crypto.randomUUID(),previewId:preview.previewId,expectedRevision:preview.revision}});
                        })}>Utwórz sprawy i foldery</Button>
                        <p className="mb-0 mt-2">Po utworzeniu spraw zobaczysz świeży plan. Wtedy wybierzesz grupy danych i potwierdzisz ich przeniesienie.</p>
                    </Alert>}
                    {!hasCreate&&<>
                    <h6>Potwierdź, co chcesz połączyć</h6>
                    {preview.units.length > 0 && selected.length === preview.units.length
                        ? <p>Wybrane są wszystkie pozostałe sprawy i informacje z kamienia.</p>
                        : <p>Wybierz poniżej, co ma trafić do drugiego kamienia. Powiązane sprawy wybiera się razem.</p>}
                    <details className="mb-2" open={preview.units.some(unit => !unitEligible(unit))}>
                        <summary>Pokaż sprawy i zmień wybór</summary>
                    {preview.movedUnits.map(u => <p key={u.unitId}>Grupa: przeniesiono</p>)}
                    {preview.units.map(u => <Form.Check key={u.unitId} id={`consolidation-unit-${source.id}-${u.unitId}`} label={`Grupa ${u.sourceCaseIds.map(id=>caseLabel(id,'source')).join(", ") || "dane kamienia"}: ${stateName(u.state)}; zadania ${u.counts?.tasks ?? 0}, relacje ${u.counts?.relations ?? 0}, notatki ${u.counts?.notes ?? 0}`}
                        disabled={busy || !!pending || !unitEligible(u)} checked={selected.includes(u.unitId)} onChange={e => { setConfirmed(false); setSelected(e.target.checked ? [...selected, u.unitId] : selected.filter(id => id !== u.unitId)); }} />)}
                    </details>
                    <Form.Check id={`consolidation-confirm-${source.id}`} label="Potwierdzam połączenie wybranych spraw i zadań z drugim kamieniem." checked={confirmed} disabled={busy || !!pending} onChange={e => setConfirmed(e.target.checked)} />
                    <Button disabled={busy || !!pending || !confirmed || !selected.length||selected.some(id=>!preview.units.some(u=>u.unitId===id&&unitEligible(u)))} onClick={() => void work(saveActivity.apply, async () => {
                        if (!context) return;
                        await send({path:"apply",context,body:{requestId:window.crypto.randomUUID(),previewId:preview.previewId,expectedRevision:preview.revision,unitIds:selected}});
                    })}>Połącz sprawy i zadania</Button>
                    </>}
                </section>}
                <section hidden={step!==3} aria-label="Dokumenty i zakończenie">
                <h5>Krok 3 z 3: dokończ łączenie</h5>
                {!status&&<p>Ten krok będzie dostępny po przeniesieniu wszystkich grup danych w PS.</p>}
                {status && <Alert variant={status.state === 'COMPLETED' || status.counts.pending === 0 && status.state === 'TRANSFERRING' ? 'success' : 'warning'}>
                    <strong>{status.state === 'TRANSFERRING' && status.counts.pending === 0
                        ? `Sprawy i zadania są już w kamieniu docelowym.`
                        : `PS: ${stateName(status.state)}`}</strong>
                    {status.state === 'COMPLETED' && <div>Połączenie zakończone. Dane są dostępne w kamieniu docelowym.</div>}
                    <div>Nową pracę prowadź w: {milestoneLabel(status.destinationMilestoneId)}.</div>
                    {status.cleanup.reason === 'OWNED_TRASH_NOT_CONFIRMED' && <div>
                        Brak trwałego potwierdzenia własnego przeniesienia folderu do kosza. Właściciel powinien sprawdzić i ręcznie przywrócić dokładny folder źródłowy, a potem wykonać nową kontrolę. <FolderLink id={status.cleanup.sourceFolderId ?? null} label="Sprawdź dokładny folder źródłowy" />
                    </div>}
                </Alert>}
                {status && status.state !== 'COMPLETED' && <>
                    <h6>Co dalej?</h6>
                    {!check && !busy && <p>Kontynuuj, a PS sprawdzi, czy można zakończyć połączenie.</p>}
                    {check && <Alert variant={check.ready ? 'success' : 'warning'}>
                        <strong>{check.ready ? 'Możesz zakończyć połączenie.' : 'Jeszcze nie można zakończyć połączenia.'}</strong>
                        {check.sourceTree.remaining.length > 0 && <>
                            <p className="mb-1 mt-2">Przenieś pozostałe pozycje ze starego folderu do odpowiedniego folderu w nowym kamieniu. Pary folderów są poniżej. Jeśli pozycja jest skrótem do pisma, przenieś tylko skrót.</p>
                            <ul className="mb-2">{check.sourceTree.remaining.map((file, i) => <li key={file.id}>
                                {/^[A-Za-z0-9_-]+$/.test(file.id)
                                    ? <a href={`https://drive.google.com/open?id=${encodeURIComponent(file.id)}`} target="_blank" rel="noreferrer">{file.name || `Zobacz pozycję ${i + 1}`}</a>
                                    : file.name || `Pozostała pozycja ${i + 1}`}
                            </li>)}</ul>
                            <p className="mb-0">Gdy dokumenty będą w celu, wróć tutaj i wybierz „Dokumenty są na miejscu — kontynuuj”.</p>
                        </>}
                        {!check.sourceTree.remaining.length && check.blockers.some(item => item.code === 'SHORTCUT_NOT_READY') &&
                            <p className="mb-1 mt-2">PS nie potwierdził jeszcze dostępu do nowego kamienia z drugiego kontraktu. Spróbuj ponownie. Jeśli to się powtórzy, skontaktuj się z osobą obsługującą PS.</p>}
                        {check.blockers.filter(blocker => blocker.code !== 'SHORTCUT_NOT_READY' &&
                            (blocker.code !== 'SOURCE_POPULATED' || !check.sourceTree.remaining.length)).map((blocker, i) =>
                            <p key={i} className="mb-1 mt-2">{consolidationMessage(blocker.code)}</p>)}
                    </Alert>}
                    {!check?.ready && <Button className="mb-3" disabled={busy || !!pending || !status.allowedActions.includes('CHECK')}
                        onClick={() => void work(checkActivity, () => continueConnection(status))}>
                        {check?.sourceTree.remaining.length ? 'Dokumenty są na miejscu — kontynuuj' : check ? 'Spróbuj ponownie' : 'Kontynuuj łączenie'}
                    </Button>}
                    <details className="mb-3" open={!!check?.sourceTree.remaining.length}>
                    <summary>Foldery dokumentów: skąd i dokąd</summary>
                    <p>Przenieś zawartość do odpowiednich folderów w celu. Zostaw stare foldery na miejscu. Jeśli znajdziesz skrót do pisma, przenieś sam skrót. Oryginał pisma zostaw w folderze korespondencji.</p>
                    <Table responsive size="sm" className="mb-3">
                        <thead><tr><th>Sprawa</th><th>Źródło</th><th>Cel</th></tr></thead>
                        <tbody>
                            <tr><th scope="row">Kamień</th>
                                <td><FolderLink id={preview?.milestoneFolderPair.sourceFolderId ?? check?.sourceFolderId ?? source.gdFolderId ?? null} label="Otwórz stary folder kamienia" /></td>
                                <td><FolderLink id={preview?.milestoneFolderPair.destinationFolderId ?? check?.destinationFolderId ?? destination?.milestone.gdFolderId ?? null} label="Otwórz docelowy folder kamienia" /></td>
                            </tr>
                            {(preview?.folderPairs ?? status.caseMappings.map(mapping => ({
                                ...mapping,
                                sourceFolderId: rows.find(row => row.id === mapping.sourceCaseId)?.gdFolderId ?? null,
                                destinationFolderId: targetCases.find(row => row.id === mapping.destinationCaseId)?.gdFolderId ?? null,
                            }))).map(pair => {
                                const from = caseLabel(pair.sourceCaseId, 'source');
                                const to = pair.destinationCaseId === null ? 'nowy cel' : caseLabel(pair.destinationCaseId, 'destination');
                                return <tr key={pair.sourceCaseId}><th scope="row">{from === to ? from : `${from} → ${to}`}</th>
                                    <td><FolderLink id={pair.sourceFolderId} label={`Otwórz stary folder: ${from}`} /></td>
                                    <td><FolderLink id={pair.destinationFolderId} label={`Otwórz docelowy folder: ${to}`} /></td></tr>;
                            })}
                        </tbody>
                    </Table>
                    </details>
                    {(check?.ready || !!check && status.allowedActions.includes('RETRY')) && <h6>Potwierdź zakończenie</h6>}
                    {check && (check.ready || status.allowedActions.includes('RETRY')) && <Form.Check className="mb-2"
                        id={`consolidation-documents-${source.id}`} label={`Potwierdzam przeniesienie dokumentów do celu: ${milestoneLabel(status.destinationMilestoneId)}.`}
                        checked={documentsConfirmed} disabled={busy || !!pending} onChange={e => setDocumentsConfirmed(e.target.checked)} />}
                    {check?.ready && <p>Po zakończeniu PS usunie stary kamień z listy i przeniesie jego folder do kosza.</p>}
                    <Button disabled={busy||!!pending||!check?.ready||!documentsConfirmed||!status.allowedActions?.includes('FINALIZE')} onClick={()=>void work(saveActivity.finalize, async()=>{
                        if(!context||!check)return;await send({path:'finalize',context:{...context,operationId:status.operationId},body:{requestId:window.crypto.randomUUID(),expectedRevision:check.revision,checkId:check.checkId,confirmDocumentsMoved:true,destinationMilestoneId:status.destinationMilestoneId}});
                    })}>Zakończ połączenie</Button>
                    {status.allowedActions.includes('RETRY')&&<>
                        <p>Nowe ponowienie wiąże Twoją własną kontrolę i potwierdzenie. Gdy źródło jest już w koszu, ten krok może tylko przywrócić potwierdzony folder źródłowy; potem wymaga nowej kontroli. Nie usuwa danych w PS.</p>
                        <Button disabled={busy||!!pending||!check||!documentsConfirmed} onClick={()=>void work(saveActivity.retry, async()=>{
                            if(!context||!check)return;await send({path:'retry',context:{...context,operationId:status.operationId},body:{requestId:window.crypto.randomUUID(),expectedRevision:check.revision,checkId:check.checkId,confirmDocumentsMoved:true,destinationMilestoneId:status.destinationMilestoneId}});
                        })}>{check?.ready?'Ponownie sprawdź i zakończ':'Przywróć własne źródło i sprawdź ponownie'}</Button>
                    </>}
                </>}
                </section>
                {status&&<p>Zamknięcie widoku nie cofa zapisanych partii ani pracy wykonanej później w celu.</p>}
            </Modal.Body>
            <Modal.Footer className="flex-nowrap">
                <div role="status" className="me-auto d-flex align-items-center gap-2">
                    {busy && <><Spinner as="span" animation="border" size="sm" className="flex-shrink-0" aria-hidden="true" />{activity}</>}
                </div>
                <Button disabled={busy} onClick={() => setOpen(false)}>Zamknij</Button>
            </Modal.Footer>
        </Modal>
    </>;
}
