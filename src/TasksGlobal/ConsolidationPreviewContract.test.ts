import {expect,it,vi} from 'vitest';
import {ConsolidationApi} from './ConsolidationApi';
import fixture from './ConsolidationPreviewContract.fixture';
it.each(['full','resume','proposed','blockedCreate'])('consumes actual new backend pure-controller %s JSON through the real frontend API validator',async key=>{
    const {request,response}=fixture[key];expect(fixture.kind).toBe('SYNTHETIC_PURE_CONTROLLER_OUTPUT');expect(fixture.realSQL).toBe(false);expect(fixture.realGoogle).toBe(false);
    const fetch=vi.fn(async()=>new Response(JSON.stringify(response))),api=new ConsolidationApi('/server/',{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},'pending',fetch,request.sourceMilestoneId);
    await expect(api.preview(request)).resolves.toEqual(response);
    if(key==='resume'){expect(response.movedUnits.length).toBe(1);expect(response.units.length).toBe(2);expect(response.cases.source.some((c:any)=>c.taskCount===0)).toBe(true);}
});
