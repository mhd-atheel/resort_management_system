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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Calendar, MoreHorizontal, Phone, Plus, Search, MapPin, CreditCard, Loader2 } from 'lucide-react';

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
    setCurrentPage(1); // Reset to page 1 when searching
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

      {/* Table Section */}
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600">Cancel Booking</DropdownMenuItem>
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
    </div>
  )
}

export default Customers