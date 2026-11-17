import {validateHistory,historyMessage} from './ConsolidationHistory';
export type WorkTargets={milestoneIds:number[];caseIds:number[]};
const id=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>0&&n<=2147483647;
const invalid=()=>{throw new Error('Nie można ustalić miejsca nowej pracy. Wybierz sprawę lub kamień ponownie.');};
function unique(values:number[]){return [...new Set(values)];}
function same(values:unknown[]):number|undefined{const defined=values.filter(v=>v!==undefined&&v!==null);if(defined.some(v=>!id(v))||new Set(defined).size>1)invalid();return defined[0] as number|undefined;}
function item(data:unknown):any {
    if(typeof FormData!=='undefined'&&data instanceof FormData){const result:Record<string,unknown>={},seen=new Set<string>();for(const [key,value] of data.entries())if(typeof value==='string'){
        if(key.startsWith('_')||key==='parentCaseId'||key==='caseId'||key==='milestoneId'){if(seen.has(key))invalid();seen.add(key);try{result[key]=JSON.parse(value);}catch{invalid();}}
    }return result;}
    if(!data||typeof data!=='object'||Array.isArray(data))invalid();return data;
}
export function newWorkTargets(route:string,data:unknown):WorkTargets|null{
    if(!['case','task','letterReact'].includes(route))return null;
    const b=item(data);
    if(route==='task'){const caseId=same([b.caseId,b._case?.id,b._parent?.id]);if(!caseId)invalid();return {milestoneIds:[],caseIds:[caseId!]};}
    if(route==='case'){
        const milestoneId=same([b.milestoneId,b._parent?.id,b._parentMilestone?.id]);
        const parentCaseId=same([b.parentCaseId,b._parentCase?.id]);if(!milestoneId)invalid();
        return {milestoneIds:[milestoneId!],caseIds:parentCaseId?[parentCaseId]:[]};
    }
    if(!Array.isArray(b._cases)||b._cases.length>100)invalid();
    if(!b._cases.length)return null; // Explicitly no case associations; existing project/contract policy remains server-owned.
    const caseIds=b._cases.map((c:unknown)=>{if(!c||typeof c!=='object'||!id((c as any).id))invalid();return (c as any).id as number;});
    if(new Set(caseIds).size!==caseIds.length)invalid();return {milestoneIds:[],caseIds:unique(caseIds)};
}
export function workTargetReply(reply:unknown,targets?:WorkTargets,route = 'task'):{blocked:boolean;message:string}{
    const r=reply as {blocked:boolean;redirects?:unknown[]};
    if(!r||typeof r.blocked!=='boolean'||Object.keys(r).sort().join(',')!==(r.redirects?'blocked,redirects':'blocked')||
        r.redirects&&(!r.blocked||!Array.isArray(r.redirects)||!r.redirects.length||r.redirects.length>100))throw new Error('Nie potwierdzono dostępności źródła.');
    const redirects=r.redirects?.map(value=>validateHistory(value));
    if(redirects?.some(v=>!v.retired||targets&&(v.sourceCaseId===null?!targets.milestoneIds.includes(v.sourceMilestoneId!):!targets.caseIds.includes(v.sourceCaseId)||targets.milestoneIds.length>0&&!targets.milestoneIds.includes(v.sourceMilestoneId!))))throw new Error('Nie potwierdzono historycznego miejsca pracy.');
    return {blocked:r.blocked,message:redirects?redirects.map(historyMessage).join(' '):r.blocked?route==='letterReact'?'Trwa łączenie wybranej sprawy z inną. Zarejestruj pismo w sprawie docelowej.':route==='case'?'Trwa łączenie wybranego kamienia z innym. Nową sprawę dodaj w kamieniu docelowym.':'Trwa łączenie wybranej sprawy z inną. Nowe zadanie dodaj w sprawie docelowej.':''};
}
export function workCheckFailureMessage(route:string,status?:number):string {
    if(status===401)return 'Sesja wygasła. Zaloguj się ponownie, aby kontynuować.';
    if(status===403)return 'Nie masz dostępu do wybranej sprawy lub kamienia. Sprawdź wybór lub poproś o dostęp.';
    if(status===404)return 'Wybrana sprawa lub kamień nie są już dostępne. Odśwież listę i wybierz ponownie.';
    return route==='letterReact'
        ? 'Nie udało się sprawdzić, czy do wybranej sprawy można dodać pismo. Spróbuj ponownie.'
        : 'Nie udało się sprawdzić, czy można tu dodać nowe dane. Spróbuj ponownie.';
}
export async function checkNewWorkTargets(targets:WorkTargets,route:string,base:string,request:typeof fetch=fetch){
    const response=await request(base.replace(/\/$/,'')+'/milestone-consolidations/work-targets',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(targets)})
        .catch(()=>{throw new Error(workCheckFailureMessage(route));});
    if(!response.ok)throw new Error(workCheckFailureMessage(route,response.status));
    try{return workTargetReply(await response.json(),targets,route);}
    catch{throw new Error(workCheckFailureMessage(route));}
}
export async function assertNewWorkAllowed(route:string,data:unknown,base:string,request:typeof fetch=fetch){
    const targets=newWorkTargets(route,data);if(!targets)return;
    const result=await checkNewWorkTargets(targets,route,base,request);if(result.blocked)throw new Error(result.message);
}
