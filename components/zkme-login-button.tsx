'use client'

import { useState } from "react";
import Image from 'next/image'
import { Antibot } from "zkme-antibot-component"
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { useLocalStorage } from '@/lib/hooks/use-local-storage';


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
                style={{ display: !isZkMeVerified ? 'flex' : 'none' }}
                className={cn(buttonVariants({ variant: 'outline' }))}
                onClick={() => setIsProofOfFaceOpen(!isProofOfFaceOpen)}
            >
                <Image src="/zkme-dark.svg" alt="zkMe antibot" width={80} height={50} />
            </Button>
            <Antibot isOpen={isProofOfFaceOpen} verifySuccess={verifySuccessCallback} />
        </>
    )
}

export default ZkMeLoginButton
