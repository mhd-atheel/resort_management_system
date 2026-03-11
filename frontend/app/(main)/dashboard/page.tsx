'use client'

import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios';
import { RoomBox } from '@/components/RoomBox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Calendar, MoreHorizontal, Phone, Loader2 } from 'lucide-react';

// --- 1. Interfaces ---

// Updated RoomData based on your latest JSON
interface RoomData {
    _id: string;
    roomID: string;
    roomType: string;
    amount: number;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

interface RecentBooking {
    _id: string;
    checkIn: string;
    checkOut: string;
    payment: string;
    roomID: {
        _id: string;
        roomID: string;
        roomType: string;
        amount: number;
    };
    customerID: {
        _id: string;
        email: string;
        name: string;
        phoneNumber: string;
    };
}

interface DailyStat {
    date: string;
    bookings: number;
    availableRooms: number;
}

interface DashboardStatsResponse {
    recentBookings: RecentBooking[];
    todayStats: {
        date: string;
        bookingsCount: number;
        availableRooms: number;
        totalRooms: number;
    };
    last10DaysStats: DailyStat[];
}

// --- 2. Chart Configs ---

const pieChartConfig = {
    booked: { label: "Booked", color: "#4fc060" },
    available: { label: "Available", color: "#DBDBDB" },
} satisfies ChartConfig

const barChartConfig = {
    bookings: { label: "Booked", color: "#4fc060" },
    availableRooms: { label: "Available", color: "#DBDBDB" },
} satisfies ChartConfig

const Dashboard = () => {
    // State
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Parallel fetching
                const [roomsRes, statsRes] = await Promise.all([
                    axios.get('http://localhost:8000/room/available'),
                    axios.get('http://localhost:8000/dashboard/dashboard-stats')
                ]);

                // Handle Room Response (Arrays directly vs { data: [] })
                // Checks if roomsRes.data is an array, otherwise looks for .data.data
                const roomData = Array.isArray(roomsRes.data) ? roomsRes.data : (roomsRes.data.data || []);
                setRooms(roomData);
                
                setStats(statsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- Prepare Chart Data ---

    const pieChartData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: "booked", value: stats.todayStats.bookingsCount, fill: "#4fc060" },
            { name: "available", value: stats.todayStats.availableRooms, fill: "#DBDBDB" },
        ];
    }, [stats]);

    const barChartData = useMemo(() => {
        if (!stats) return [];
        return stats.last10DaysStats.map(item => ({
            ...item,
            displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
    }, [stats]);

    // Helpers
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-CA');
    };

    const getInitials = (name: string) => {
        return name ? name.slice(0, 2).toUpperCase() : "??";
    };

    const getRoomColors = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('ultra')) return { bg: '#4FADC0', sub: '#FFFFFF' }; // Cyan for Ultra
        if (t.includes('luxury')) return { bg: '#E76268', sub: '#FFFFFF' }; // Red for Luxury
        return { bg: '#FCDC73', sub: '#000000' }; // Yellow for Normal/Standard
    };

    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin" /> Loading Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col w-full min-h-screen gap-6 pb-10'>

            {/* 1. Dynamic Room Boxes */}
            <div>
                <div className="flex font-bold text-2xl text-slate-800">
                    Available Rooms
                </div>
                
                <div className="grid grid-cols-4  w-full gap-4 mt-4 overflow-x-auto pb-4 scrollbar-hide min-h-[140px]">
                    {rooms.length === 0 ? (
                        <div className="text-slate-500 text-sm">No rooms found.</div>
                    ) : (
                        rooms.map((room) => {
                            const colors = getRoomColors(room.roomType);
                            return (
                                <div key={room._id} >
                                    <RoomBox 
                                        roomNumber={room.roomID}
                                        roomType={room.roomType}
                                        isAvailable={room.isAvailable}
                                        backgroundColor={colors.bg}
                                        roomsubColor={colors.sub}
                                        onClick={() => {}}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 2. Recent Bookings Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-800">Recent Bookings</h2>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[180px] text-slate-500">Room Details</TableHead>
                            <TableHead className="text-slate-500">Customer</TableHead>
                            <TableHead className="text-slate-500">Check-In / Out</TableHead>
                            <TableHead className="text-slate-500">Contact</TableHead>
                            <TableHead className="text-slate-500">Payment</TableHead>
                            <TableHead className="text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats?.recentBookings.map((booking) => (
                            <TableRow key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-slate-800 text-base">Room {booking.roomID.roomID}</span>
                                        <span className="text-slate-500 text-xs font-normal capitalize">{booking.roomID.roomType}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-slate-200">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.customerID.name}`} />
                                            <AvatarFallback className="bg-slate-100 text-slate-600">
                                                {getInitials(booking.customerID.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">{booking.customerID.name}</span>
                                            <span className="text-xs text-slate-400">{booking.customerID.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-xs font-medium">In: {formatDate(booking.checkIn)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 ml-5">
                                            <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-xs font-medium">Out: {formatDate(booking.checkOut)}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone size={14} className="text-slate-400" />
                                        <span className="text-sm">{booking.customerID.phoneNumber}</span> 
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`px-3 py-1 rounded-full font-medium shadow-none border-0 ${
                                        booking.payment === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                        booking.payment === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        'bg-rose-100 text-rose-700'
                                    }`}>
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
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-rose-600">Cancel Booking</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* 3. Charts Section */}
            <div className='flex w-full h-auto gap-5 flex-col lg:flex-row'>

                {/* Pie Chart */}
                <Card className="flex flex-col w-full lg:w-1/3 h-[350px]">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Overview of Rooms</CardTitle>
                        <CardDescription>
                            Today ({formatDate(stats?.todayStats.date)})
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-5">
                        <ChartContainer
                            config={pieChartConfig}
                            className="mx-auto aspect-square max-h-[250px]"
                        >
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie 
                                    data={pieChartData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    innerRadius={60} 
                                    strokeWidth={5} 
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Bar Chart */}
                <Card className='flex flex-col w-full lg:w-2/3 h-[350px]'>
                    <CardHeader>
                        <CardTitle>Booking History</CardTitle>
                        <CardDescription>Last 10 Days</CardDescription>
                    </CardHeader>
                    <CardContent className='flex-1 min-h-0 pl-0'>
                        <ChartContainer className='h-full w-full' config={barChartConfig}>
                            <BarChart accessibilityLayer data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="displayDate"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar 
                                    dataKey="bookings" 
                                    stackId="a" 
                                    fill="var(--color-bookings)" 
                                    radius={[0, 0, 4, 4]} 
                                    barSize={32} 
                                />
                                <Bar 
                                    dataKey="availableRooms" 
                                    stackId="a" 
                                    fill="var(--color-availableRooms)" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={32} 
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard