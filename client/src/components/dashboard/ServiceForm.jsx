import { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, Check, X, Users, DollarSign, Box, FileText, Tag, Percent } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utils';

const ServiceForm = ({ serviceToEdit, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        type: 'user',
        resources: [],
        isPublished: true,
        category: '',
        maxBookingsPerSlot: 1,
        manualConfirmation: false,
        advancePayment: false,
        assignmentType: 'auto',
        date: '',
        questions: [],
        pricing: {
            type: 'fixed',
            basePrice: 0,
            ratePerUnit: 0,
            unitDuration: 15
        },
        availability: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', isActive: true },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isActive: true },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isActive: true },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00', isActive: true },
            { day: 'Friday', startTime: '09:00', endTime: '17:00', isActive: true },
            { day: 'Saturday', startTime: '10:00', endTime: '14:00', isActive: false },
            { day: 'Sunday', startTime: '10:00', endTime: '14:00', isActive: false },
        ]
    });

    const [resourceInput, setResourceInput] = useState('');
    const [questionInput, setQuestionInput] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/api/admin/categories`, config);
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories([]);
        }
    };

    useEffect(() => {
        if (serviceToEdit) {
            setFormData({
                ...serviceToEdit,
                category: serviceToEdit.category?._id || serviceToEdit.category || '',
                resources: serviceToEdit.resources || [],
                date: serviceToEdit.date ? new Date(serviceToEdit.date).toISOString().split('T')[0] : '',
                pricing: serviceToEdit.pricing || { type: 'fixed', basePrice: serviceToEdit.price || 0, ratePerUnit: 0, unitDuration: 15 },
                availability: serviceToEdit.availability && serviceToEdit.availability.length > 0
                    ? serviceToEdit.availability
                    : formData.availability
            });
            setResourceInput((serviceToEdit.resources || []).join(', '));
        }
    }, [serviceToEdit]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvailabilityChange = (index, field, value) => {
        const newAvailability = [...formData.availability];
        newAvailability[index][field] = value;
        setFormData(prev => ({ ...prev, availability: newAvailability }));
    };

    const handleAddQuestion = () => {
        if (questionInput.trim()) {
            setFormData(prev => ({ ...prev, questions: [...prev.questions, questionInput.trim()] }));
            setQuestionInput('');
        }
    };

    const handleRemoveQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handlePricingChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            pricing: { ...prev.pricing, [field]: value }
        }));
    };

    // Auto-calculate total price
    useEffect(() => {
        const { type, basePrice, ratePerUnit, unitDuration } = formData.pricing;
        let total = 0;
        const platformFee = 1;

        if (type === 'fixed') {
            total = Number(basePrice) + platformFee;
        } else {
            const duration = Number(formData.duration) || 0;
            const units = duration / (Number(unitDuration) || 15);
            total = Number(basePrice) + (units * Number(ratePerUnit)) + platformFee;
        }

        total = Math.round(total * 100) / 100;

        if (formData.price !== total) {
            setFormData(prev => ({ ...prev, price: total }));
        }
    }, [formData.pricing, formData.duration]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const payload = {
            ...formData,
            resources: resourceInput.split(',').map(s => s.trim()).filter(s => s),
            capacity: formData.maxBookingsPerSlot
        };

        try {
            if (serviceToEdit) {
                await axios.put(`${API_URL}/api/services/${serviceToEdit._id}`, payload, config);
            } else {
                await axios.post(`${API_URL}/api/services`, payload, config);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to save service');
        }
    };

    return (
        <Card className="bg-card/40 backdrop-blur-md border-white/10 p-4 md:p-6 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        {serviceToEdit ? 'Edit Service' : 'Create New Service'}
                    </h2>
                    <Button variant="ghost" onClick={onCancel} size="icon" className="hover:bg-white/10">
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg pb-1 border-b border-white/10 text-foreground flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Basic Information
                        </h3>

                        <div className="space-y-2">
                            <Label>Service Name</Label>
                            <Input 
                                value={formData.name} 
                                onChange={e => handleChange('name', e.target.value)} 
                                required 
                                placeholder="e.g. Haircut, Tennis Court"
                                icon={<Tag className="w-4 h-4" />}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Service Type</Label>
                            <Select value={formData.type} onChange={e => handleChange('type', e.target.value)}>
                                <option value="user">User Service (Provider based)</option>
                                <option value="resource">Resource (Room, Equipment)</option>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Select 'Resource' if you are renting out items like Bats, Balls, or Courts.
                            </p>
                        </div>

                        {formData.type === 'resource' && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                                <Label className="text-blue-400">Included Resources</Label>
                                <Input
                                    value={resourceInput}
                                    onChange={e => setResourceInput(e.target.value)}
                                    placeholder="e.g. Bat, Ball, Tennis Racket"
                                    icon={<Box className="w-4 h-4 text-blue-400" />}
                                />
                                <p className="text-xs text-blue-400/80">
                                    Enter the items included in this service, separated by commas.
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={formData.category} onChange={e => handleChange('category', e.target.value)} required>
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Describe the service..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duration (min)</Label>
                                <Input 
                                    type="number" 
                                    value={formData.duration} 
                                    onChange={e => handleChange('duration', e.target.value)} 
                                    min="5"
                                    icon={<Clock className="w-4 h-4" />}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Bookings/Slot</Label>
                                <Input 
                                    type="number" 
                                    value={formData.maxBookingsPerSlot} 
                                    onChange={e => handleChange('maxBookingsPerSlot', e.target.value)} 
                                    min="1"
                                    icon={<Users className="w-4 h-4" />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Rules */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg pb-1 border-b border-white/10 text-foreground flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Pricing & Rules
                        </h3>

                        <div className="border border-white/10 rounded-xl p-4 bg-white/5 space-y-4">
                            <h4 className="font-medium text-sm text-foreground">Pricing Configuration</h4>

                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={formData.pricing.type} onChange={e => handlePricingChange('type', e.target.value)}>
                                    <option value="fixed">Fixed Price</option>
                                    <option value="dynamic">Time-Based (Dynamic)</option>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Base Fee (₹)</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.pricing.basePrice} 
                                        onChange={e => handlePricingChange('basePrice', e.target.value)} 
                                        min="0"
                                        icon={<DollarSign className="w-4 h-4" />}
                                    />
                                </div>
                                {formData.pricing.type === 'dynamic' && (
                                    <div className="space-y-2">
                                        <Label>Rate per Unit (₹)</Label>
                                        <Input 
                                            type="number" 
                                            value={formData.pricing.ratePerUnit} 
                                            onChange={e => handlePricingChange('ratePerUnit', e.target.value)} 
                                            min="0"
                                            icon={<Percent className="w-4 h-4" />}
                                        />
                                    </div>
                                )}
                            </div>

                            {formData.pricing.type === 'dynamic' && (
                                <div className="space-y-2">
                                    <Label>Billing Unit (mins)</Label>
                                    <Select value={formData.pricing.unitDuration} onChange={e => handlePricingChange('unitDuration', Number(e.target.value))}>
                                        <option value="10">10 Minutes</option>
                                        <option value="15">15 Minutes</option>
                                        <option value="30">30 Minutes</option>
                                        <option value="60">1 Hour</option>
                                    </Select>
                                </div>
                            )}

                            <div className="bg-background/40 p-3 rounded-xl text-sm space-y-1 border border-white/5">
                                <div className="flex justify-between text-white"><span>Base:</span><span>₹{Number(formData.pricing.basePrice).toFixed(2)}</span></div>
                                <div className="flex justify-between text-muted-foreground"><span>Platform Fee:</span><span>₹1.00</span></div>
                                <div className="flex justify-between font-bold border-t border-white/10 pt-1 mt-1 text-primary">
                                    <span>Total Display Price:</span><span>₹{formData.price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl">
                                <Switch
                                    id="published"
                                    checked={formData.isPublished}
                                    onCheckedChange={c => handleChange('isPublished', c)}
                                    className="data-[state=checked]:bg-green-500"
                                />
                                <Label htmlFor="published" className="mb-0 cursor-pointer text-foreground">Publish Service (Public)</Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl">
                                <Switch
                                    id="manual"
                                    checked={formData.manualConfirmation}
                                    onCheckedChange={c => handleChange('manualConfirmation', c)}
                                />
                                <Label htmlFor="manual" className="mb-0 cursor-pointer text-foreground">Requires Manual Confirmation</Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl">
                                <Switch
                                    id="advance"
                                    checked={formData.advancePayment}
                                    onCheckedChange={c => handleChange('advancePayment', c)}
                                />
                                <Label htmlFor="advance" className="mb-0 cursor-pointer text-foreground">Requires Advance Payment</Label>
                            </div>
                        </div>

                        {/* Booking Questions Section */}
                        <div className="border border-white/10 rounded-xl p-4 bg-white/5 space-y-4">
                            <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Custom Booking Questions
                            </h4>
                            
                            <div className="flex gap-2">
                                <Input
                                    value={questionInput}
                                    onChange={e => setQuestionInput(e.target.value)}
                                    placeholder="e.g. Do you have any allergies?"
                                    className="flex-1"
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                                />
                                <Button type="button" onClick={handleAddQuestion} size="sm">Add</Button>
                            </div>

                            {formData.questions.length > 0 && (
                                <div className="space-y-2">
                                    {formData.questions.map((q, i) => (
                                        <div key={i} className="flex justify-between items-center bg-background/50 p-2 rounded-lg border border-white/5 text-sm">
                                            <span className="text-white truncate flex-1">{q}</span>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleRemoveQuestion(i)}
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                These questions will be asked to the customer during booking.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                    <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Availability Schedule
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                        {formData.availability.map((slot, index) => (
                            <div key={slot.day} className="flex items-center gap-4 p-3 border border-white/10 rounded-xl bg-white/5">
                                <div className="w-24 font-medium text-foreground">{slot.day}</div>
                                <Switch
                                    checked={slot.isActive}
                                    onCheckedChange={c => handleAvailabilityChange(index, 'isActive', c)}
                                />
                                {slot.isActive ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input
                                            type="time"
                                            value={slot.startTime}
                                            onChange={e => handleAvailabilityChange(index, 'startTime', e.target.value)}
                                            className="max-w-[130px] h-9"
                                        />
                                        <span className="text-sm text-muted-foreground">to</span>
                                        <Input
                                            type="time"
                                            value={slot.endTime}
                                            onChange={e => handleAvailabilityChange(index, 'endTime', e.target.value)}
                                            className="max-w-[130px] h-9"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground text-sm flex-1 italic">Unavailable</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-4 border-t border-white/10 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 -mx-4 md:-mx-6 -mb-6 rounded-b-lg z-10">
                    <Button variant="ghost" onClick={onCancel} className="hover:bg-white/10 w-full md:w-auto">Cancel</Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">Save Service</Button>
                </div>
            </form>
        </Card>
    );
};

export default ServiceForm;
