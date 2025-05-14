import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const UpdateProduct = () => {
    const { id } = useParams();
    const { axios, fetchProducts } = useAppContext();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        category: '',
        offerPrice: '',
        StockNumber: '',
    });

    const [loading, setLoading] = useState(true);

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`/api/product/${id}`);
            if (data.success) {
                setForm({
                    name: data.product.name,
                    category: data.product.category,
                    offerPrice: data.product.offerPrice,
                    StockNumber: data.product.StockNumber,
                });
                setLoading(false);
            } else {
                toast.error('Product not found');
                navigate('/');
            }
        } catch (err) {
            toast.error(err.message || 'Error fetching product');
            navigate('/');
        }
    };

    useEffect(() => {
        fetchProduct();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.put(`/api/product/update/${id}`, form, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (data.success) {
                toast.success('Product updated successfully');
                fetchProducts();
                navigate('/seller/product-list');
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message || 'Update failed');
        }
    };

    if (loading) return <div className="p-10 text-center text-lg font-medium">Loading product data...</div>;

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <form onSubmit={handleUpdate} className="md:p-10 p-4 space-y-5 max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Update Product</h2>
                
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
                    <input
                        id="product-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        type="text"
                        placeholder="Type here"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="category">Category</label>
                    <input
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        type="text"
                        placeholder="Type here"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        required
                    />
                </div>

                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
                        <input
                            id="offer-price"
                            name="offerPrice"
                            value={form.offerPrice}
                            onChange={handleChange}
                            type="number"
                            placeholder="0"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            required
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="stock-number">Stock Number</label>
                        <input
                            id="stock-number"
                            name="StockNumber"
                            value={form.StockNumber}
                            onChange={handleChange}
                            type="number"
                            placeholder="0"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer">
                    UPDATE
                </button>
            </form>
        </div>
    );
};

export default UpdateProduct;
