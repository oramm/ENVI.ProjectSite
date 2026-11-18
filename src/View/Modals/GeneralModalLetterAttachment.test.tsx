import React from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {GeneralModal} from "./GeneralModal";
import {useFormContext} from "./FormContext";
import RepositoryReact from "../../React/RepositoryReact";
import ToolsFetch from "../../React/Tools/ToolsFetch";
import {makeOtherLetterValidationSchema} from "../../Letters/LettersList/Modals/LetterValidationSchema";

const cases = [{id:10}];
const savedLetter = {id:99, number:'TEST/2026', _cases:cases, description:'Test załącznika'};

// Use the production modal, incoming-letter validation, serializer, repository and guards.
// Only the field selectors and remote HTTP responses are replaced by test fixtures.
function LetterFields() {
    const {register, reset} = useFormContext();
    React.useEffect(()=>{
        reset({_cases:cases, _contract:{id:20}, _project:{id:30}, _editor:{id:40},
            _entitiesMain:[{id:50}], number:'TEST/2026', description:'Test załącznika',
            status:'Zarejestrowany', isOur:false,
            creationDate:new Date(), registrationDate:new Date()});
    },[reset]);
    return <><input aria-label="Opis pisma" {...register('description')} />
        <input aria-label="Załącznik" type="file" {...register('file')} /></>;
}

function chooseAttachment(file:File) {
    // jsdom has no DataTransfer; preserve the FileList contract used by production validation.
    const files = Object.create(FileList.prototype);
    Object.defineProperties(files,{0:{value:file},length:{value:1}});
    fireEvent.change(screen.getByLabelText('Załącznik'),{target:{files}});
}

function showLetter() {
    const repository = new RepositoryReact({name:'letterAttachment_test', actionRoutes:{
        getRoute:'letters',addNewRoute:'letterReact',editRoute:'letter',deleteRoute:'letter'}});
    const onClose=vi.fn(), onAddNew=vi.fn();
    render(<GeneralModal show title="Nowe pismo przychodzące" isEditing={false}
        repository={repository} onClose={onClose} onAddNew={onAddNew}
        ModalBodyComponent={LetterFields} modalBodyProps={{isEditing:false}}
        makeValidationSchema={makeOtherLetterValidationSchema} />);
    return {repository,onClose,onAddNew};
}

afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();sessionStorage.clear();});

describe('registration of an incoming letter with an attachment',()=>{
    it('submits one multipart letter with the selected case and original PDF, then closes on success',async()=>{
        const requests:{url:string;options?:RequestInit}[]=[];
        const request=vi.fn(async(url:RequestInfo|URL,options?:RequestInit)=>{
            requests.push({url:String(url),options});
            if(String(url).endsWith('/milestone-consolidations/work-targets'))
                return new Response(JSON.stringify({blocked:false}));
            if(String(url).endsWith('/letterReact')) return new Response(JSON.stringify(savedLetter));
            throw new Error('Unexpected request: '+url);
        });
        vi.stubGlobal('fetch',request);
        vi.spyOn(ToolsFetch,'sendClientErrorReport').mockResolvedValue(undefined);
        const {repository,onClose,onAddNew}=showLetter();
        const file=new File(['%PDF-1.4\nattachment regression test'], 'test.pdf',{type:'application/pdf'});
        chooseAttachment(file);
        const submit=screen.getByRole('button',{name:/Zatwierdź/});
        await waitFor(()=>expect(submit).toBeEnabled());
        fireEvent.click(submit);
        await waitFor(()=>expect(onClose).toHaveBeenCalledTimes(1));
        const writes=requests.filter(r=>r.url.endsWith('/letterReact'));
        expect(writes).toHaveLength(1);
        expect(writes[0].options).toMatchObject({method:'POST',credentials:'include'});
        const body=writes[0].options!.body as FormData;
        expect(body).toBeInstanceOf(FormData);
        expect(JSON.parse(body.get('_cases') as string)).toEqual(cases);
        expect(body.get('file')).toBe(file);
        expect(body.getAll('file')).toHaveLength(1);
        expect(body.get('description')).toBe(savedLetter.description);
        expect(body.get('_contextData')).toBe('undefined'); // Real no-context multipart path.
        expect(writes[0].options!.headers).toBeUndefined(); // Browser supplies multipart boundary.
        expect(requests.filter(r=>r.url.endsWith('/work-targets')).length).toBeGreaterThanOrEqual(2);
        expect(onAddNew).toHaveBeenCalledWith(savedLetter);
        expect(repository.items).toEqual([savedLetter]);
        expect(ToolsFetch.sendClientErrorReport).not.toHaveBeenCalled();
    });

    it('checks again on submit and blocks a newly consolidating case without uploading the attachment',async()=>{
        let checks=0;
        const request=vi.fn(async(url:RequestInfo|URL)=>{
            if(!String(url).endsWith('/milestone-consolidations/work-targets')) throw new Error('Unexpected upload');
            return new Response(JSON.stringify({blocked:++checks>1}));
        });
        vi.stubGlobal('fetch',request);
        vi.spyOn(ToolsFetch,'sendClientErrorReport').mockResolvedValue(undefined);
        const {repository,onClose,onAddNew}=showLetter();
        chooseAttachment(new File(['%PDF-1.4'], 'test.pdf',{type:'application/pdf'}));
        const submit=screen.getByRole('button',{name:/Zatwierdź/});
        await waitFor(()=>expect(submit).toBeEnabled());
        fireEvent.click(submit);
        await screen.findByText(/Zarejestruj pismo w sprawie docelowej/);
        expect(checks).toBe(2);
        expect(onClose).not.toHaveBeenCalled();
        expect(onAddNew).not.toHaveBeenCalled();
        expect(repository.items).toEqual([]);
        expect(screen.getByLabelText('Opis pisma')).toHaveValue('Test załącznika');
        expect((screen.getByLabelText('Załącznik') as HTMLInputElement).files![0].name).toBe('test.pdf');
    });
});
