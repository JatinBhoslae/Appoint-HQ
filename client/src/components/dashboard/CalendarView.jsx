import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfWeek, addDays, isSameDay, parseISO, startOfDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { API_URL } from '../../config';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const token = JSON.parse(localStorage.getItem('userInfo')).token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            // Fetch all appointments for the provider
            // In a real app, we might filter by date range to optimize
            const res = await axios.get(`${API_URL}/api/appointments/provider`, config);
            setAppointments(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const hours = Array.from({ length: 11 }).map((_, i) => i + 8); // 8 AM to 6 PM

    const getAppointmentsForDay = (day) => {
        return appointments.filter(apt => isSameDay(parseISO(apt.date), day));
    };

    // Helper to position event vertically based on time
    const getEventStyle = (startTime, duration = 30) => {
        const [h, m] = startTime.split(':').map(Number);
        const startMinutes = (h - 8) * 60 + m; // Minutes since 8 AM
        const top = (startMinutes / 60) * 64; // 64px height per hour
        const height = (duration / 60) * 64;
        return { top: `${top}px`, height: `${height}px` };
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6" />
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <span className="text-muted-foreground text-sm pt-1">Week of {format(startDate, 'MMM d')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={goToToday}>Today</Button>
                    <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="border border-border rounded-lg overflow-x-auto bg-card text-card-foreground shadow-sm">
                <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="grid grid-cols-8 border-b border-border">
                        <div className="p-4 border-r border-border text-center font-medium text-muted-foreground bg-muted/30">Time</div>
                        {weekDays.map(day => (
                            <div key={day.toString()} className={`p-4 border-r border-border text-center min-w-[120px] ${isSameDay(day, new Date()) ? 'bg-primary/10' : ''}`}>
                                <div className={`font-bold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>{format(day, 'EEE')}</div>
                                <div className={`text-sm ${isSameDay(day, new Date()) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{format(day, 'd')}</div>
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="relative">
                        {hours.map(hour => (
                            <div key={hour} className="grid grid-cols-8 h-16 border-b border-border">
                                <div className="border-r border-border p-2 text-xs text-muted-foreground text-right bg-muted/30">
                                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                </div>
                                {weekDays.map(day => (
                                    <div key={day.toString()} className={`border-r border-border relative ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''}`}>
                                        {/* Drop zone placeholder could go here */}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Events Overlay */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8">
                            <div className="border-r border-transparent"></div> {/* Spacer for Time Column */}
                            {weekDays.map(day => {
                                const dayAppointments = getAppointmentsForDay(day);
                                return (
                                    <div key={day.toString()} className="border-r border-transparent relative pointer-events-auto">
                                        {dayAppointments.map(apt => {
                                            const style = getEventStyle(apt.startTime, apt.service?.duration || 30);
                                            return (
                                                <div
                                                    key={apt._id}
                                                    className={`absolute left-1 right-1 rounded px-2 py-1 text-xs overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm border-l-4 z-10
                                                ${apt.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/40 border-green-500 text-green-700 dark:text-white' :
                                                            apt.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-white' :
                                                                apt.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 border-red-500 text-red-700 dark:text-white' :
                                                                    'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-500 text-yellow-700 dark:text-white'
                                                        }`}
                                                    style={style}
                                                    onClick={() => setSelectedAppointment(apt)}
                                                >
                                                    <div className="font-bold truncate">{apt.customer?.name}</div>
                                                    <div className="truncate text-[10px]">{apt.startTime} - {apt.service?.name}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Appointment Details</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedAppointment(null)}>
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                <span className="font-semibold text-muted-foreground">Customer:</span>
                                <span className="font-medium">{selectedAppointment.customer?.name}</span>

                                <span className="font-semibold text-muted-foreground">Email:</span>
                                <span className="font-medium">{selectedAppointment.customer?.email}</span>

                                <span className="font-semibold text-muted-foreground">Service:</span>
                                <span className="font-medium">{selectedAppointment.service?.name}</span>

                                <span className="font-semibold text-muted-foreground">Date:</span>
                                <span className="font-medium">{format(parseISO(selectedAppointment.date), 'PPPP')}</span>

                                <span className="font-semibold text-muted-foreground">Time:</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {selectedAppointment.startTime} ({selectedAppointment.service?.duration} min)
                                </span>

                                <span className="font-semibold text-muted-foreground">Status:</span>
                                <span className={`font-bold uppercase inline-flex items-center w-fit px-2 py-0.5 rounded text-xs ${selectedAppointment.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                                        selectedAppointment.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                                            selectedAppointment.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                                                'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                    }`}>
                                    {selectedAppointment.status}
                                </span>
                            </div>

                            {selectedAppointment.status === 'pending' && (
                                <div className="flex gap-4 pt-4 border-t">
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                                        // In a real app, you'd call the update API here and refresh
                                        alert('Use the Overview tab to confirm/decline for now.');
                                        setSelectedAppointment(null);
                                    }}>Go to Overview</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CalendarView;