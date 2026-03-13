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
import { Calendar as CalendarIcon, MoreHorizontal, Phone, Search, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

// Added UI Imports for dialogs and forms
import { CustomDialog } from '@/components/CustomDialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CustomerDetails {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  nic: string;
}

interface RoomDetails {
  _id: string;
  roomID: string;
  roomType: string;
  amount: number;
}

interface BookingData {
  _id: string;
  checkIn: string;
  checkOut: string;
  payment: "paid" | "pending" | "failed"; 
  customerDetails: CustomerDetails;
  roomDetails: RoomDetails;
}

interface ApiResponse {
  data: BookingData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const Bookings = () => {
  const [data, setData] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- ACTION STATES ---
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  // Edit State
  const [openEdit, setOpenEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    payment: string;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
  }>({
    payment: 'pending',
    checkIn: new Date(),
    checkOut: new Date()
  });

  // Checkout State
  const [openCheckout, setOpenCheckout] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Cancel/Delete State
  const [openCancel, setOpenCancel] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const response = await axios.get<ApiResponse>('http://localhost:8000/booking/get-all-bookings');
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---

  // EDIT BOOKING
  const handleEditClick = (booking: BookingData) => {
    setSelectedBooking(booking);
    setEditForm({
      payment: booking.payment,
      checkIn: new Date(booking.checkIn),
      checkOut: new Date(booking.checkOut)
    });
    setOpenEdit(true);
  };

  const submitEdit = async () => {
    if (!selectedBooking) return;
    setIsEditing(true);
    
    try {
      await axios.put(`http://localhost:8000/booking/update-booking/${selectedBooking._id}`, {
        payment: editForm.payment,
        checkIn: editForm.checkIn?.toISOString(),
        checkOut: editForm.checkOut?.toISOString(),
      });
      
      toast.success("Booking updated successfully!");
      setOpenEdit(false);
      fetchData(); // Refresh the table
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update booking");
    } finally {
      setIsEditing(false);
    }
  };

  // CHECKOUT (UPDATE STATUS)
  const handleCheckoutClick = (booking: BookingData) => {
    setSelectedBooking(booking);
    setOpenCheckout(true);
  };

  const submitCheckout = async () => {
    if (!selectedBooking) return;
    setIsCheckingOut(true);

    try {
      
      await axios.put(`http://localhost:8000/booking/checkout/${selectedBooking._id}`, {
        payment: "paid"
      });
      
      toast.success("Checkout successful! Room is now available.");
      setOpenCheckout(false);
      
      
      const currentIsoTime = new Date().toISOString();

      setData(prevData => prevData.map(b => 
        b._id === selectedBooking._id 
          ? { ...b, payment: 'paid', checkOut: currentIsoTime } 
          : b
      ));

      fetchData();

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to process checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCancelClick = (booking: BookingData) => {
    setSelectedBooking(booking);
    setOpenCancel(true);
  };

  const submitCancel = async () => {
    if (!selectedBooking) return;
    setIsCanceling(true);

    try {
      await axios.delete(`http://localhost:8000/booking/delete-booking/${selectedBooking._id}`);
      
      toast.success("Booking cancelled and removed.");
      setOpenCancel(false);
      
      
      setData(prevData => prevData.filter(b => b._id !== selectedBooking._id));
      
     
      if (paginatedBookings.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setIsCanceling(false);
    }
  };


  
  const filteredBookings = useMemo(() => {
    return data.filter((booking) => 
      booking.customerDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomDetails?.roomID.includes(searchTerm) ||
      booking.customerDetails?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

 
  const formatDateString = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const getInitials = (name: string) => {
    return name ? name.slice(0, 2).toUpperCase() : "??";
  };

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  return (
    <div className='flex flex-col w-full min-h-screen gap-6 pb-10'>

      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="font-bold text-2xl text-slate-800">
          Bookings
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Search by name, room..." 
              className="pl-9 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-between">
        
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[180px] text-slate-500">Room Details</TableHead>
              <TableHead className="w-[250px] text-slate-500">Customer</TableHead>
              <TableHead className="w-[200px] text-slate-500">Check-In / Out</TableHead>
              <TableHead className="text-slate-500">Contact</TableHead>
              <TableHead className="text-slate-500">Payment</TableHead>
              <TableHead className="text-right text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin" /> Loading bookings...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedBookings.length === 0 ? (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  {searchTerm ? "No matching bookings found." : "No bookings found."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => (
                <TableRow key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                  
                  
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-slate-800 text-base">
                        {booking.roomDetails ? `Room ${booking.roomDetails.roomID}` : "No Room"}
                      </span>
                      <span className="text-slate-500 text-xs font-normal capitalize">
                        {booking.roomDetails?.roomType || "-"}
                      </span>
                    </div>
                  </TableCell>

                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.customerDetails?.name}`} />
                        <AvatarFallback className="bg-slate-100 text-slate-600">
                          {getInitials(booking.customerDetails?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">
                          {booking.customerDetails?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {booking.customerDetails?.email || "No Email"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} className="text-slate-400" />
                        <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-xs font-medium">
                          In: {formatDateString(booking.checkIn)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-5">
                        <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-xs font-medium">
                          Out: {formatDateString(booking.checkOut)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-sm">
                        {booking.customerDetails?.phoneNumber || "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  
                  <TableCell>
                    <Badge className={`
                      px-3 py-1 rounded-full font-medium shadow-none border-0
                      ${booking.payment === 'paid' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}
                      ${booking.payment === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : ''}
                      ${booking.payment === 'failed' ? 'bg-rose-100 text-rose-700 hover:bg-rose-100' : ''}
                    `}>
                      {capitalize(booking.payment)}
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
                        
                        <DropdownMenuItem onClick={() => handleEditClick(booking)}>
                          Edit Booking
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleCheckoutClick(booking)}>
                          Checkout & Update Status
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                          onClick={() => handleCancelClick(booking)}
                        >
                          Cancel Booking
                        </DropdownMenuItem>
                        
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        
        {filteredBookings.length > 0 && (
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
        open={openEdit}
        onOpenChange={setOpenEdit}
        title="Edit Booking"
        description="Update dates or payment status for this booking."
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setOpenEdit(false)} disabled={isEditing}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={isEditing} className="bg-[#193948] hover:bg-[#193948]/90 text-white">
              {isEditing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 py-4">
          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Payment Status</Label>
            <Select value={editForm.payment} onValueChange={(val) => setEditForm({...editForm, payment: val})}>
              <SelectTrigger className="w-full p-2 border capitalize border-gray-300 rounded-md">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Check-In</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal border-gray-300">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editForm.checkIn ? format(editForm.checkIn, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent 
                  mode="single" 
                  selected={editForm.checkIn} 
                  onSelect={(date) => setEditForm({...editForm, checkIn: date})} 
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-[1fr_3fr] md:items-center">
            <Label className="text-left md:text-right font-medium text-gray-700">Check-Out</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal border-gray-300">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editForm.checkOut ? format(editForm.checkOut, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent 
                  mode="single" 
                  selected={editForm.checkOut} 
                  onSelect={(date) => setEditForm({...editForm, checkOut: date})} 
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CustomDialog>

      
      <CustomDialog
        open={openCheckout}
        onOpenChange={setOpenCheckout}
        title="Confirm Checkout"
        description="Process checkout and update room availability."
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setOpenCheckout(false)} disabled={isCheckingOut}>
              Cancel
            </Button>
            <Button onClick={submitCheckout} disabled={isCheckingOut} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isCheckingOut ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Confirm Checkout
            </Button>
          </div>
        }
      >
        {selectedBooking && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-md flex gap-3 items-start mt-2">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Process Checkout</p>
              <p>
                This will finalize the stay for <strong>{selectedBooking.customerDetails?.name}</strong>, mark their payment as <strong>Paid</strong>, and make <strong>Room {selectedBooking.roomDetails?.roomID}</strong> available for new guests immediately.
              </p>
            </div>
          </div>
        )}
      </CustomDialog>

      
      <CustomDialog
        open={openCancel}
        onOpenChange={setOpenCancel}
        title="Cancel Booking"
        description="Are you sure you want to completely remove this booking? This action cannot be undone."
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setOpenCancel(false)} disabled={isCanceling}>
              Close
            </Button>
            <Button variant="destructive" onClick={submitCancel} disabled={isCanceling} className="bg-rose-600 hover:bg-rose-700">
              {isCanceling ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Confirm Cancellation
            </Button>
          </div>
        }
      >
        {selectedBooking && (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-md flex gap-3 items-start mt-2">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Warning</p>
              <p>
                Deleting this booking will remove the record completely and free up <strong>Room {selectedBooking.roomDetails?.roomID}</strong>.
              </p>
            </div>
          </div>
        )}
      </CustomDialog>

    </div>
  )
}

export default Bookings;