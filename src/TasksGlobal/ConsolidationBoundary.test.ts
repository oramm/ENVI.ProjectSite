import {describe,expect,it,vi} from 'vitest';
import {ConsolidationApi,Pending} from './ConsolidationApi';
const op='11111111-1111-4111-8111-111111111111',checkId='22222222-2222-4222-8222-222222222222',requestId='33333333-3333-4333-8333-333333333333';
const rev='a'.repeat(64),stored=new Map<string,string>();
function api(reply:unknown){stored.clear();return new ConsolidationApi('/server/',{getItem:k=>stored.get(k)??null,setItem:(k,v)=>{stored.set(k,v)},removeItem:k=>{stored.delete(k)}},'pending',vi.fn(async()=>new Response(JSON.stringify(reply))));}
const intent:Pending={path:'finalize',context:{operationId:op,sourceMilestoneId:1,destinationMilestoneId:2,mappings:[]},body:{requestId,checkId,expectedRevision:rev,confirmDocumentsMoved:true,destinationMilestoneId:2}};
const ack={operationId:op,requestId,checkId,checkedRevision:rev,destinationMilestoneId:2,revision:'b'.repeat(64),state:'FINALIZING',documentsReady:false,sourceFolderTrashed:true,sourceDatabaseRemoved:false};
const status={operationId:op,revision:rev,state:'TRANSFERRING',sourceMilestoneId:1,destinationMilestoneId:2,accountingContractId:20,caseMappings:[{sourceCaseId:10,destinationCaseId:20}],
    counts:{moved:1,pending:0},units:[{unitId:requestId,unitKey:'cases:10',moved:true,state:'MOVED'}],documentsReady:false,requiresRevalidation:true,
    cleanup:{step:'NOT_STARTED',sourceFolderStatus:'UNKNOWN',remainingCount:null,verificationComplete:false},allowedActions:['PREVIEW']};
const previewContext={sourceMilestoneId:1,destinationMilestoneId:2,mappings:[{sourceCaseId:101,target:{mode:'existing' as const,caseId:201}}]};
const card=(id:number,milestoneId:number)=>({id,milestoneId,typeId:9,typeName:'TEST',name:'TEST '+id,parentCaseId:null,isUniquePerMilestone:false,folderId:'folder-'+id,taskCount:2,relationCount:1});
const goodPreview={...previewContext,previewId:requestId,revision:rev,sourceContractId:10,accountingContractId:20,cases:{source:[card(101,1)],destination:[card(201,2)]},
    mappings:[{...previewContext.mappings[0],state:'SELECTED',candidateCaseIds:[201],conflictCodes:[]}],units:[{unitId:checkId,sourceCaseIds:[101],state:'ANALYZED',counts:{tasks:2,relations:1,notes:1}}],movedUnits:[],conflicts:[],numbers:[],
    milestoneFolderPair:{sourceFolderId:'source-root',destinationFolderId:'dest-root'},folderPairs:[{sourceCaseId:101,destinationCaseId:201,sourceFolderId:'folder-101',destinationFolderId:'folder-201'}]};
