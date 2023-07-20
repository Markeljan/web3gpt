'use client'

import { useState } from "react";
import Image from 'next/image'
import dynamic from 'next/dynamic';
import { Button } from "./ui/button";
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { IconCheck } from "./ui/icons";

// Dynamically import the Antibot component
const Antibot = dynamic(() => import('zkme-antibot-component').then(mod => mod.Antibot), {
    ssr: false
});


const ZkMeLoginButton = (): JSX.Element => {
    const [isZkMeVerified, setIsZkMeVerified] = useLocalStorage('isZkMeVerified', true);
    const [isProofOfFaceOpen, setIsProofOfFaceOpen] = useState(false);

    const verifySuccessCallback = () => {
        setIsZkMeVerified(true)
        if (typeof window !== 'undefined') {
            window.location.reload()
        }
    }

    return (
        <>
            <Button
                className='bg-white'
                disabled={isZkMeVerified ? true : false}
                onClick={() => setIsProofOfFaceOpen(!isProofOfFaceOpen)}
            >
                <Image src="/zkme-dark.svg" alt="zkMe Antibot" width={80} height={50} />
                {isZkMeVerified && <IconCheck className='w-5 h-5 text-teal-900' />}
            </Button>
            <Antibot isOpen={isProofOfFaceOpen} verifySuccess={verifySuccessCallback} />
        </>
    )
}

export default ZkMeLoginButton
