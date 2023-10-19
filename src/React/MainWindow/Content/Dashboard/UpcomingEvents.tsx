import React, { useEffect, useState } from 'react';
import ContractsList from './UpcominigEvents/ContractsList';
import SecuritiesList from './UpcominigEvents/SecuritiesList';

export default function UpcomingEvents() {


    return (
        <>
            <div className='mb-3'>
                <ContractsList />
            </div>
            <div className='mb-3'>
                <SecuritiesList />
            </div>

        </>
    );
}