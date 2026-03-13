'use client'

import { CustomDialog } from '@/components/CustomDialog'
import { RoomBox } from '@/components/RoomBox'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckedState } from '@radix-ui/react-checkbox'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'

interface Room {
  _id: string;
  roomID: string;
  roomType: string;
  amount: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// types.ts (or wherever you keep your types)

export interface UserData {
  _id: string;
  email: string;
  isVerified: boolean;
  // These fields are optional (?) because they might be missing in a "new" user
  name?: string;
  address?: string;
  nic?: string;
  phoneNumber?: string;
  roomID?: string;
}

export interface CheckUserResponse {
  status: string; // "success" or "exist"
  existEmail: UserData;
}


const Rooms = () => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [openCreateRoom, setOpenCreateRoom] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [selection, setSelection] = useState("normal");
  const options = ["normal", "luxury", "ultra"];
  const [checked, setChecked] = useState<CheckedState>(true);
  const [payment, setPayment] = useState("paid");
  const [savedCustomer, setSavedCustomer] = useState(false);
  const [otp, setOtp] = React.useState("");
  const [selectedItem, setSelectedItem] = useState<Room | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [createRoomData, setCreateRoomData] = useState({
    roomID: "",
    amount: "",
  });
  const [customerData, setCustomerData] = useState({
    id: "",
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    nic: "",
    roomID: ""
  });
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date())
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    addDays(new Date(), 1)
  )
  const handleCheckInSelect = (date: Date | undefined) => {
    if (!date) return

    setCheckIn(date)


    const nextDay = addDays(date, 1)


    const now = new Date()
    nextDay.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

    setCheckOut(nextDay)

    console.log("Check-in:", date.toISOString())
    console.log("Auto-Checkout:", nextDay.toISOString())

  }



  const createRoom = async () => {

    const body = {
      roomID: createRoomData.roomID,
      roomType: selection,
      amount: createRoomData.amount,
      isAvailable: checked,
    };

    console.log(body);
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/room/create-room', body);

      console.log(response.data);
      toast.success("Room created succesfully created")
      setLoading(false)
      setOpenCreateRoom(false);
      await getRooms()

    } catch (error) {
      console.log(error)
      toast.error("error while creating room")
      setLoading(false)
    }

  }

  const createBooking = async (roomId: string) => {

    const body = {
      roomID: roomId,
      customerID: customerData.id,
      payment: payment,
      checkIn: checkIn?.toISOString(),
      checkOut: checkOut?.toISOString(),
    };

    console.log(body);
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/booking/create-booking', body);

      console.log(response.data);
      toast.success("Booking succesfully created")
      setLoading(false)
      setOpenCreateRoom(false);
      setOpenBooking(false);
      customerData.id = ""
      customerData.name = ""
      customerData.email = ""
      customerData.phoneNumber = ""
      customerData.address = ""
      customerData.nic = ""
      customerData.roomID = ""
      await getRooms()

    } catch (error) {
      console.log(error)
      toast.error("error while creating room")
      setLoading(false)
    }


  }

  useEffect(() => {
    const storedUserType = localStorage.getItem('user-type');

    setUserType(storedUserType);

  }, []);


  const verifyCustomer = async () => {

    const body = {
      email: customerData.email,
    };

    console.log(body);
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/customer/verify-customer', body);

      console.log(response.data);


      setLoading(false)


    } catch (error) {
      console.log(error)
      toast.error("Error an accured")
      setLoading(false)
    }

  }

  const createCustomer = async (roomId: string) => {

    const body = {
      name: customerData.name,
      email: customerData.email,
      phoneNumber: customerData.phoneNumber,
      address: customerData.address,
      nic: customerData.nic,
      roomID: roomId
    }

    console.log(body);
    setLoading(true)
    try {
      const response = await axios.put('http://localhost:8000/customer/create-customer', body);

      console.log(response.data);
      setSavedCustomer(true);

      setLoading(false)


    } catch (error) {
      console.log(error)
      toast.error("Error an accured")
      setLoading(false)
    }

  }



  const verifyCustomerOTP = async () => {

    const body = {
      email: customerData.email,
      otp: otp
    };

    console.log(body);
    setLoading(true)
    try {
      const response = await axios.post<CheckUserResponse>('http://localhost:8000/customer/verify-customer-otp', body);

      const emailData = response.data.existEmail;

      if (response.data.status === "success" || response.data.status === "exist") {

        const hasProfileData = emailData.address && emailData.name;

        if (hasProfileData) {
          console.log("Full profile found. Auto-filling...");
          setCustomerData((prev) => ({
            ...prev,
            id: emailData._id,
            address: emailData.address || "",
            email: emailData.email || "",
            name: emailData.name || "",
            nic: emailData.nic || "",
            phoneNumber: emailData.phoneNumber || "",
          }));
          toast.success("Welcome back! Your details have been auto-filled.");
        } else {
          console.log("User found, but profile is empty.");

          setCustomerData((prev) => ({
            ...prev,
            email: emailData.email || "",
            id: emailData._id,
            name: "",
            address: "",
            nic: "",
            phoneNumber: ""
          }));
          toast.info("User found! Please complete your registration.");
        }
      }

      setLoading(false);

    } catch (error) {
      console.log(error);
      toast.error("Error occurred");
      setLoading(false);
    }

  }



  const handleCloseCreateRoom = () => {
    setOpenCreateRoom(false);
  };
  const handleOpenCreateRoom = () => {
    setOpenCreateRoom(true);
  };

  const handleCloseBooking = () => {
    setSelectedItem(null);
    setOpenBooking(false);
  };
  const handleOpenBooking = (item: Room) => {
    setSelectedItem(item);
    setOpenBooking(true);
  };

  const getRooms = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<Room[]>('http://localhost:8000/room');
      setRooms(response.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    getRooms()
  }, []);



  const normalRooms = rooms.filter(room => room.roomType.toLowerCase() === 'normal');
  const luxuryRooms = rooms.filter(room => room.roomType.toLowerCase() === 'luxury');
  const ultraLuxuryRooms = rooms.filter(room => room.roomType.toLowerCase().includes('ultra'));

  return (
    <div className='flex flex-col w-full min-h-screen pb-10'>


      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="font-bold text-2xl text-slate-800">
          Rooms {loading && <span className="text-sm font-normal text-gray-500">(Syncing...)</span>}
        </div>



        {userType === 'admin' && (
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button
              onClick={() => handleOpenCreateRoom()}
              className="bg-[#193948] px-2 hover:bg-[#193948]/90 text-white gap-2 shadow-sm">
              <Plus size={16} />
              <span className="hidden sm:inline">Add New Room</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex mt-5">
        <h1 className='text-sm font-semibold'>Normal Rooms ({normalRooms.length})</h1>
      </div>

      <div className="grid grid-cols-4 w-full gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide min-h-[100px]">
        {loading ? <p className="text-sm text-gray-400">Loading...</p> : (
          normalRooms.length > 0 ? (
            normalRooms.map((room) => (
              <RoomBox
                isAvailable={room.isAvailable}
                key={room._id}
                roomNumber={room.roomID}
                roomType="Normal Room"
                onClick={
                  () => handleOpenBooking(room)
                }

              />
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No normal rooms found.</p>
          )
        )}
      </div>

      <div className="flex mt-5">
        <h1 className='text-sm font-semibold'>Luxury Room ({luxuryRooms.length})</h1>
      </div>

      <div className="grid grid-cols-4 w-full gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide min-h-[100px]">
        {luxuryRooms.length > 0 ? (
          luxuryRooms.map((room) => (
            <RoomBox
              key={room._id}
              isAvailable={room.isAvailable}
              roomNumber={room.roomID}
              roomType="Luxury Room"
              backgroundColor='#E76268'
              roomsubColor='#ffffff'
              onClick={
                () => handleOpenBooking(room)
              }
            />
          ))
        ) : (
          !loading && <p className="text-sm text-gray-400 italic">No luxury rooms found.</p>
        )}
      </div>

      <div className="flex mt-5">
        <h1 className='text-sm font-semibold'>Ultra Luxury Rooms ({ultraLuxuryRooms.length})</h1>
      </div>

      <div className="grid grid-cols-4 w-full gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide min-h-[100px]">
        {ultraLuxuryRooms.length > 0 ? (
          ultraLuxuryRooms.map((room) => (
            <RoomBox
              key={room._id}
              isAvailable={room.isAvailable}
              roomNumber={room.roomID}
              roomType="Ultra Luxury"
              backgroundColor='#4FADC0'
              onClick={
                () => handleOpenBooking(room)
              }
            />
          ))
        ) : (
          !loading && <p className="text-sm text-gray-400 italic">No ultra luxury rooms found.</p>
        )}
      </div>

      <CustomDialog
        open={openCreateRoom}
        onOpenChange={handleCloseCreateRoom}
        title="Create New Room"
        description="Fill the following to add a new room"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCloseCreateRoom}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={createRoom}
              variant="default"
              className="bg-[#3128B7] hover:bg-[#251E99] text-white font-semibold py-2 px-6 rounded-md"

            >
              Add Room
            </Button>
          </>
        }
      >
        <div className="grid gap-6 p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label

              className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
            >
              Room ID
            </Label>
            <Input
              id="roomId"
              value={createRoomData.roomID}
              onChange={(e) => setCreateRoomData({ ...createRoomData, roomID: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"


            />

          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label

              className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
            >
              Room Type
            </Label>
            <Select value={selection} onValueChange={setSelection}>
              <SelectTrigger className="w-full p-2 border capitalize border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue className='capitalize' placeholder={selection} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
                {options.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="px-4 capitalize py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label

              className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
            >
              Amount
            </Label>
            <Input
              id="description"
              type="text"
              value={createRoomData.amount}
              onChange={(e) => setCreateRoomData({ ...createRoomData, amount: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"

            />
          </div>
          <div className="flex flex-row gap-3">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            <Label htmlFor="terms">Available</Label>
          </div>


        </div>
      </CustomDialog>

      {selectedItem && (
        <CustomDialog
          open={openBooking}
          onOpenChange={handleCloseBooking}
          title="Create New Booking"
          description="Fill the following to add a booking"
          footer={
            <>
              <Button
                variant="outline"
                onClick={handleCloseBooking}
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              {savedCustomer && (
                <Button
                  variant="outline"
                  onClick={() => setSavedCustomer(false)}
                  className="px-4 py-2 text-sm font-medium bg-gray-300 rounded-md border border-gray-300 text-black dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={() => savedCustomer ? createBooking(selectedItem._id) : createCustomer(selectedItem._id)}
                variant="default"
                className="bg-[#3128B7] hover:bg-[#251E99] text-white font-semibold py-2 px-6 rounded-md"

              >
                {!loading ? savedCustomer ? "Make Booking" : 'Save & Next' : "wait.."}
              </Button>

            </>
          }
        >
          {!savedCustomer ?
            <div className="grid gap-6 p-4">
              <div className="flex  grid-rows-3 w-full gap-5 ">

                <Label
                  className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button onClick={() => verifyCustomer()} variant='outline'>Check</Button>
              </div>
              <div className="flex  grid-rows-3 w-full gap-7 ">
                <Label
                  className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  OTP
                </Label>
                <InputOTP onChange={(value) => setOtp(value)} maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
                  <InputOTPGroup >
                    <InputOTPSlot className="w-12  text-lg" index={0} />
                    <InputOTPSlot className="w-12  text-lg" index={1} />
                    <InputOTPSlot className="w-12  text-lg" index={2} />
                    <InputOTPSlot className="w-12 text-lg" index={3} />
                    <InputOTPSlot className="w-12  text-lg" index={4} />
                    <InputOTPSlot className="w-12  text-lg" index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button onClick={() => verifyCustomerOTP()} variant='outline'>Check</Button>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
                <Label
                  className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  value={customerData.name}
                  placeholder={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
                <Label
                  className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  NIC
                </Label>
                <Input
                  id="roomId"
                  value={customerData.nic}
                  onChange={(e) => setCustomerData({ ...customerData, nic: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
                <Label
                  className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  Phone Number
                </Label>
                <Input
                  id="roomId"
                  value={customerData.phoneNumber}
                  onChange={(e) => setCustomerData({ ...customerData, phoneNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
                <Label
                  className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  Address
                </Label>
                <Textarea
                  id="roomId"
                  value={customerData.address}
                  placeholder="Type your address here."
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>


            </div> :
            <div className="grid gap-6 p-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
                <Label
                  className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  Check-In
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!checkIn}
                      className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {checkIn ? format(checkIn, "PPP HH:mm") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={handleCheckInSelect}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
                <Label
                  className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  Check-Out
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!checkOut}
                      className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {checkOut ? format(checkOut, "PPP HH:mm") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-row gap-3">
                <RadioGroup
                  className='flex flex-row'
                  value={payment}
                  onValueChange={setPayment}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="option-one" />
                    <Label htmlFor="option-one">Paid</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="option-two" />
                    <Label htmlFor="option-two">Pending</Label>
                  </div>
                </RadioGroup>
              </div>

            </div>
          }
        </CustomDialog>
      )}

    </div>
  )
}

export default Rooms