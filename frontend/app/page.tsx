'use client'

import Image from "next/image";
import axios from 'axios'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  name: string;
  email: string;
  userType: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};



export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User | null>(null);
  const [users, setUsers] = useState<[] | null>([]);
  const router = useRouter()

  const getMe = async () => {

    setLoading(true)
    try {

      const token = localStorage.getItem("token");
      const response = await axios.get('http://localhost:8000/auth/me', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      console.log(response.data);

      if (response.data.message = 'Token verified successfully') {

        setData(response.data.user)

        if (response.data.user.userType == 'admin') {
          await getUser()
        }

        // localStorage.setItem("token" ,response.data.token);
        // localStorage.setItem("user-type" ,response.data.user.userType);
        console.log(data);

      }
      setLoading(false)

    } catch (error) {
      console.log(error)
      setLoading(false)
    }


  }

  const getUser = async () => {

    setLoading(true)
    try {

      const token = localStorage.getItem("token");
      const response = await axios.get('http://localhost:8000/auth/users');
      console.log(response.data);


      setUsers(response.data)

      // localStorage.setItem("token" ,response.data.token);
      // localStorage.setItem("user-type" ,response.data.user.userType);
      console.log(users);


      setLoading(false)

    } catch (error) {
      console.log(error)
      setLoading(false)
    }


  }

  useEffect(() => {
    getMe()
  }, [data, users]);




  return (
    <div className="flex h-screen w-full flex-col justify-center items-center">
      <div className='flex flex-row items-center font-bold justify-center'>
        <h1>Resort Management System</h1>
      </div>
      <div className='flex mt-2 flex-row items-center justify-center'>
        <h1>Hello 👋 {data?.name}</h1>
      </div>
      <div className='flex mt-2 flex-row items-center justify-center'>
        <h1>{data?.email}</h1>
      </div>
      <div className="h-10  mt-5 bg-black rounded-xl flex flex-row justify-center items-center ">
        <h1 className="text-white uppercase text-sm font-bold px-5">{data?.userType}</h1>
      </div>
      

      {
        users?.map((data, index) => (
          <div>
            
            <div className='flex mt-2 flex-row gap-10 items-center justify-center'>
              <h1>{users[index]['name']} | {users[index]['email']} | {users[index]['userType']} | {users[index]['createdAt']}</h1>
            </div>
          </div>
        ))
      }
      <Button onClick={()=>{router.push("/login")}} className="mt-5" variant='outline'>logout</Button>
    </div>
  );
}
