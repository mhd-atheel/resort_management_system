'use client'

import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Calendar as CalenderIcon, MoreHorizontal, Phone, Search, Plus, Loader2, Mail, Briefcase, CalendarIcon } from 'lucide-react';
import { CustomDialog } from '@/components/CustomDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDays, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';


interface StaffData {
  _id: string;
  stfID: string;
  name: string;
  email: string;
  contact: string;
  userType: string; 
  workType: string; 
  dateJoined: string;
  isVerified: boolean;
}

interface ApiResponse {
  data: StaffData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const Staffs = () => {
  const [data, setData] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(true);
  const [workTypeSelection, setWorkTypeSelection] = useState("full time");
  const workTypeOptions = ["full time", "part time"];
  const [userTypeSelection, setUserTypeSelection] = useState("receptionist");
  const userTypeOptions = ["admin", "receptionist"];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [openCreateStaff, setOpenCreateStaff] = useState(false);

  const [staffData, setStaffData] = useState({
    stfID: "",
    name: "",
    email: "",
    contact: "",
  });

  const [dateJoined, setDateJoined] = useState<Date | undefined>(
    new Date()
  )
  const handleCheckInSelect = (date: Date | undefined) => {
    if (!date) return

    const nextDay = addDays(date, 1)


    const now = new Date()
    nextDay.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

    setDateJoined(nextDay)


    console.log("Auto-Checkout:", nextDay.toISOString())

  }




  const handleCloseCreateStaff = () => {
    setOpenCreateStaff(false);
  };
  const handleOpenCreateStaff = () => {
    setOpenCreateStaff(true);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get<ApiResponse>('http://localhost:8000/auth/users');
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {


    fetchData();
  }, []);



  const createStaff = async () => {

    const body = {
      name: staffData.name,
      stfID: staffData.stfID,
      email: staffData.email,
      contact: staffData.contact,
      workType: workTypeSelection,
      dateJoined: dateJoined?.toISOString(),
      userType: userTypeSelection
    }

    console.log(body);
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/auth/create-user', body);

      console.log(response.data);
      setOpenCreateStaff(false);
      setLoading(false)
      fetchData()

    } catch (error) {
      console.log(error)
      toast.error("Error an accured")
      setLoading(false)
    }

  }

  const filteredStaff = useMemo(() => {
    return data.filter((staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.stfID.includes(searchTerm) ||
      staff.userType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const getInitials = (name: string) => {
    return name ? name.slice(0, 2).toUpperCase() : "??";
  };

  const capitalize = (s: string) => {
    return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className='flex flex-col w-full min-h-screen gap-6 pb-10'>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="font-bold text-2xl text-slate-800">
          Staff Management
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search by name, ID, role..."
              className="pl-9 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button onClick={() => handleOpenCreateStaff()} className="bg-[#193948] hover:bg-[#193948]/90 text-white gap-2 shadow-sm">
            <Plus size={16} />

            <span className="hidden sm:inline">Add Staff</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-between">

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px] text-slate-500">STF ID</TableHead>
              <TableHead className="w-[250px] text-slate-500">Employee Profile</TableHead>
              <TableHead className="w-[150px] text-slate-500">Role</TableHead>
              <TableHead className="w-[150px] text-slate-500">Date Joined</TableHead>
              <TableHead className="w-[150px] text-slate-500">Contact</TableHead>
              <TableHead className="text-slate-500">Work Type</TableHead>
              <TableHead className="text-right text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin" /> Loading staff...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                  {searchTerm ? "No matching staff found." : "No staff members found."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedStaff.map((staff) => (
                <TableRow key={staff._id} className="hover:bg-slate-50/50 transition-colors">

                  <TableCell className="font-medium">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono border border-slate-200">
                      {staff.stfID}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${staff.name}`} />
                        <AvatarFallback className="bg-slate-100 text-slate-600">
                          {getInitials(staff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">
                          {staff.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Mail size={10} />
                          {staff.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Briefcase size={14} className="text-slate-400" />
                      <span className="text-sm capitalize font-medium">{staff.userType}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <CalendarIcon size={14} className="text-slate-400" />
                      <span>{formatDate(staff.dateJoined)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-sm">{staff.contact}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={`
                      px-3 py-1 rounded-full font-medium shadow-none border-0 text-[11px]
                      ${staff.workType.toLowerCase() === 'full time' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50' : ''}
                      ${staff.workType.toLowerCase() === 'part time' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : ''}
                      ${staff.workType.toLowerCase() === 'contract' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : ''}
                    `}>
                      {capitalize(staff.workType)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600">Remove Staff</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredStaff.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <CustomDialog
        open={openCreateStaff}
        onOpenChange={handleCloseCreateStaff}
        title="Create New Staff"
        description="Fill the following to add a new staff!!!"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCloseCreateStaff}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createStaff()}
              variant="default"
              className="bg-[#3128B7] hover:bg-[#251E99] cursor-pointer text-white font-semibold py-2 px-6 rounded-md"

            >
              {loading ? "wait.." : "Create Staff"}
            </Button>
          </>
        }
      >
        <div className="grid gap-6 p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label

              className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
            >
              Staff Id
            </Label>
            <Input
              id="roomId"
              placeholder='eg STF-01'
              value={staffData.stfID}
              onChange={(e) => setStaffData({ ...staffData, stfID: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"


            />

          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label

              className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
            >
              Name
            </Label>
            <Input
              id="roomId"
              value={staffData.name}
              onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"


            />

          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label

              className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </Label>
            <Input
              id="email"
              value={staffData.email}
              onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"


            />

          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label

              className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
            >
              Staff Type
            </Label>
            <Select value={userTypeSelection} onValueChange={setUserTypeSelection}>
              <SelectTrigger className="w-full p-2 border capitalize border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue className='capitalize' placeholder={userTypeSelection} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
                {userTypeOptions.map((option) => (
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
              Work Type
            </Label>
            <Select value={workTypeSelection} onValueChange={setWorkTypeSelection}>
              <SelectTrigger className="w-full p-2 border capitalize border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue className='capitalize' placeholder={workTypeSelection} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
                {workTypeOptions.map((option) => (
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
          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label
              className="text-left md:text-right font-medium text-gray-700 dark:text-gray-300"
            >
              Date Joined
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!dateJoined}
                  className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                >
                  <CalendarIcon />
                  {dateJoined ? format(dateJoined, "PPP HH:mm") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateJoined}
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
              Contact
            </Label>
            <Input
              id="contact"
              type="text"
              value={staffData.contact}
              onChange={(e) => setStaffData({ ...staffData, contact: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"

            />
          </div>



        </div>
      </CustomDialog>
    </div>
  )
}

export default Staffs