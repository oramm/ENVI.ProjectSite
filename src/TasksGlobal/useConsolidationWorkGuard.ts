import { useEffect, useState } from 'react';
import MainSetup from '../React/MainSetupReact';
import { newWorkTargets, checkNewWorkTargets, workCheckFailureMessage } from './ConsolidationWorkGuard';

export function useConsolidationWorkGuard(route:string,data:unknown,enabled:boolean){
    let signature='';try{const targets=enabled?newWorkTargets(route,data):null;signature=targets?JSON.stringify(targets):'';}catch{signature=route==='letterReact'&&(data as {_cases?:unknown}|null)?._cases==null?'awaiting-selection':'invalid';}
    const [attempt,setAttempt]=useState(0);
    const [state,setState]=useState({blocked:false,message:'',canRetry:false});
    const checkKey=route+'|'+signature;
    useEffect(()=>{
        if(!signature){setState({blocked:false,message:'',canRetry:false});return;}
        if(signature==='awaiting-selection'){setState({blocked:true,message:'',canRetry:false});return;}
        if(signature==='invalid'){setState({blocked:true,canRetry:false,message:route==='letterReact'
            ?'Wybrana sprawa jest nieprawidłowa. Wybierz ją ponownie.':'Wybierz prawidłową sprawę lub kamień przed dodaniem danych.'});return;}
        let active=true;setState({blocked:true,message:'',canRetry:false});
        void checkNewWorkTargets(JSON.parse(signature),route,MainSetup.serverUrl)
            .then(result=>{if(active)setState({...result,canRetry:false});})
            .catch(error=>{if(active)setState({blocked:true,canRetry:true,message:error instanceof Error?error.message:workCheckFailureMessage(route)});});
        return ()=>{active=false;};
    },[signature,route,attempt]);
    // Block a changed selection before its effect starts; old responses cannot authorize it.
    const [checked,setChecked]=useState('');
    useEffect(()=>{setChecked(checkKey);},[checkKey]);
    const result=!signature?{blocked:false,message:'',canRetry:false}
        :checkKey!==checked?{blocked:true,message:'',canRetry:false}:state;
    return {...result,retry:()=>setAttempt(value=>value+1)};
}
