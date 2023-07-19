'use client'

import { useState } from "react";
import Image from 'next/image'
import { Antibot } from "zkme-antibot-component"
import { Button } from "./ui/button";
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { IconCheck } from "./ui/icons";


const ZkMeLoginButton = (): JSX.Element => {
    const [isZkMeVerified, setIsZkMeVerified] = useLocalStorage('isZkMeVerified', false);
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
                className={'bg-white'}
                disabled={isZkMeVerified ? true : false}
                onClick={() => setIsProofOfFaceOpen(!isProofOfFaceOpen)}
            >
                <Image src="/zkme-dark.svg" alt="zkMe Antibot" width={80} height={50} />
                {isZkMeVerified && <IconCheck className='text-teal-900 w-5 h-5' />}
            </Button>
            <Antibot isOpen={isProofOfFaceOpen} verifySuccess={verifySuccessCallback} />
        </>
    )
}

export default ZkMeLoginButton
