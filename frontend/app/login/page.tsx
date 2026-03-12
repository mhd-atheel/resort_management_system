'use client'


import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Spinner } from "@/components/ui/spinner"


const Login = () => {
    const router = useRouter()
    const [loading , setLoading] = useState(false);
    

    const [credential, setCredential] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
        {}
    );

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!credential.email) newErrors.email = "Email is required";
        if (!credential.password) newErrors.password = "Password is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const login = async () => {

        if (validateForm()) {
            setLoading(true)
            try {
                const response = await axios.post('http://localhost:8000/auth/login-user', credential);

                console.log(response.data);

                localStorage.setItem("email",credential.email)

                if(response.data = 'success'){
                    router.push(`/login/${credential.email}`);
                }
                setLoading(false)

            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        }

    }


    return (
        <div className='h-screen m-0 w-full flex flex-col justify-center items-center bg-[#FBF9F3]'>

            <div className="w-3.5/12 bg-white shadow-md px-5 py-10 rounded-2xl border">
                <div className='flex flex-row items-center justify-center'>
                    <h1>Resort Management System</h1>
                </div>
                <Input onChange={(e) =>
                    setCredential({ ...credential, email: e.target.value })
                } 
                className= {`mt-5 ${errors.email ? "border-red-500" : "border-input"}`} type="email" placeholder="Email" />

                <Input onChange={(e) =>
                    setCredential({ ...credential, password: e.target.value })
                } className= {`mt-5 ${errors.password ? "border-red-500" : "border-input"}`} type="password" placeholder="Password" />

                <div className='flex mt-2 mr-2 flex-row items-center justify-end'>
                    <h1 className='text-[12px] underline cursor-pointer'>Forgot password</h1>
                </div>

                <Button onClick={login} className='mt-3 w-full cursor-pointer bg-[#193948]'> { loading ?? <Spinner className="size-5" />}  Login</Button>
            </div>

        </div>
    )
}

export default Login