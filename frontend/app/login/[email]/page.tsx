'use client'
import { Button } from '@/components/ui/button'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { useRouter } from 'next/navigation'

const TwoFactor = ({ params }: { params: Promise<{ email: string }> }) => {

    const [value, setValue] = React.useState("");
    const { email } = React.use(params);
    const [loading , setLoading] = useState(false);
    const router = useRouter()
    

    useEffect(()=>{
        
    },[]);
    
    const verifyOTP = async () => {
       
            setLoading(true)
            try {

                const email = localStorage.getItem("email");

                const body = {
                    "email" : email,
                    "otp" : value
                }

                const response = await axios.post('http://localhost:8000/auth/verify-user',body);

                console.log(response.data);

                

                if(response.data.status = 'success'){
                    localStorage.setItem("token" ,response.data.token);
                    localStorage.setItem("name" ,response.data.user.name);
                    localStorage.setItem("user-type" ,response.data.user.userType);
                    router.push(`/dashboard`);
                    
                }
                setLoading(false)

            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        

    }


    
    return (
        < div className='h-screen m-0 w-full flex flex-col justify-center items-center bg-[#FBF9F3]'>

            <div className="w-3/12 bg-white shadow-md px-5 py-10 rounded-2xl border">
                <div className='flex flex-row items-center justify-center '>
                    <h1>OTP Verification  </h1>
                     
                </div>
                <div className='flex flex-row items-center justify-center text-[10px] mt-2 text-center '>
                    <h1>We have sent your verification code to the email address linked to this account</h1>
                </div>
            
                <div className="flex flex-row justify-center mt-5">
                <InputOTP onChange={(value) => setValue(value)} maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
                    <InputOTPGroup >
                        <InputOTPSlot className="w-12 h-12 text-lg" index={0} />
                        <InputOTPSlot className="w-12 h-12 text-lg"  index={1} />
                        <InputOTPSlot className="w-12 h-12 text-lg"  index={2} />
                        <InputOTPSlot className="w-12 h-12 text-lg"  index={3} />
                        <InputOTPSlot className="w-12 h-12 text-lg"  index={4} />
                        <InputOTPSlot className="w-12 h-12 text-lg"  index={5} />
                    </InputOTPGroup>
                </InputOTP>
                </div>
 

                <Button onClick={verifyOTP} className='mt-5 w-full cursor-pointer bg-[#193948]'>Verify</Button>
            </div>


        </div>
    )
}

export default TwoFactor