describe('later steps strict boundary',()=>{
    it('miskeyed persisted intent cannot send or clear another source operation even after a null source lookup',async()=>{
        stored.clear();const foreign={...intent,context:{...intent.context,sourceMilestoneId:99}};stored.set('source-1',JSON.stringify(foreign));
        const request=vi.fn(async()=>new Response(JSON.stringify({operation:null}))),service=new ConsolidationApi('/server/',{getItem:k=>stored.get(k)??null,setItem:(k,v)=>{stored.set(k,v)},removeItem:k=>{stored.delete(k)}},'source-1',request,1);
        await expect(service.active(1)).resolves.toEqual({operation:null});expect(()=>service.pending()).toThrow('nie należy do tego źródła');
        await expect(service.mutate(foreign)).rejects.toThrow('nie należy do tego źródła');expect(request).toHaveBeenCalledTimes(1);expect(stored.get('source-1')).toBe(JSON.stringify(foreign));
        await expect(service.preview(foreign.context)).rejects.toThrow('nie należy do tego źródła');expect(request).toHaveBeenCalledTimes(1);
    });
    it.each([{sourceMilestoneId:999},{destinationMilestoneId:999},{operationId:op},{previewId:'bad'},{revision:'bad'}])('foreign or malformed preview is refused before any mutation %j',async bad=>{
        let mutationCalls=0;const context=previewContext;
        const request=vi.fn(async(input:RequestInfo|URL)=>{const url=String(input);if(url.endsWith('/apply')||url.endsWith('/prepare-targets'))mutationCalls++;return new Response(JSON.stringify({...goodPreview,...bad}));});
        const service=new ConsolidationApi('/server/',{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},'pending',request);
        await expect(service.preview(context)).rejects.toThrow('Nie potwierdzono podglądu');expect(mutationCalls).toBe(0);
    });
    it('a complete preview binds requested target values while preserving harmless JSON key order',async()=>{
        await expect(api(goodPreview).preview(previewContext)).resolves.toEqual(goodPreview);
        await expect(api({...goodPreview,mappings:[{...goodPreview.mappings[0],target:{caseId:201,mode:'existing'}}]}).preview(previewContext)).resolves.toBeTruthy();
        await expect(api({...goodPreview,mappings:[{...goodPreview.mappings[0],target:{mode:'existing',caseId:999}}]}).preview(previewContext)).rejects.toThrow('Nie potwierdzono podglądu');
        await expect(api({...goodPreview,operationId:checkId}).preview({...previewContext,operationId:op})).rejects.toThrow('Nie potwierdzono podglądu');
    });
    it.each([{units:[{...goodPreview.units[0],state:'UNKNOWN'}]},{units:[{...goodPreview.units[0],counts:{tasks:NaN,relations:1,notes:1}}]},
        {folderPairs:[{...goodPreview.folderPairs[0],sourceFolderId:'foreign-folder'}]},{cases:{source:[card(101,999)],destination:[card(201,2)]}}])('malformed group/cards/folder binding cannot become a mutation %j',async bad=>{
        await expect(api({...goodPreview,...bad}).preview(previewContext)).rejects.toThrow('Nie potwierdzono podglądu');expect(stored.size).toBe(0);
    });
    it.each([{sourceMilestoneId:99},{state:'UNKNOWN'},{counts:{moved:NaN,pending:0}},{allowedActions:['DELETE']},{units:[]},{state:'COMPLETED',documentsReady:true}])('source lookup refuses foreign or malformed status %j',async bad=>{
        await expect(api({operation:{...status,...bad}}).active(1)).rejects.toThrow('Nie potwierdzono');
    });
    it('operation read binds operation plus known source and destination before interpretation',async()=>{
        await expect(api(status).status(op,intent.context)).resolves.toEqual(status);
        await expect(api({...status,operationId:checkId}).status(op,intent.context)).rejects.toThrow('Nie potwierdzono');
        await expect(api({...status,destinationMilestoneId:99}).status(op,intent.context)).rejects.toThrow('Nie potwierdzono');
    });
    it('a finalizing ack cannot claim SQL source removal without a proved final commit',async()=>{
        const service=api({...ack,sourceDatabaseRemoved:true,sourceFolderTrashed:false});await expect(service.mutate(intent)).rejects.toThrow('Nieprawidłowe potwierdzenie');expect(service.pending()).toEqual(intent);
    });
    it.each([{operationId:checkId},{requestId:op},{checkId:op},{checkedRevision:'c'.repeat(64)},{destinationMilestoneId:999},{state:'COMPLETED'},{sourceDatabaseRemoved:'true'}])('retains exact finalize intent after malformed or foreign success %j',async bad=>{
        const service=api({...ack,...bad});await expect(service.mutate(intent)).rejects.toThrow('Nieprawidłowe potwierdzenie');expect(service.pending()).toEqual(intent);
    });
    it('retains exact retry intent and only accepts proved server completion',async()=>{
        const service=api({...ack,state:'COMPLETED',documentsReady:true,sourceDatabaseRemoved:true});const retry={...intent,path:'retry' as const};
        await expect(service.mutate(retry)).resolves.toMatchObject({state:'COMPLETED'});expect(service.pending()).toBeNull();
    });
    it('shows blocked missing-folder check instead of hiding its blocker',async()=>{
        const reply={operationId:op,checkId,revision:rev,ready:false,sourceFolderId:'',destinationFolderId:'',blockers:[{code:'FOLDER_NOT_READY',reference:'source'}],sourceTree:{complete:false,remaining:[]}};
        await expect(api(reply).check(op)).resolves.toEqual(reply);await expect(api({...reply,ready:true}).check(op)).rejects.toThrow('Nie potwierdzono');
    });
    it.each([{operationId:checkId},{checkId:'bad'},{revision:'bad'},{sourceTree:{complete:'true',remaining:[]}}])('rejects foreign/incomplete check %j',async bad=>{
        const reply={operationId:op,checkId,revision:rev,ready:true,sourceFolderId:'source',destinationFolderId:'dest',blockers:[],sourceTree:{complete:true,remaining:[]},...bad};
        await expect(api(reply).check(op)).rejects.toThrow('Nie potwierdzono');
    });
    it('does not clear a stored intent on malformed persisted IDs',()=>{
        const service=api({});stored.set('pending',JSON.stringify({...intent,body:{...intent.body,checkId:'bad'}}));expect(()=>service.pending()).toThrow('Nie można odczytać');expect(stored.has('pending')).toBe(true);
    });
});
