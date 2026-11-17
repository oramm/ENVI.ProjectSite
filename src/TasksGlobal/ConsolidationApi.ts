// Public DTOs: PS-nodeJS/src/contracts/milestones/consolidation/{Mapping,BatchValidator,Progress,StatusController,Effects}.
export type Target = { mode: "existing"; caseId: number } | { mode: "create"; caseTypeId: number; name: string; parentSourceCaseId: number | null };
export type Mapping = { sourceCaseId: number; target: Target };
export type PreviewRequest = { sourceMilestoneId: number; destinationMilestoneId: number; mappings: Mapping[]; operationId?: string };
export type Unit = { unitId: string; sourceCaseIds: number[]; state: "ANALYZED" | "BLOCKED" | "MOVED" | "PENDING"; counts?: { tasks: number; relations: number; notes: number }; conflicts?: { code: string; reference: string }[] };
export type CaseCard={id:number;milestoneId:number;typeId:number;typeName:string;isUniquePerMilestone:boolean;parentCaseId:number|null;name:string;folderId:string|null;taskCount:number;relationCount:number};
export type ReadinessCheck={operationId:string;checkId:string;revision:string;ready:boolean;sourceFolderId:string;destinationFolderId:string;
    blockers:{code:string;reference:string}[];sourceTree:{complete:boolean;remaining:{id:string;name?:string}[]}};
