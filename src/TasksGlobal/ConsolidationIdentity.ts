export function stablePersonId(user:{enviId?:number;id?:number}|null|undefined){
    const value=user?.enviId;
    return typeof value==='number'&&Number.isSafeInteger(value)&&value>0&&(user?.id===undefined||user.id===value)?value:undefined;
}
export function consolidationKeys(personId:unknown,sourceId:number,googleId?:string){
    if(typeof personId!=='number'||!Number.isSafeInteger(personId)||personId<=0||!Number.isSafeInteger(sourceId)||sourceId<=0)
        return {key:`milestone-consolidation:unbound:${sourceId}`,legacyKeys:[`milestone-consolidation:${googleId}:${sourceId}`],bound:false};
    return {key:`milestone-consolidation:person:${personId}:${sourceId}`,legacyKeys:[`milestone-consolidation:${googleId}:${sourceId}`,`milestone-consolidation:undefined:${sourceId}`],bound:true};
}
