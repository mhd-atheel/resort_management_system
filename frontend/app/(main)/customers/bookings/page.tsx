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
import { Calendar, MoreHorizontal, Phone, Search, Loader2, Filter } from 'lucide-react';

// --- Types based on your API Response ---
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
  payment: "paid" | "pending" | "failed"; // API returns lowercase
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

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // REPLACE with your actual booking endpoint
        const response = await axios.get<ApiResponse>('http://localhost:8000/booking/get-all-bookings');
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Filter Logic (Client-side search)
  const filteredBookings = useMemo(() => {
    return data.filter((booking) => 
      booking.customerDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomDetails?.roomID.includes(searchTerm) ||
      booking.customerDetails?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const getInitials = (name: string) => {
    return name ? name.slice(0, 2).toUpperCase() : "??";
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className='flex flex-col w-full min-h-screen gap-6 pb-10'>

      {/* Header & Search */}
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
          <Button variant="outline" className="gap-2 text-slate-600">
            <Filter size={16} /> Filter
          </Button>
        </div>
      </div>

      {/* Table Section */}
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
                  
                  {/* Room Details */}
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

                  {/* Customer Details */}
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

                  {/* Check In/Out */}
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-xs font-medium">
                          In: {formatDate(booking.checkIn)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-5">
                        <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-xs font-medium">
                          Out: {formatDate(booking.checkOut)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-sm">
                        {booking.customerDetails?.phoneNumber || "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Payment Status Badge */}
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

                  {/* Actions */}
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

        {/* Pagination Footer */}
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

export default Bookings