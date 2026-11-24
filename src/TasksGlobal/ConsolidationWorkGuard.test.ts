import {describe,expect,it,vi} from 'vitest';
import {assertNewWorkAllowed,newWorkTargets} from './ConsolidationWorkGuard';
describe('complete new-work identities',()=>{
    it('checks all letter cases in JSON and multipart payloads',()=>{
        const dto={_cases:[{id:10},{id:20}]},data=new FormData();data.set('_cases',JSON.stringify(dto._cases));
        expect(newWorkTargets('letterReact',dto)).toEqual({milestoneIds:[],caseIds:[10,20]});expect(newWorkTargets('letterReact',data)).toEqual({milestoneIds:[],caseIds:[10,20]});
    });
    it('refuses duplicate multipart identities rather than choosing a different value than the server',()=>{
        const data=new FormData();data.append('_cases','[{"id":10}]');data.append('_cases','[{"id":20}]');expect(()=>newWorkTargets('letterReact',data)).toThrow('Nie można ustalić');
    });
    it.each([['task',{}],['task',{caseId:10,_case:{id:20}}],['case',{_parent:{id:10},milestoneId:20}],['case',{_parent:{id:10},parentCaseId:Infinity}],['letterReact',{}],['letterReact',{_cases:[{id:10},{id:NaN}]}],['letterReact',{_cases:[{id:10},{id:10}]}]])('rejects missing/conflicting identity %s %j',(route,dto)=>expect(()=>newWorkTargets(route,dto)).toThrow());
    it('preserves explicit unassociated letters and unrelated modules',()=>{
        expect(newWorkTargets('letterReact',{_cases:[]})).toBeNull();expect(newWorkTargets('entity',{})).toBeNull();
    });
    it.each([{},null,{blocked:'false'},{blocked:false,hiddenMappings:[]}])('unknown response never authorizes creation %j',async reply=>{
        await expect(assertNewWorkAllowed('task',{_case:{id:10}},'/server/',vi.fn(async()=>new Response(JSON.stringify(reply))))).rejects.toThrow(/Nie udało się sprawdzić|Nie masz dostępu/);
    });
    it('denied and late blocked responses stop a fresh creation attempt',async()=>{
        const call=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({blocked:false}))).mockResolvedValueOnce(new Response(JSON.stringify({blocked:true}))).mockResolvedValueOnce(new Response('{}',{status:403}));
        await expect(assertNewWorkAllowed('task',{_case:{id:10}},'/server/',call)).resolves.toBeUndefined();
        await expect(assertNewWorkAllowed('task',{_case:{id:10}},'/server/',call)).rejects.toThrow('Trwa łączenie');
        await expect(assertNewWorkAllowed('task',{_case:{id:10}},'/server/',call)).rejects.toThrow(/Nie udało się sprawdzić|Nie masz dostępu/);expect(call).toHaveBeenCalledTimes(3);
    });
});

it.each([401,403,404,500])('letter check failure %s has a readable reason and never permits creation',async status=>{
    const call=vi.fn(async()=>new Response('{}',{status}));
    await expect(assertNewWorkAllowed('letterReact',{_cases:[{id:10}]},'/server/',call)).rejects.toThrow(
        status===401?/Sesja wygasła/:status===403?/Nie masz dostępu/:status===404?/nie są już dostępne/:/do wybranej sprawy można dodać pismo/);
});
it('one ordinary letter case uses a JSON array and a current successful response permits registration',async()=>{
    const call=vi.fn(async (_url:RequestInfo | URL, _init?:RequestInit)=>new Response(JSON.stringify({blocked:false})));
    await expect(assertNewWorkAllowed('letterReact',{_cases:[{id:10}]},'/server/',call)).resolves.toBeUndefined();
    expect(JSON.parse(call.mock.calls[0][1]!.body as string)).toEqual({milestoneIds:[],caseIds:[10]});
});
it('a letter into a consolidating case remains blocked with specific guidance',async()=>{
    await expect(assertNewWorkAllowed('letterReact',{_cases:[{id:10}]},'/server/',vi.fn(async()=>new Response(JSON.stringify({blocked:true})))))
        .rejects.toThrow('Zarejestruj pismo w sprawie docelowej.');
});


it.each([
    ['letterReact', {_cases:[{id:10}]}, {milestoneIds:[],caseIds:[10]}],
    ['task', {_case:{id:10}}, {milestoneIds:[],caseIds:[10]}],
    ['case', {_parent:{id:20},_parentCase:{id:10}}, {milestoneIds:[20],caseIds:[10]}],
])('multipart %s checks only its target identities', (route, fields, expected) => {
    const data = new FormData();
    for (const [key,value] of Object.entries(fields)) data.append(key,JSON.stringify(value));
    data.append('_contextData', String(undefined));
    data.append('_contextData', 'unrelated repeated metadata');
    data.append('_template', '');
    data.append('file', new File(['attachment'], 'test.pdf', {type:'application/pdf'}));
    expect(newWorkTargets(route as string,data)).toEqual(expected);
});

it.each(['{', 'undefined', '[{"id":"10"}]'])('still rejects invalid multipart case identities: %s', value => {
    const data = new FormData(); data.append('_cases',value);
    expect(()=>newWorkTargets('letterReact',data)).toThrow('Nie można ustalić');
});
