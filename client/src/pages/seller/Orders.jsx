import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';

const Orders = () => {
    const { currency, axios } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaidFilter, setIsPaidFilter] = useState('');
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const printRef = useRef();

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const cancelOrderByAdmin = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const { data } = await axios.put(`/api/order/cancel/seller/${orderId}`);
            if (data.success) {
                toast.success('Order cancelled successfully!');
                fetchOrders();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to cancel order.');
        }
    };

    const markOrderAsDelivered = async (orderId) => {
        if (!window.confirm('Confirm that the order has been delivered?')) return;
        try {
            const { data } = await axios.put(`/api/order/deliver/seller/${orderId}`);
            if (data.success) {
                toast.success('Order marked as delivered!');
                fetchOrders();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to mark order as delivered.');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            order._id.toLowerCase().includes(term) ||
            order.userId.toLowerCase().includes(term) ||
            order.address.firstName.toLowerCase().includes(term) ||
            order.address.lastName.toLowerCase().includes(term) ||
            order.address.city.toLowerCase().includes(term) ||
            order.address.street.toLowerCase().includes(term) ||
            order.address.state.toLowerCase().includes(term) ||
            order.items.some(item => item.product.name.toLowerCase().includes(term));

        const matchesIsPaid = isPaidFilter === '' || order.isPaid.toString() === isPaidFilter;
        const matchesPaymentType = paymentTypeFilter === '' || order.paymentType === paymentTypeFilter;
        const matchesStatus = statusFilter === '' || order.status === statusFilter;

        return matchesSearch && matchesIsPaid && matchesPaymentType && matchesStatus;
    });

    const groupedOrders = {
        Pending: [],
        Delivered: [],
        Cancelled: [],
    };

    filteredOrders.forEach(order => {
        if (order.status === 'Delivered') groupedOrders.Delivered.push(order);
        else if (order.status === 'Cancelled') groupedOrders.Cancelled.push(order);
        else groupedOrders.Pending.push(order);
    });

    const openModal = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setTimeout(() => setSelectedOrder(null), 300);
    };

    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const renderOrders = (title, ordersArray) => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">{title} ({ordersArray.length})</h3>
            {ordersArray.length === 0 && <p className="text-gray-500">No {title.toLowerCase()} orders.</p>}
            {ordersArray.map((order, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300">
                    <div className="flex flex-col max-w-80 min-w-[180px]">
                        <div className="flex gap-5 items-center">
                            <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                            <div>
                                {order.items.map((item, i) => (
                                    <p key={i} className="font-medium">
                                        {item.product.name} <span className="text-primary">x {item.quantity}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1 break-words"><strong>Order ID:</strong> {order._id}</p>
                    </div>

                    <div className="text-sm md:text-base text-black/60 min-w-[220px]">
                        <p className="text-black/80">{order.address.firstName} {order.address.lastName}</p>
                        <p>{order.address.street}, {order.address.city}</p>
                        <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                        <p>{order.address.phone}</p>
                    </div>

                    <p className="font-medium text-lg my-auto min-w-[80px]">{currency}{order.amount}</p>

                    <div className="text-sm md:text-base text-black/60 min-w-[140px]">
                        <p>Method: {order.paymentType}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Payment: {order.isPaid ? 'Paid' : 'Pending'}</p>
                        <p>Status: {order.status}</p>
                    </div>

                    <div className="flex flex-col space-y-2 min-w-[140px]">
                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                            <>
                                <button onClick={() => cancelOrderByAdmin(order._id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">Cancel Order</button>
                                <button onClick={() => markOrderAsDelivered(order._id)} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition">Mark as Delivered</button>
                            </>
                        )}
                        <button onClick={() => openModal(order)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition">View Details</button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
            <div className="md:p-10 p-4 space-y-6">
                <h2 className="text-2xl font-bold">Orders List</h2>

                <div className="flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <select value={isPaidFilter} onChange={(e) => setIsPaidFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                        <option value="">All Payments</option>
                        <option value="true">Paid</option>
                        <option value="false">Unpaid</option>
                    </select>

                    <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                        <option value="">All Methods</option>
                        <option value="COD">COD</option>
                        <option value="Stripe">Online</option>
                    </select>

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                        <option value="">Status - All</option>
                        <option value="Pending">Pending</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {renderOrders('Pending Orders', groupedOrders.Pending)}
                {renderOrders('Delivered Orders', groupedOrders.Delivered)}
                {renderOrders('Cancelled Orders', groupedOrders.Cancelled)}
            </div>

            {/* Modal */}
            {selectedOrder && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${showModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={closeModal}
                    aria-modal="true"
                    role="dialog"
                    tabIndex={-1}
                >
                    <div
                        className={`bg-white/90 rounded-xl p-6 w-full max-w-2xl shadow-lg relative overflow-y-auto max-h-[90vh] transform transition-transform duration-300 ${showModal ? 'scale-100' : 'scale-90'}`}
                        onClick={(e) => e.stopPropagation()}
                        ref={printRef}
                    >
                        <button onClick={closeModal} className="absolute top-2 right-4 text-xl font-bold text-black hover:text-red-500" aria-label="Close modal">×</button>
                        <h2 className="text-xl font-bold mb-4 text-black">Order Details</h2>

                        <div className="text-black/80 space-y-2 text-sm md:text-base">
                            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                            <p><strong>User ID:</strong> {selectedOrder.userId}</p>
                            <p><strong>Status:</strong> {selectedOrder.status}</p>
                            <p><strong>Payment:</strong> {selectedOrder.isPaid ? 'Paid' : 'Pending'}</p>
                            <p><strong>Payment Type:</strong> {selectedOrder.paymentType}</p>
                            <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            <p><strong>Amount:</strong> {currency}{selectedOrder.amount}</p>

                            <div className="pt-3 border-t">
                                <p className="font-medium">Items:</p>
                                <ul className="list-disc list-inside">
                                    {selectedOrder.items.map((item, index) => (
                                        <li key={index}>
                                            {item.product.name ?? item.product._id} × {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-3 border-t">
                                <p className="font-medium">Shipping Address:</p>
                                <p>{selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
                                <p>{selectedOrder.address.street}, {selectedOrder.address.city}</p>
                                <p>{selectedOrder.address.state}, {selectedOrder.address.zipcode}</p>
                                <p>{selectedOrder.address.country}</p>
                                <p>Phone: {selectedOrder.address.phone}</p>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handlePrint}
                                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                            >
                                🖨️ Print Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Orders;