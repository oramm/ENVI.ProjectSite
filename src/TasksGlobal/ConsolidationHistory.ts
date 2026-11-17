export type HistoryResolution={retired:boolean;sourceCaseId:number|null;sourceMilestoneId:number|null;destinationMilestoneId:number|null;destinationCaseId:number|null;destinationMilestoneName:string|null;destinationCaseName:string|null};
const label=(v:unknown)=>v===null||typeof v==='string'&&v.trim().length>0;
const id=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>0&&n<=2147483647;
export function validateHistory(value:unknown,kind?:'case'|'milestone'):HistoryResolution {
    const r=value as HistoryResolution;
    if(!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).sort().join(',')!=='destinationCaseId,destinationCaseName,destinationMilestoneId,destinationMilestoneName,retired,sourceCaseId,sourceMilestoneId'||typeof r.retired!=='boolean'||!label(r.destinationMilestoneName)||!label(r.destinationCaseName)||r.destinationCaseId===null&&r.destinationCaseName!==null||
        (r.retired?(!id(r.sourceMilestoneId)||!id(r.destinationMilestoneId)||r.sourceMilestoneId===r.destinationMilestoneId||r.destinationCaseId!==null&&!id(r.destinationCaseId)||r.sourceCaseId!==null&&!id(r.sourceCaseId)||kind==='case'&&(!id(r.destinationCaseId)||!id(r.sourceCaseId))||kind==='milestone'&&r.sourceCaseId!==null):
            (r.sourceCaseId!==null||r.sourceMilestoneId!==null||r.destinationMilestoneId!==null||r.destinationCaseId!==null||r.destinationMilestoneName!==null||r.destinationCaseName!==null)))throw new Error('Nie potwierdzono miejsca zachowanych danych. Odśwież widok.');
    return r;
}
export async function readOnlyHistory(kind:'case'|'milestone',sourceId:number,base:string,request:typeof fetch=fetch){
    if(!id(sourceId))throw new Error('Nieprawidłowe historyczne odwołanie.');
    const response=await request(base.replace(/\/$/,'')+'/milestone-consolidations/history-resolution',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id:sourceId})});
    if(!response.ok)throw new Error('Nie potwierdzono dostępu do zachowanych danych.');
    const result=validateHistory(await response.json(),kind);
    if(result.retired&&(kind==='milestone'?result.sourceMilestoneId!==sourceId:result.sourceCaseId!==sourceId||result.destinationCaseId===sourceId))throw new Error('Nie potwierdzono historycznego odwołania.');
    return result;
}
export function historyMessage(r:HistoryResolution){
    const milestone=r.destinationMilestoneName?`kamieniu „${r.destinationMilestoneName}” (ID ${r.destinationMilestoneId})`:`kamieniu (nazwa niedostępna; ID ${r.destinationMilestoneId})`;
    const caseName=r.destinationCaseId?r.destinationCaseName?`, w sprawie „${r.destinationCaseName}” (ID ${r.destinationCaseId})`:`, w sprawie (nazwa niedostępna; ID ${r.destinationCaseId})`:"";
    const unavailable=!r.destinationMilestoneName||r.destinationCaseId!==null&&!r.destinationCaseName?"Nie wszystkie nazwy celu są dostępne. Odśwież dane, aby sprawdzić aktualne oznaczenia. ":"";
    return `Połączenie zostało zakończone. Zachowane dane odczytasz w ${milestone}${caseName}. ${unavailable}Wybierz cel ponownie przed dodaniem nowej pracy; zachowanego wyboru nie zmieniono.`;
}

export async function warnRetiredRead(route:string,criteria:unknown[],base:string,request:typeof fetch=fetch){
    if(!['milestones','cases','tasks'].includes(route))return;
    const targets=new Map<string,{kind:'milestone'|'case';id:number}>();
    for(const value of criteria){if(!value||typeof value!=='object'||Array.isArray(value))continue;const c=value as any;
        const add=(kind:'milestone'|'case',value:unknown)=>{if(value!==undefined){if(!id(value))throw new Error('Nieprawidłowy filtr historycznego odwołania.');targets.set(`${kind}:${value}`,{kind,id:value});}};
        add('milestone',c.milestoneId??c._milestone?.id);add('case',c.caseId??c._case?.id);
        if(route==='milestones')add('milestone',c.id);if(route==='cases')add('case',c.id);
    }
    if(targets.size>100)throw new Error('Zbyt wiele historycznych odwołań.');
    for(const target of targets.values()){const r=await readOnlyHistory(target.kind,target.id,base,request);if(r.retired)throw new Error(historyMessage(r));}
}
