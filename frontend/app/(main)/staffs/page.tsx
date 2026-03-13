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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Calendar as CalenderIcon, MoreHorizontal, Phone, Search, Plus, Loader2, Mail, Briefcase, CalendarIcon, AlertTriangle } from 'lucide-react';
import { CustomDialog } from '@/components/CustomDialog';
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const workTypeOptions = ["full time", "part time"];
  const userTypeOptions = ["admin", "receptionist"];

  //  CREATE STATE 
  const [openCreateStaff, setOpenCreateStaff] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [workTypeSelection, setWorkTypeSelection] = useState("full time");
  const [userTypeSelection, setUserTypeSelection] = useState("receptionist");
  const [dateJoined, setDateJoined] = useState<Date | undefined>(new Date());
  const [staffData, setStaffData] = useState({
    stfID: "",
    name: "",
    email: "",
    contact: "",
  });

  //  EDIT STATE 
  const [openEditStaff, setOpenEditStaff] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);
  const [editWorkType, setEditWorkType] = useState("full time");
  const [editUserType, setEditUserType] = useState("receptionist");
  const [editDateJoined, setEditDateJoined] = useState<Date | undefined>(new Date());
  const [editStaffData, setEditStaffData] = useState({
    stfID: "",
    name: "",
    email: "",
    contact: "",
  });

  //  DELETE STATE 
  const [openDeleteStaff, setOpenDeleteStaff] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCheckInSelect = (date: Date | undefined, isEdit = false) => {
    if (!date) return;
    const nextDay = addDays(date, 1);
    const now = new Date();
    nextDay.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    
    if (isEdit) {
      setEditDateJoined(nextDay);
    } else {
      setDateJoined(nextDay);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get<ApiResponse>('http://localhost:8000/auth/users');
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Failed to fetch staff data");
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

    setIsCreating(true);
    try {
      await axios.post('http://localhost:8000/auth/create-user', body);
      toast.success("Staff member created successfully!");
      setOpenCreateStaff(false);
      // Reset form
      setStaffData({ stfID: "", name: "", email: "", contact: "" });
      fetchData();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred while creating staff");
    } finally {
      setIsCreating(false);
    }
  }

  // 
  const openEditDialog = (staff: StaffData) => {
    setSelectedStaff(staff);
    setEditStaffData({
      stfID: staff.stfID,
      name: staff.name,
      email: staff.email,
      contact: staff.contact,
    });
    setEditWorkType(staff.workType || "full time");
    setEditUserType(staff.userType || "receptionist");
    setEditDateJoined(staff.dateJoined ? new Date(staff.dateJoined) : new Date());
    setOpenEditStaff(true);
  };

  const updateStaff = async () => {
    if (!selectedStaff) return;
    
    const body = {
      name: editStaffData.name,
      stfID: editStaffData.stfID,
      email: editStaffData.email,
      contact: editStaffData.contact,
      workType: editWorkType,
      dateJoined: editDateJoined?.toISOString(),
      userType: editUserType
    };

    setIsUpdating(true);
    try {
      await axios.put(`http://localhost:8000/auth/update-user/${selectedStaff._id}`, body);
      toast.success("Staff details updated successfully!");
      setOpenEditStaff(false);
      fetchData(); // Refresh table data
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error updating staff");
    } finally {
      setIsUpdating(false);
    }
  };

  
  const openDeleteDialog = (staff: StaffData) => {
    setSelectedStaff(staff);
    setOpenDeleteStaff(true);
  };

  const deleteStaff = async () => {
    if (!selectedStaff) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8000/auth/delete-user/${selectedStaff._id}`);
      toast.success("Staff member removed successfully");
      
      // Update UI without full refresh
      setData(prevData => prevData.filter(staff => staff._id !== selectedStaff._id));
      setOpenDeleteStaff(false);
      
      // Handle pagination edge case
      if (paginatedStaff.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to remove staff member");
    } finally {
      setIsDeleting(false);
    }
  };

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
    if (!s) return "";
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
          <Button onClick={() => setOpenCreateStaff(true)} className="bg-[#193948] hover:bg-[#193948]/90 text-white gap-2 shadow-sm">
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
                      ${staff.workType?.toLowerCase() === 'full time' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50' : ''}
                      ${staff.workType?.toLowerCase() === 'part time' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : ''}
                      ${staff.workType?.toLowerCase() === 'contract' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : ''}
                    `}>
                      {capitalize(staff.workType || 'N/A')}
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
                        <DropdownMenuItem onClick={() => openEditDialog(staff)}>
                          Edit Staff Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                          onClick={() => openDeleteDialog(staff)}
                        >
                          Remove Staff
                        </DropdownMenuItem>
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
        onOpenChange={setOpenCreateStaff}
        title="Create New Staff"
        description="Fill the following to add a new staff!!!"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={() => setOpenCreateStaff(false)}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={createStaff}
              disabled={isCreating}
              className="bg-[#3128B7] hover:bg-[#251E99] text-white font-semibold py-2 px-6 rounded-md"
            >
              {isCreating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Create Staff
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Staff Id</Label>
            <Input
              placeholder='eg STF-01'
              value={staffData.stfID}
              onChange={(e) => setStaffData({ ...staffData, stfID: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Name</Label>
            <Input
              value={staffData.name}
              onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Email</Label>
            <Input
              value={staffData.email}
              onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Staff Type</Label>
            <Select value={userTypeSelection} onValueChange={setUserTypeSelection}>
              <SelectTrigger className="w-full p-2 border capitalize border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent">
                <SelectValue className='capitalize' placeholder={userTypeSelection} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                {userTypeOptions.map((option) => (
                  <SelectItem key={option} value={option} className="px-4 capitalize py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Work Type</Label>
            <Select value={workTypeSelection} onValueChange={setWorkTypeSelection}>
              <SelectTrigger className="w-full p-2 border capitalize border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent">
                <SelectValue className='capitalize' placeholder={workTypeSelection} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                {workTypeOptions.map((option) => (
                  <SelectItem key={option} value={option} className="px-4 capitalize py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Date Joined</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal border-gray-300">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateJoined ? format(dateJoined, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateJoined} onSelect={(date) => handleCheckInSelect(date, false)} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Contact</Label>
            <Input
              type="text"
              value={staffData.contact}
              onChange={(e) => setStaffData({ ...staffData, contact: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent"
            />
          </div>
        </div>
      </CustomDialog>

      
      <CustomDialog
        open={openEditStaff}
        onOpenChange={setOpenEditStaff}
        title="Edit Staff Details"
        description="Update the staff member's information below."
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={() => setOpenEditStaff(false)}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={updateStaff}
              disabled={isUpdating}
              className="bg-[#3128B7] hover:bg-[#251E99] text-white font-semibold py-2 px-6 rounded-md"
            >
              {isUpdating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Staff Id</Label>
            <Input
              value={editStaffData.stfID}
              onChange={(e) => setEditStaffData({ ...editStaffData, stfID: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Name</Label>
            <Input
              value={editStaffData.name}
              onChange={(e) => setEditStaffData({ ...editStaffData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Email</Label>
            <Input
              value={editStaffData.email}
              onChange={(e) => setEditStaffData({ ...editStaffData, email: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Staff Type</Label>
            <Select value={editUserType} onValueChange={setEditUserType}>
              <SelectTrigger className="w-full p-2 border capitalize border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent">
                <SelectValue className='capitalize' placeholder={editUserType} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                {userTypeOptions.map((option) => (
                  <SelectItem key={option} value={option} className="px-4 capitalize py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Work Type</Label>
            <Select value={editWorkType} onValueChange={setEditWorkType}>
              <SelectTrigger className="w-full p-2 border capitalize border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent">
                <SelectValue className='capitalize' placeholder={editWorkType} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                {workTypeOptions.map((option) => (
                  <SelectItem key={option} value={option} className="px-4 capitalize py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Date Joined</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal border-gray-300">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editDateJoined ? format(editDateJoined, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={editDateJoined} onSelect={(date) => handleCheckInSelect(date, true)} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Contact</Label>
            <Input
              type="text"
              value={editStaffData.contact}
              onChange={(e) => setEditStaffData({ ...editStaffData, contact: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3128B7] focus:border-transparent"
            />
          </div>
        </div>
      </CustomDialog>

      
      <CustomDialog
        open={openDeleteStaff}
        onOpenChange={setOpenDeleteStaff}
        title="Remove Staff Member"
        description="Are you sure you want to remove this staff member? This action cannot be undone."
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setOpenDeleteStaff(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteStaff} disabled={isDeleting} className="bg-rose-600 hover:bg-rose-700">
              {isDeleting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Confirm Delete
            </Button>
          </div>
        }
      >
        {selectedStaff && (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-md flex gap-3 items-start mt-2">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Warning</p>
              <p>
                Removing <strong>{selectedStaff.name}</strong> will revoke their access to the system immediately.
              </p>
            </div>
          </div>
        )}
      </CustomDialog>

    </div>
  )
}

export default Staffs;