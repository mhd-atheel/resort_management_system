'use client'

import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Calendar, MoreHorizontal, Phone, Search, MapPin, CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { CustomDialog } from '@/components/CustomDialog';

interface RoomDetails {
  roomID: string;
  roomType: string;
  amount: number;
  isAvailable: boolean;
}

interface BookingHistoryItem {
  _id: string;
  checkIn: string;
  checkOut: string;
  payment: string;
  bookingRoomDetails?: RoomDetails;
}

interface CustomerData {
  _id: string;
  name: string;
  email: string;
  nic: string;
  phoneNumber: string;
  address: string;
  currentRoomDetails?: RoomDetails;
  bookingHistory: BookingHistoryItem[];
}

interface ApiResponse {
  data: CustomerData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FlattenedBooking {
  bookingId: string;
  customerId: string; 
  customerName: string;
  customerEmail: string;
  customerAvatarSeed: string;
  nic: string;
  contact: string;
  address: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: string; 
}

const Customers = () => {
  const [rawData, setRawData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<FlattenedBooking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: '',
    email: '',
    nic: '',
    phoneNumber: '',
    address: ''
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<FlattenedBooking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>('http://localhost:8000/customer/get-all-customer');
        setRawData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allBookings = useMemo(() => {
    return rawData.flatMap((customer) => 
      customer.bookingHistory.map((booking) => ({
        bookingId: booking._id,
        customerId: customer._id, 
        customerName: customer.name,
        customerEmail: customer.email,
        customerAvatarSeed: customer.name, 
        nic: customer.nic,
        contact: customer.phoneNumber,
        address: customer.address,
        roomNumber: booking.bookingRoomDetails?.roomID || "N/A",
        roomType: booking.bookingRoomDetails?.roomType || "-",
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.payment
      }))
    );
  }, [rawData]);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((item) => 
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nic.includes(searchTerm) ||
      item.roomNumber.includes(searchTerm) ||
      item.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allBookings, searchTerm]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const openUpdateDialog = (customerRow: FlattenedBooking) => {
    setSelectedCustomer(customerRow);
    setUpdateForm({
      name: customerRow.customerName,
      email: customerRow.customerEmail,
      nic: customerRow.nic,
      phoneNumber: customerRow.contact,
      address: customerRow.address
    });
    setIsUpdateOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
  };

  const submitUpdate = async () => {
    if (!selectedCustomer) return;
    setIsUpdating(true);
    
    try {
      await axios.put(`http://localhost:8000/customer/update-customer-by-id/${selectedCustomer.customerId}`, updateForm);
      
      setRawData(prevData => prevData.map(cust => {
        if (cust._id === selectedCustomer.customerId) {
          return { ...cust, ...updateForm };
        }
        return cust;
      }));

      setIsUpdateOpen(false);
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteDialog = (customerRow: FlattenedBooking) => {
    setCustomerToDelete(customerRow);
    setIsDeleteOpen(true);
  };

  const submitDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);

    try {
      await axios.delete(`http://localhost:8000/customer/delete-customer-by-id/${customerToDelete.customerId}`);
      
      setRawData(prevData => prevData.filter(cust => cust._id !== customerToDelete.customerId));
      
      setIsDeleteOpen(false);
      setCustomerToDelete(null);

      if (paginatedBookings.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const getInitials = (name: string) => {
    return name ? name.slice(0, 2).toUpperCase() : "??";
  };

  return (
    <div className='flex flex-col w-full min-h-screen gap-6 pb-10'>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="font-bold text-2xl text-slate-800">Customers</div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Search name, NIC, Room..." 
              className="pl-9 bg-white border-slate-200" 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-2 border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-between">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[120px] text-slate-500">Room</TableHead>
              <TableHead className="w-[220px] text-slate-500">Customer</TableHead>
              <TableHead className="w-[140px] text-slate-500">NIC</TableHead>
              <TableHead className="w-[140px] text-slate-500">Contact</TableHead>
              <TableHead className="text-slate-500">Address</TableHead>
              <TableHead className="w-[170px] text-slate-500">Check-In / Out</TableHead>
              <TableHead className="w-[50px] text-right text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin" /> Loading data...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedBookings.length === 0 ? (
               <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                  {searchTerm ? "No matching bookings found." : "No bookings found."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((row) => (
                <TableRow key={row.bookingId} className="hover:bg-slate-50/50 transition-colors">
                  
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-slate-800 text-base">Room {row.roomNumber}</span>
                      <span className="text-slate-500 text-xs font-normal capitalize">{row.roomType}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.customerAvatarSeed}`} />
                        <AvatarFallback className="bg-slate-100 text-slate-600">
                          {getInitials(row.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{row.customerName}</span>
                        <span className="text-xs text-slate-400">{row.customerEmail}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <CreditCard size={14} className="text-slate-400" />
                      <span className="text-sm font-mono text-slate-500">{row.nic}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-sm">{row.contact}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600 max-w-[350px]" title={row.address}>
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm truncate cursor-help">{row.address}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-xs font-medium">
                          In: {formatDate(row.checkIn)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-5">
                        <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-xs font-medium">
                          Out: {formatDate(row.checkOut)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className='font-bold'>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openUpdateDialog(row)}>
                          Edit Customer Details
                        </DropdownMenuItem>
                        {/* WIRING UP THE DELETE BUTTON */}
                        <DropdownMenuItem 
                          className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                          onClick={() => openDeleteDialog(row)}
                        >
                          Delete
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
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        title="Update Customer Details"
        description="Make changes to the customer's profile here. Click save when you're done."
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={submitUpdate} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input id="name" name="name" value={updateForm.name} onChange={handleFormChange} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" name="email" value={updateForm.email} onChange={handleFormChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="nic" className="text-sm font-medium">NIC</label>
              <Input id="nic" name="nic" value={updateForm.nic} onChange={handleFormChange} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
              <Input id="phoneNumber" name="phoneNumber" value={updateForm.phoneNumber} onChange={handleFormChange} />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="address" className="text-sm font-medium">Address</label>
            <Input id="address" name="address" value={updateForm.address} onChange={handleFormChange} />
          </div>
        </div>
      </CustomDialog>

      
      <CustomDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Customer"
        description="Are you absolutely sure you want to delete this customer? This action cannot be undone."
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDelete} disabled={isDeleting} className="bg-rose-600 hover:bg-rose-700">
              {isDeleting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Confirm Delete
            </Button>
          </div>
        }
      >
        {customerToDelete && (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-md flex gap-3 items-start mt-2">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Warning</p>
              <p>
                Deleting <strong>{customerToDelete.customerName}</strong> will also remove their booking history and free up Room {customerToDelete.roomNumber}.
              </p>
            </div>
          </div>
        )}
      </CustomDialog>

    </div>
  )
}

export default Customers;