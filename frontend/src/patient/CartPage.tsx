import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    ArrowLeft,
    CreditCard,
    Truck,
    Shield
} from 'lucide-react';
import { ImageWithFallback } from "../public/figma/ImageWithFallback";
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { medicineService } from '../services/medicineService';
import type { PatientUser } from './PatientPortal';

export function CartPage({ patient, onNavigate }: { patient: PatientUser; onNavigate: (page: any) => void }) {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deliveryAddress, setDeliveryAddress] = useState(patient.address || '');
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await medicineService.getCart();
            setCartItems(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        if (quantity < 1) return;
        try {
            await medicineService.updateCartQuantity(itemId, quantity);
            fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            await medicineService.removeFromCart(itemId);
            fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;
        try {
            setPlacingOrder(true);
            const items = cartItems.map((item: any) => ({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                price: parseFloat(item.medicine.mrp)
            }));
            const subtotal = cartItems.reduce((sum: number, item: any) => sum + (parseFloat(item.medicine?.mrp) || 0) * item.quantity, 0);

            await medicineService.placeOrder({
                order_type: 'medicine',
                items,
                total_amount: subtotal + (subtotal >= 500 ? 0 : 50),
                delivery_address: deliveryAddress
            });

            onNavigate('orders');
        } catch (error) {
            console.error('Error placing order:', error);
        } finally {
            setPlacingOrder(false);
        }
    };

    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (parseFloat(item.medicine?.mrp) || 0) * item.quantity, 0);
    const tax = subtotal * 0.05; // 5% GST
    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const total = subtotal + tax + deliveryCharge;

    if (loading) {
        return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div></div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => onNavigate('medicine-store')}>
                    <ArrowLeft className="size-5 mr-2" />
                    Back to Store
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">My Shopping Cart</h1>
            </div>

            {cartItems.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-pink-100">
                    <CardContent className="space-y-4">
                        <ShoppingCart className="size-16 text-pink-200 mx-auto" />
                        <h2 className="text-xl font-medium text-gray-900">Your cart is empty</h2>
                        <p className="text-gray-500">Looks like you haven't added any medicines yet.</p>
                        <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => onNavigate('medicine-store')}>
                            Start Shopping
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <Card key={item.id} className="border-pink-50">
                                <CardContent className="p-4 flex gap-4">
                                    <div className="size-20 bg-pink-50 rounded-lg overflow-hidden shrink-0">
                                        <ImageWithFallback
                                            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
                                            alt={item.medicine?.medicine_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold text-gray-900">{item.medicine?.medicine_name}</h3>
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600" onClick={() => handleRemoveItem(item.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">{item.medicine?.manufacturer}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="icon" className="size-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                                    <Minus className="size-3" />
                                                </Button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="size-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                                    <Plus className="size-3" />
                                                </Button>
                                            </div>
                                            <span className="font-semibold">₹{(parseFloat(item.medicine?.mrp) || 0) * item.quantity}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Card className="border-pink-100 bg-pink-50/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Delivery Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                                    <Input
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        placeholder="Enter your full address"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-pink-700">
                                    <Truck className="size-4" />
                                    <span>Estimated delivery within 24-48 hours</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-pink-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (GST 5%)</span>
                                        <span>₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Charges</span>
                                        <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                                            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                        </span>
                                    </div>
                                    {subtotal < 500 && (
                                        <p className="text-[10px] text-pink-600 font-medium italic">
                                            Add ₹{500 - subtotal} more for FREE delivery
                                        </p>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-pink-100 flex justify-between items-center">
                                    <span className="font-bold text-lg">Total Amount</span>
                                    <span className="font-bold text-lg text-pink-600">₹{total}</span>
                                </div>
                                <Button
                                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-6 text-lg font-bold"
                                    onClick={handlePlaceOrder}
                                    disabled={placingOrder}
                                >
                                    {placingOrder ? 'Processing...' : (
                                        <>
                                            <CreditCard className="size-5 mr-2" />
                                            Place Order
                                        </>
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                                    <Shield className="size-3" />
                                    Secure Checkout
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
