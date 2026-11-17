import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,waitFor} from '@testing-library/react';
import {useConsolidationWorkGuard} from './useConsolidationWorkGuard';
function View({caseId}:{caseId:number}){const result=useConsolidationWorkGuard('task',{_case:{id:caseId}},true);return <><button disabled={result.blocked}>Dodaj pracę</button><span>{result.message}</span></>;}
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('unknown or denied source state never enables ordinary creation',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:403})));render(<View caseId={10}/>);
    await screen.findByText(/Nie masz dostępu/);expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
});
it('an older negative response cannot unblock a changed currently blocked case',async()=>{
    let firstResolve:(value:Response)=>void=()=>{};const old=new Promise<Response>(resolve=>{firstResolve=resolve});
    const request=vi.fn().mockReturnValueOnce(old).mockResolvedValueOnce(new Response(JSON.stringify({blocked:true})));vi.stubGlobal('fetch',request);
    const view=render(<View caseId={10}/>);expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    view.rerender(<View caseId={20}/>);await screen.findByText(/Trwa łączenie wybranej sprawy/);firstResolve(new Response(JSON.stringify({blocked:false})));
    await waitFor(()=>expect(request).toHaveBeenCalledTimes(2));expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
});

it('an ordinary unblocked case enables creation and clears the warning',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({blocked:false}))));render(<View caseId={10}/>);
    await waitFor(()=>expect(screen.getByRole('button')).toBeEnabled());
    expect(screen.queryByText(/Nie udało się/)).toBeNull();
});

function LetterView({cases}:{cases?:unknown}) {
    const result=useConsolidationWorkGuard('letterReact',{_cases:cases},true);
    return <><button disabled={result.blocked}>Zarejestruj pismo</button><span data-testid="guard-message">{result.message}</span></>;
}
it.each([undefined,null,[]].map(cases=>[cases]))('empty letter selection %j is silent and makes no availability request',cases=>{
    const request=vi.fn();vi.stubGlobal('fetch',request);render(<LetterView cases={cases}/>);
    expect(screen.getByTestId('guard-message')).toBeEmptyDOMElement();
    expect(request).not.toHaveBeenCalled();
});
it('pending letter check is silent but still blocks registration until a successful answer',async()=>{
    let resolve!:(response:Response)=>void;
    vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(done=>{resolve=done;})));
    render(<LetterView cases={[{id:10}]}/>);
    expect(screen.getByTestId('guard-message')).toBeEmptyDOMElement();
    expect(screen.getByRole('button')).toBeDisabled();
    resolve(new Response(JSON.stringify({blocked:false})));
    await waitFor(()=>expect(screen.getByRole('button')).toBeEnabled());
    expect(screen.getByTestId('guard-message')).toBeEmptyDOMElement();
});
it('clearing the selected letter case removes a previous check failure without making another request',async()=>{
    const request=vi.fn(async()=>new Response('{}',{status:500}));vi.stubGlobal('fetch',request);
    const view=render(<LetterView cases={[{id:10}]}/>);
    await screen.findByText(/Nie udało się sprawdzić/);
    view.rerender(<LetterView cases={undefined}/>);
    expect(screen.getByTestId('guard-message')).toBeEmptyDOMElement();
    view.rerender(<LetterView cases={[]}/>);
    expect(screen.getByTestId('guard-message')).toBeEmptyDOMElement();
    expect(request).toHaveBeenCalledTimes(1);
});
it('a malformed nonempty selection remains blocked with an actionable selection error',()=>{
    const request=vi.fn();vi.stubGlobal('fetch',request);render(<LetterView cases={[{id:'10'}]}/>);
    expect(screen.getByText(/Wybrana sprawa jest nieprawidłowa/)).toBeVisible();
    expect(screen.getByRole('button')).toBeDisabled();expect(request).not.toHaveBeenCalled();
});
