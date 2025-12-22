import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { API_URL } from '../../config';
import { cn } from '../../lib/utils';

const Reports = () => {
    const [appointments, setAppointments] = useState([]);
    const [metrics, setMetrics] = useState({
        total: 0,
        revenue: 0,
        completionRate: 0,
        peakHour: 'N/A'
    });
    const [chartData, setChartData] = useState([]);
    const [statusData, setStatusData] = useState([]);

    const token = JSON.parse(localStorage.getItem('userInfo')).token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/appointments/provider`, config);
            const data = res.data;
            setAppointments(data);
            calculateMetrics(data);
        } catch (error) {
            console.error(error);
        }
    };

    const calculateMetrics = (data) => {
        // 1. Total Appointments
        const total = data.length;

        // 2. Revenue (Assuming confirmed/completed are paid)
        const revenue = data.reduce((sum, apt) => {
            if (['confirmed', 'completed'].includes(apt.status) && apt.service?.price) {
                return sum + apt.service.price;
            }
            return sum;
        }, 0);

        // 3. Completion Rate
        const completed = data.filter(a => a.status === 'completed').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // 4. Peak Hour
        const hourCounts = {};
        data.forEach(apt => {
            if (!apt.startTime) return;
            const hour = apt.startTime.split(':')[0]; // "09:00" -> "09"
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        let peakHour = 'N/A';
        let maxCount = 0;
        Object.entries(hourCounts).forEach(([hour, count]) => {
            if (count > maxCount) {
                maxCount = count;
                peakHour = `${hour}:00`;
            }
        });

        setMetrics({ total, revenue, completionRate, peakHour });

        // 5. Chart Data (Bookings by Day of Week)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = Array(7).fill(0);

        data.forEach(apt => {
            if (!apt.date) return;
            const date = new Date(apt.date);
            const dayIndex = date.getDay();
            dayCounts[dayIndex]++;
        });

        const chart = days.map((day, i) => ({
            name: day,
            bookings: dayCounts[i]
        }));
        setChartData(chart);

        // 6. Status Distribution
        const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
        data.forEach(apt => {
            if (statusCounts[apt.status] !== undefined) {
                statusCounts[apt.status]++;
            }
        });

        setStatusData([
            { name: 'Pending', value: statusCounts.pending, color: '#facc15' }, // yellow-400
            { name: 'Confirmed', value: statusCounts.confirmed, color: '#4ade80' }, // green-400
            { name: 'Completed', value: statusCounts.completed, color: '#60a5fa' }, // blue-400
            { name: 'Cancelled', value: statusCounts.cancelled, color: '#f87171' }, // red-400
        ]);
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Total Appointments', value: metrics.total, sub: 'All time bookings', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Est. Revenue', value: `₹${metrics.revenue}`, sub: 'From confirmed bookings', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Completion Rate', value: `${metrics.completionRate}%`, sub: 'Successfully completed', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Peak Booking Hour', value: metrics.peakHour, sub: 'Most popular time', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                ].map((item, i) => (
                    <Card key={i} className="bg-card/40 backdrop-blur-md border-white/10 hover:border-primary/50 transition-colors">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                    <h3 className="text-2xl font-bold text-foreground mt-1">{item.value}</h3>
                                </div>
                                <div className={cn("p-2 rounded-lg", item.bg)}>
                                    <item.icon className={cn("h-5 w-5", item.color)} />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.sub}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card/40 backdrop-blur-md border-white/10 p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6">Bookings by Day of Week</h3>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={10} md:fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={10} md:fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card containerClassName="bg-card/40 backdrop-blur-md border-white/10" className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6">Booking Status Distribution</h3>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mt-4">
                            {statusData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    {entry.name} ({entry.value})
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
