import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyOrders = () => {
    const [myOrders, setMyOrders] = useState([])
    const [expandedSections, setExpandedSections] = useState({
        "Order Placed": true,
        "Delivered": false,
        "Cancelled": false,
    })
    
    const [viewAll, setViewAll] = useState({})

    const { currency, axios, user } = useAppContext()

    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/user')
            if (data.success) {
                setMyOrders(data.orders)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const cancelOrder = async (orderId) => {
        try {
            const { data } = await axios.put(`/api/order/cancel/user/${orderId}`, {
                userId: user._id,
            })
            if (data.success) {
                toast.success("Order Cancelled")
                fetchMyOrders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            alert("Something went wrong!")
            console.log(error)
        }
    }

    useEffect(() => {
        if (user) {
            fetchMyOrders()
        }
    }, [user])

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const toggleViewAll = (orderId) => {
        setViewAll(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }))
    }

    const renderOrdersList = (orders, status) => {
        if (orders.length === 0) return <p>No Orders Found</p>

        return orders.map((order, index) => {
            const showAllItems = viewAll[order._id]
            const visibleItems = showAllItems ? order.items : order.items.slice(0, 2)

            return (
                <div key={order._id} className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'>
                    <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col'>
                        <span>OrderId : {order._id}</span>
                        <span>Payment : {order.paymentType}</span>
                        <span>Total Amount : {currency}{order.amount}</span>
                    </p>

                    {visibleItems.map((item, idx) => (
                        <div key={idx}
                            className={`relative bg-white text-gray-500/70 ${order.items.length !== idx + 1 && "border-b"} border-gray-200 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}>
                            <div className='flex items-center mb-4 md:mb-0'>
                                <div className='bg-primary/10 p-4 rounded-lg'>
                                    <img src={item.product.image[0]} alt="" className='w-16 h-16' />
                                </div>
                                <div className='ml-4'>
                                    <h2 className='text-xl font-medium text-gray-800'>{item.product.name}</h2>
                                    <p>Category: {item.product.category}</p>
                                </div>
                            </div>

                            <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                                <p>Quantity: {item.quantity || "1"}</p>
                                <p>Status: {order.status}</p>
                                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>

                            <p className='text-primary text-lg font-medium'>
                                Amount: {currency}{item.product.offerPrice * item.quantity}
                            </p>
                        </div>
                    ))}

                    {order.items.length > 2 && (
                        <div className="text-center mt-2">
                            <button
                                onClick={() => toggleViewAll(order._id)}
                                className="text-primary font-medium hover:underline"
                            >
                                {showAllItems ? "View Less" : "View All"}
                            </button>
                        </div>
                    )}

                    {((order.paymentType === "Online" || !order.isPaid) && (order.status !== "Delivered" && order.status !== "Cancelled")) && (
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => cancelOrder(order._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all cursor-pointer"
                            >
                                Cancel Order
                            </button>
                        </div>
                    )}
                </div>
            )
        })
    }

    const ordersByStatus = {
        "Order Placed": myOrders.filter(o => o.status === "Order Placed"),
        "Delivered": myOrders.filter(o => o.status === "Delivered"),
        "Cancelled": myOrders.filter(o => o.status === "Cancelled"),
    }

    return (
        <div className='mt-16 pb-16 max-w-5xl mx-auto'>
            <div className='flex flex-col items-end w-max mb-8'>
                <p className='text-2xl font-medium uppercase'>My orders</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>

            {Object.entries(ordersByStatus).map(([status, orders]) => (
                <section key={status} className="mb-12">
                    <h2
                        onClick={() => toggleSection(status)}
                        className="text-xl font-semibold mb-4 cursor-pointer select-none flex items-center"
                    >
                        {status}
                        <span className="ml-4 text-primary">
                            {expandedSections[status] ? "▼" : "▶"}
                        </span>
                    </h2>

                    {expandedSections[status] && renderOrdersList(orders, status)}
                </section>
            ))}
        </div>
    )
}

export default MyOrders