export type FinalizationAck={operationId:string;revision:string;requestId:string;checkId:string;checkedRevision:string;destinationMilestoneId:number;state:'FINALIZING'|'RECONCILIATION_REQUIRED'|'COMPLETED';documentsReady:boolean;sourceDatabaseRemoved:boolean;sourceFolderTrashed:boolean};
export type Preview = Omit<PreviewRequest, "mappings"> & { previewId: string; revision: string; sourceContractId: number; accountingContractId: number;
    cases:{source:CaseCard[];destination:CaseCard[]};
    mappings: { sourceCaseId: number; target: Target | null; candidateCaseIds: number[]; state: "SELECTED" | "PROPOSED" | "BLOCKED"; conflictCodes: string[] }[];
    units: Unit[]; movedUnits: { unitId: string; unitKey: string; moved: boolean; state: "MOVED" }[]; conflicts: { code: string; reference: string;sourceCaseId:number|null }[];
    numbers: { sourceCaseId: number; number: number | null; subCaseNumber: number | null; name: string | null }[];
    folderPairs: { sourceCaseId: number; destinationCaseId: number | null; sourceFolderId: string; destinationFolderId: string | null }[];
    milestoneFolderPair: { sourceFolderId: string; destinationFolderId: string | null };
};
export type Status = { operationId: string; revision: string; state: "TRANSFERRING"|'FINALIZING'|'RECONCILIATION_REQUIRED'|'COMPLETED'; sourceMilestoneId: number; destinationMilestoneId: number;
    accountingContractId: number; caseMappings: { sourceCaseId: number; destinationCaseId: number }[];
    counts: { moved: number; pending: number }; units: { unitId: string; unitKey: string; moved: boolean; state: "MOVED" | "PENDING" }[]; documentsReady: boolean;
    allowedActions:string[];
    sourceDatabaseRemoved?:boolean;sourceFolderTrashed?:boolean;
    requiresRevalidation: true; cleanup: { reason?:string;sourceFolderId?:string|null;step: string; sourceFolderStatus: string; remainingCount: number | null; verificationComplete: boolean };
};
export type Pending = { path: "prepare-targets" | "apply"|'finalize'|'retry'; body: { requestId: string; previewId?: string; expectedRevision: string; unitIds?: string[];checkId?:string;confirmDocumentsMoved?:true;destinationMilestoneId?:number }; context: PreviewRequest };
export class ConsolidationError extends Error {
    constructor(public code: string, public status: number) { super(consolidationMessage(code)); }
}
export function consolidationMessage(code:string){const messages:Record<string,string>={
    STALE_REVISION:'Dane zmieniły się od podglądu. Pobierz świeży podgląd i wybierz grupy ponownie.',
    ROLE_DENIED:'Nie masz uprawnienia do zarządzania połączeniem.',SCOPE_DENIED:'Nie masz dostępu do całej wybranej pracy.',
    OBJECT_NOT_FOUND:'Wybrany obiekt nie jest już dostępny.',CROSS_PROJECT:'Połączenie wymaga kamieni z tego samego projektu.',
    HUMAN_REQUIRED:'Finalizację może potwierdzić wyłącznie zalogowana osoba.',COMMIT_OUTCOME_UNKNOWN:'Nie potwierdzono końcowego zapisu. Zachowano dokładne żądanie; ponów je, aby odczytać trwały wynik.',CHECK_NOT_READY:'Nie można jeszcze zakończyć połączenia. Po przywróceniu folderu źródłowego wykonaj nową kontrolę.',
    DRIVE_STATE_UNCERTAIN:'Stan folderu nie został potwierdzony. Zachowano żądanie; sprawdź stan przed ponowieniem.',
    RETRYABLE_STORAGE_ERROR:'Nie potwierdzono zapisu. Ponów zachowane żądanie, aby ustalić jego wynik.',
    OPERATION_IN_PROGRESS:'Trwa już operacja na tym źródle. Odśwież jej stan.',DEPENDENCY_CONFLICT:'Ta grupa ma nierozwiązane powiązania. Sprawdź podgląd.',
    AMBIGUOUS_MAPPING:'W kamieniu docelowym pasuje kilka spraw. Wybierz właściwą sprawę docelową.',
    MISSING_DESTINATION:'Nie znaleziono pasującej sprawy w celu. Wybierz sprawę albo utwórz nową.',
    INVALID_PARENT_MAPPING:'Najpierw wybierz cel sprawy nadrzędnej, a następnie jej podsprawy.',
    INVALID_NAME:'Podaj prawidłową nazwę nowej sprawy.',
    INVALID_MAPPING:'Wybór spraw nie jest zgodny z hierarchią i typami. Popraw mapowanie.',FOLDER_NOT_READY:'Docelowy folder wymaga przygotowania.',
    INVALID_REQUEST:'Żądanie jest niekompletne. Odśwież dane i wybierz działanie ponownie.',NAME_CONFLICT:'Nazwa nowej sprawy koliduje z istniejącą. Wybierz inną nazwę.',
    IDEMPOTENCY_CONFLICT:'Żądanie różni się od poprzedniej próby. Wróć do zachowanego żądania.',SESSION_REQUIRED:'Sesja wygasła. Zaloguj się ponownie.',
    STALE_CHECK:'Stan folderów lub powiązań zmienił się podczas sprawdzania. Sprawdź ponownie.',
    TRANSFER_PENDING:'Pozostały grupy pracy do przeniesienia.',MAPPING_CHANGED:'Sprawy lub cel zmieniły się. Sprawdź świeży podgląd.',
    PS_DEPENDENCY:'Na źródle pozostało powiązanie danych. Wyjaśnij je przed usunięciem.',SOURCE_FOLDER_NOT_READY:'Nie potwierdzono folderów źródła.',
    DESTINATION_NOT_READY:'Nie potwierdzono docelowego folderu.',SOURCE_MISSING:'Nie odnaleziono folderu źródła. Nie można potwierdzić gotowości.',
    SOURCE_INACCESSIBLE:'Brak dostępu do folderu źródła.',SOURCE_MISSING_OR_CHANGED:'Folder źródła został zmieniony lub przeniesiony do kosza.',
    DRIVE_READ_FAILED:'Nie udało się odczytać dokumentów. Sprawdź ponownie.',DRIVE_ENUMERATION_INCOMPLETE:'Odczyt całego drzewa folderów jest niepełny.',
    SOURCE_POPULATED:'Na źródle pozostał dokument lub skrót. Przenieś go ręcznie i sprawdź ponownie.',
    STORED_FOLDER_OUTSIDE_SOURCE:'Folder zapisany przy sprawie znajduje się poza drzewem źródła.',
    FOLDER_IN_USE:'Ten folder jest nadal używany przez zachowane dane.',FOLDER_REFERENCE_CHECK_INCOMPLETE:'Nie potwierdzono wszystkich odwołań do folderu.',
    SHORTCUT_ACTION_UNAVAILABLE:'Przygotowanie skrótu jest teraz niedostępne. Odśwież stan połączenia.',
    SHORTCUT_PREPARATION_FAILED:'PS nie mógł przygotować skrótu. Sprawdź dostęp do folderów na Dysku Google lub ponów przygotowanie tutaj.',
    SHORTCUT_NOT_READY:'Nie potwierdzono wymaganego skrótu do docelowego kamienia.',READ_STATE_CHANGED:'Dane zmieniły się podczas sprawdzania. Sprawdź ponownie.',
    SCHEMA_REFERENCE_MISSING:'Schemat nie pozwala potwierdzić wszystkich powiązań.',UNHANDLED_REFERENCE:'Wykryto nieobsługiwane powiązanie danych.',
    DEPENDENCY_OUTSIDE_READ_SCOPE:'Powiązanie wykracza poza sprawdzany zakres.'};
    return messages[code]||'Nie potwierdzono działania. Sprawdź stan operacji i jej blokady przed dalszą pracą.';}
const uuid = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const revision = (value: unknown) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const positiveId = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2147483647;
function validatePending(value:Pending){
    const body=value?.body,context=value?.context;
    const fail=()=>{throw new Error('Nie można odczytać poprzedniego żądania. Wyjaśnij stan operacji przed dalszą pracą.');};
    if(!value||typeof value!=='object'||!['prepare-targets','apply','finalize','retry'].includes(value.path)||!body||!context||!uuid(body.requestId)||!revision(body.expectedRevision)||!positiveId(context.sourceMilestoneId)||!positiveId(context.destinationMilestoneId)||context.sourceMilestoneId===context.destinationMilestoneId||context.operationId&&!uuid(context.operationId)||!Array.isArray(context.mappings)||context.mappings.length>100)fail();
    if(new Set(context.mappings.map(m=>m.sourceCaseId)).size!==context.mappings.length)fail();
    for(const mapping of context.mappings){if(!positiveId(mapping?.sourceCaseId)||!mapping.target)fail();const t=mapping.target;
        if(t.mode==='existing'){if(Object.keys(t).sort().join(',')!=='caseId,mode'||!positiveId(t.caseId))fail();}
        else if(t.mode==='create'){if(Object.keys(t).sort().join(',')!=='caseTypeId,mode,name,parentSourceCaseId'||!positiveId(t.caseTypeId)||typeof t.name!=='string'||t.parentSourceCaseId!==null&&!positiveId(t.parentSourceCaseId))fail();}else fail();}
    const keys=Object.keys(body).sort().join(',');
    if(value.path==='finalize'||value.path==='retry'){if(!context.operationId||keys!=='checkId,confirmDocumentsMoved,destinationMilestoneId,expectedRevision,requestId'||!uuid(body.checkId)||body.confirmDocumentsMoved!==true||body.destinationMilestoneId!==context.destinationMilestoneId)fail();}
    else if(!uuid(body.previewId)||keys!==(value.path==='apply'?'expectedRevision,previewId,requestId,unitIds':'expectedRevision,previewId,requestId')||value.path==='apply'&&(!Array.isArray(body.unitIds)||!body.unitIds.length||body.unitIds.length>100||body.unitIds.some(u=>!uuid(u))||new Set(body.unitIds).size!==body.unitIds.length))fail();
}
function confirmed(reply: unknown, pending: Pending): boolean {
    if (!reply || typeof reply !== "object" || Array.isArray(reply)) return false;
    const value = reply as Record<string, unknown>;
    if (!revision(value.revision)) return false;
    if(pending.path==='finalize'||pending.path==='retry')return uuid(value.operationId)&&value.operationId===pending.context.operationId&&
        value.requestId===pending.body.requestId&&value.checkId===pending.body.checkId&&value.checkedRevision===pending.body.expectedRevision&&value.destinationMilestoneId===pending.context.destinationMilestoneId&&
        ['FINALIZING','RECONCILIATION_REQUIRED','COMPLETED'].includes(String(value.state))&&typeof value.documentsReady==='boolean'&&typeof value.sourceDatabaseRemoved==='boolean'&&typeof value.sourceFolderTrashed==='boolean'&&
        (value.state==='COMPLETED'?value.documentsReady===true&&value.sourceDatabaseRemoved===true&&value.sourceFolderTrashed===true:value.documentsReady===false&&value.sourceDatabaseRemoved===false);
    if (pending.path === "apply") return uuid(value.operationId) &&
        (!pending.context.operationId || value.operationId.toLowerCase() === pending.context.operationId.toLowerCase()) &&
        positiveId(value.sourceMilestoneId) && positiveId(value.destinationMilestoneId) &&
        value.sourceMilestoneId === pending.context.sourceMilestoneId && value.destinationMilestoneId === pending.context.destinationMilestoneId &&
        positiveId(value.accountingContractId) && value.state === "TRANSFERRING" && value.documentsReady === false;
    if (!uuid(value.preparationId) || !uuid(value.previewId) || value.state !== "PREPARED" || value.transferPerformed !== false || !Array.isArray(value.mappings)) return false;
    const expected = new Map(pending.context.mappings.map(mapping => [mapping.sourceCaseId, mapping.target]));
    if (expected.size !== pending.context.mappings.length || value.mappings.length !== expected.size) return false;
    const seen = new Set<number>();
    return value.mappings.every((mapping: unknown) => {
        if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) return false;
        const row = mapping as Record<string, unknown>, target = row.target as Record<string, unknown> | null;
        if (!positiveId(row.sourceCaseId) || seen.has(row.sourceCaseId) || !expected.has(row.sourceCaseId) ||
            !target || typeof target !== "object" || Array.isArray(target) || target.mode !== "existing" || !positiveId(target.caseId) || Object.keys(target).length !== 2) return false;
        seen.add(row.sourceCaseId);
        const original = expected.get(row.sourceCaseId)!;
        return original.mode === "create" || original.caseId === target.caseId;
    });
}
export class ConsolidationApi {
    constructor(private base: string, private storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
        private key: string, private request: typeof fetch = fetch,private expectedSourceId?:number,private legacyKeys:string[]=[]) {}
    private boundContext(context:PreviewRequest){if(this.expectedSourceId!==undefined&&(!positiveId(this.expectedSourceId)||context.sourceMilestoneId!==this.expectedSourceId))throw new Error('Zachowane żądanie nie należy do tego źródła. Nie wysłano go; wyjaśnij stan operacji przed dalszą pracą.');}
    pending(): Pending | null {
        const raw = this.storage.getItem(this.key);
        if (!raw) {if(this.legacyKeys.some(key=>key!==this.key&&this.storage.getItem(key)!==null))throw new Error('Zachowano wcześniejsze żądanie bez pewnej tożsamości osoby. Nie przeniesiono go ani nie usunięto. Wyjaśnij wynik poprzedniej operacji przed nowym zapisem.');return null;}
        const value = JSON.parse(raw) as Pending;
        validatePending(value);
        this.boundContext(value.context);
        return value;
    }
    async read<T>(path: string, body?: unknown): Promise<T> {
        const response = await this.request(`${this.base.replace(/\/$/, "")}/${path}`, { method: body === undefined ? "GET" : "POST", credentials: "include",
            headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new ConsolidationError(data?.error?.code ?? "REQUEST_FAILED", response.status);
        if (!data) throw new Error("Brak odpowiedzi serwera. Wynik żądania pozostaje niepotwierdzony.");
        return data as T;
    }
    async mutate<T>(pending: Pending): Promise<T> {
        const previous = this.pending();
        if (previous && JSON.stringify(previous) !== JSON.stringify(pending))
            throw new Error("Najpierw ponów zapisane żądanie o niepotwierdzonym wyniku.");
        validatePending(pending);
        this.boundContext(pending.context);
        this.storage.setItem(this.key, JSON.stringify(pending));
        try {
            const path=(pending.path==='finalize'||pending.path==='retry')?`milestone-consolidations/${pending.context.operationId}/${pending.path}`:`milestone-consolidations/${pending.path}`;
            const result = await this.read<T>(path, pending.body);
            if (!confirmed(result, pending))
                throw new Error("Nieprawidłowe potwierdzenie serwera. Zachowano żądanie do ponowienia.");
            this.storage.removeItem(this.key);
            return result;
        } catch (error) {
            // These refusals happen before execution; lost responses and storage/Drive failures keep exact intent.
            if ((pending.path==='apply'||pending.path==='prepare-targets')&&error instanceof ConsolidationError && ["INVALID_REQUEST", "INVALID_MAPPING", "STALE_REVISION", "NAME_CONFLICT", "UNIQUE_TYPE_CONFLICT"].includes(error.code))
                this.storage.removeItem(this.key);
            throw error;
        }
    }
    private validatedStatus(value:Status,expected:{operationId?:string;sourceMilestoneId?:number;destinationMilestoneId?:number}){
        const invalid=()=>{throw new Error('Nie potwierdzono stanu tej operacji. Odśwież dane przed dalszą pracą.');};
        if(!value||!uuid(value.operationId)||!revision(value.revision)||!positiveId(value.sourceMilestoneId)||!positiveId(value.destinationMilestoneId)||value.sourceMilestoneId===value.destinationMilestoneId||!positiveId(value.accountingContractId)||!['TRANSFERRING','FINALIZING','RECONCILIATION_REQUIRED','COMPLETED'].includes(value.state)||typeof value.documentsReady!=='boolean'||value.requiresRevalidation!==true||!value.cleanup||typeof value.cleanup.step!=='string'||typeof value.cleanup.sourceFolderStatus!=='string'||typeof value.cleanup.verificationComplete!=='boolean'||!Array.isArray(value.allowedActions)||new Set(value.allowedActions).size!==value.allowedActions.length||value.allowedActions.some(a=>!['PREVIEW','CHECK','FINALIZE','RETRY'].includes(a))||!Array.isArray(value.caseMappings)||!Array.isArray(value.units)||!value.counts||value.cleanup.reason!==undefined&&typeof value.cleanup.reason!=='string'||value.cleanup.sourceFolderId!==undefined&&value.cleanup.sourceFolderId!==null&&(typeof value.cleanup.sourceFolderId!=='string'||!/^[A-Za-z0-9_-]+$/.test(value.cleanup.sourceFolderId)))invalid();
        if(expected.operationId&&value.operationId!==expected.operationId||expected.sourceMilestoneId&&value.sourceMilestoneId!==expected.sourceMilestoneId||expected.destinationMilestoneId&&value.destinationMilestoneId!==expected.destinationMilestoneId)invalid();
        if(!Number.isSafeInteger(value.counts.moved)||value.counts.moved<0||!Number.isSafeInteger(value.counts.pending)||value.counts.pending<0||value.counts.moved+value.counts.pending!==value.units.length||value.units.some(u=>!uuid(u.unitId)||typeof u.unitKey!=='string'||typeof u.moved!=='boolean'||u.state!==(u.moved?'MOVED':'PENDING'))||new Set(value.units.map(u=>u.unitId)).size!==value.units.length||value.units.filter(u=>u.moved).length!==value.counts.moved)invalid();
        if(value.caseMappings.some(m=>!positiveId(m?.sourceCaseId)||!positiveId(m.destinationCaseId))||new Set(value.caseMappings.map(m=>m.sourceCaseId)).size!==value.caseMappings.length)invalid();
        if(value.state==='COMPLETED'?(value.documentsReady!==true||value.counts.pending!==0||value.sourceDatabaseRemoved!==true||value.sourceFolderTrashed!==true||!value.cleanup.verificationComplete):(value.sourceDatabaseRemoved===true||value.sourceFolderTrashed!==undefined&&typeof value.sourceFolderTrashed!=='boolean'||value.documentsReady&&value.state!=='TRANSFERRING'))invalid();
        if(value.counts.pending>0&&value.allowedActions.includes('FINALIZE')||value.state==='COMPLETED'&&value.allowedActions.some(a=>a==='FINALIZE'||a==='RETRY'))invalid();
        return value;
    }
    async active(id:number){
        if(!positiveId(id))throw new Error('Nieprawidłowe źródło.');
        if(this.expectedSourceId!==undefined&&id!==this.expectedSourceId)throw new Error('Nie potwierdzono stanu tego źródła.');
        const reply=await this.read<{operation:Status|null}>(`milestones/${id}/consolidation`);
        if(!reply||typeof reply!=='object'||Object.keys(reply).length!==1||!Object.prototype.hasOwnProperty.call(reply,'operation'))throw new Error('Nie potwierdzono stanu tego źródła.');
        return {operation:reply.operation===null?null:this.validatedStatus(reply.operation,{sourceMilestoneId:id})};
    }
    async status(operationId:string,context?:PreviewRequest){
        if(!uuid(operationId))throw new Error('Nieprawidłowa operacja.');
        if(context)this.boundContext(context);
        return this.validatedStatus(await this.read<Status>(`milestone-consolidations/${operationId}`),{operationId,sourceMilestoneId:context?.sourceMilestoneId??this.expectedSourceId,destinationMilestoneId:context?.destinationMilestoneId});
    }
    async preview(context:PreviewRequest){
        this.boundContext(context);
        const value=await this.read<Preview>('milestone-consolidations/preview',context);
        const invalid=()=>{throw new Error('Nie potwierdzono podglądu dla wybranego źródła i celu. Pobierz go ponownie.');};
        const finite=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
        const array=(a:unknown):a is any[]=>Array.isArray(a)&&a.length<=10000;
        if(!value||!uuid(value.previewId)||!revision(value.revision)||value.sourceMilestoneId!==context.sourceMilestoneId||value.destinationMilestoneId!==context.destinationMilestoneId||value.operationId!==context.operationId||!positiveId(value.sourceContractId)||!positiveId(value.accountingContractId)||!value.cases||!array(value.cases.source)||!array(value.cases.destination)||!array(value.mappings)||!array(value.units)||!array(value.movedUnits)||!array(value.conflicts)||!array(value.folderPairs)||!array(value.numbers)||!value.milestoneFolderPair)invalid();
        const all=new Set<number>();
        for(const [cards,milestoneId]of [[value.cases.source,context.sourceMilestoneId],[value.cases.destination,context.destinationMilestoneId]] as const){
            const own=new Set(cards.map(c=>c.id));
            for(const c of cards){if(!positiveId(c?.id)||all.has(c.id)||c.milestoneId!==milestoneId||!positiveId(c.typeId)||typeof c.typeName!=='string'||typeof c.name!=='string'||typeof c.isUniquePerMilestone!=='boolean'||c.parentCaseId!==null&&(!positiveId(c.parentCaseId)||!own.has(c.parentCaseId))||c.folderId!==null&&typeof c.folderId!=='string'||!finite(c.taskCount)||!finite(c.relationCount))invalid();all.add(c.id);}
        }
        const sources=new Set(value.cases.source.map(c=>c.id)),destinations=new Set(value.cases.destination.map(c=>c.id)),seen=new Set<number>();
        for(const m of value.mappings){
            if(!positiveId(m?.sourceCaseId)||!sources.has(m.sourceCaseId)||seen.has(m.sourceCaseId)||!['SELECTED','PROPOSED','BLOCKED'].includes(m.state)||!array(m.candidateCaseIds)||m.candidateCaseIds.some(c=>!positiveId(c)||!destinations.has(c))||!array(m.conflictCodes)||m.conflictCodes.some(c=>typeof c!=='string'))invalid();seen.add(m.sourceCaseId);
            if(m.target?.mode==='existing'){if(Object.keys(m.target).sort().join(',')!=='caseId,mode'||!positiveId(m.target.caseId)||!destinations.has(m.target.caseId))invalid();}
            else if(m.target?.mode==='create'){if(Object.keys(m.target).sort().join(',')!=='caseTypeId,mode,name,parentSourceCaseId'||!positiveId(m.target.caseTypeId)||typeof m.target.name!=='string'||m.target.parentSourceCaseId!==null&&(!positiveId(m.target.parentSourceCaseId)||!sources.has(m.target.parentSourceCaseId)))invalid();}
            else if(m.target!==null)invalid();
            const requested=context.mappings.find(r=>r.sourceCaseId===m.sourceCaseId);
            if(requested&&m.state!=='BLOCKED'&&(!m.target||m.target.mode!==requested.target.mode||m.target.mode==='existing'&&requested.target.mode==='existing'&&m.target.caseId!==requested.target.caseId||m.target.mode==='create'&&requested.target.mode==='create'&&(m.target.caseTypeId!==requested.target.caseTypeId||m.target.name!==requested.target.name||m.target.parentSourceCaseId!==requested.target.parentSourceCaseId)))invalid();
        }
        if(seen.size!==sources.size||context.mappings.some(m=>!seen.has(m.sourceCaseId)))invalid();
        const unitIds=new Set<string>(),grouped=new Set<number>();
        for(const u of value.units){if(!uuid(u?.unitId)||unitIds.has(u.unitId)||!['ANALYZED','BLOCKED'].includes(u.state)||!array(u.sourceCaseIds)||new Set(u.sourceCaseIds).size!==u.sourceCaseIds.length||u.sourceCaseIds.some(id=>!sources.has(id)||grouped.has(id))||!u.counts||!finite(u.counts.tasks)||!finite(u.counts.relations)||!finite(u.counts.notes))invalid();unitIds.add(u.unitId);for(const id of u.sourceCaseIds)grouped.add(id);}
        for(const u of value.movedUnits){if(!context.operationId||!uuid(u.unitId)||unitIds.has(u.unitId)||u.moved!==true||u.state!=='MOVED'||typeof u.unitKey!=='string')invalid();unitIds.add(u.unitId);}
        if(value.folderPairs.length!==sources.size||new Set(value.folderPairs.map(p=>p.sourceCaseId)).size!==sources.size||value.folderPairs.some(p=>!sources.has(p.sourceCaseId)||typeof p.sourceFolderId!=='string'||p.destinationFolderId!==null&&typeof p.destinationFolderId!=='string'||p.destinationCaseId!==null&&!destinations.has(p.destinationCaseId)))invalid();
        for(const p of value.folderPairs){const source=value.cases.source.find(c=>c.id===p.sourceCaseId)!,mapping=value.mappings.find(m=>m.sourceCaseId===p.sourceCaseId)!;
            const destination=mapping.target?.mode==='existing'?value.cases.destination.find(c=>c.id===(mapping.target as {caseId:number}).caseId):undefined;
            if(p.sourceFolderId!==(source.folderId??'')||p.destinationCaseId!==(destination?.id??null)||p.destinationFolderId!==(destination?.folderId??null))invalid();}
        if(typeof value.milestoneFolderPair.sourceFolderId!=='string'||value.milestoneFolderPair.destinationFolderId!==null&&typeof value.milestoneFolderPair.destinationFolderId!=='string'||value.conflicts.some(c=>!c||typeof c.code!=='string'||typeof c.reference!=='string'||c.sourceCaseId!==null&&!sources.has(c.sourceCaseId))||value.numbers.some(n=>!sources.has(n.sourceCaseId)||n.number!==null&&!finite(n.number)||n.subCaseNumber!==null&&!finite(n.subCaseNumber)||n.name!==null&&typeof n.name!=='string'))invalid();
        return value;
    }
    async prepareShortcut(operationId: string, contractId: number) {
        if (!uuid(operationId) || !positiveId(contractId))
            throw new Error('Nie można ustalić, dla którego kontraktu przygotować skrót.');
        const result = await this.read<{ operationId: string; contractId: number }>(
            `milestone-consolidations/${operationId}/shortcuts/${contractId}/prepare`, {});
        if (result.operationId !== operationId || result.contractId !== contractId)
            throw new Error('Nie potwierdzono przygotowania skrótu. Sprawdź gotowość ponownie.');
    }

    async check(operationId:string){
        if(!uuid(operationId))throw new Error('Nieprawidłowa operacja. Odśwież jej stan.');
        const value=await this.read<ReadinessCheck>(`milestone-consolidations/${operationId}/check`,{});
        if(value.operationId!==operationId||!uuid(value.checkId)||!revision(value.revision)||typeof value.ready!=='boolean'||typeof value.sourceFolderId!=='string'||typeof value.destinationFolderId!=='string'||!Array.isArray(value.blockers)||value.blockers.some(b=>!b||typeof b.code!=='string'||typeof b.reference!=='string')||!value.sourceTree||typeof value.sourceTree.complete!=='boolean'||!Array.isArray(value.sourceTree.remaining)||value.sourceTree.remaining.some(r=>!r||typeof r.id!=='string')||value.ready&&(!/^[A-Za-z0-9_-]+$/.test(value.sourceFolderId)||!/^[A-Za-z0-9_-]+$/.test(value.destinationFolderId)||value.sourceFolderId===value.destinationFolderId||!value.sourceTree.complete||value.sourceTree.remaining.length||value.blockers.length))throw new Error('Nie potwierdzono kompletnego sprawdzenia dokumentów.');
        return value;
    }
}
