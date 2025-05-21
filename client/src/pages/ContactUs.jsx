import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await axios.post('/api/contact', formData)
            const data = res.data
            if (data.success) {
                toast.success('Message sent successfully!')
                setFormData({ name: '', email: '', phone: '', message: '' })
            } else {
                toast.error(data.message || 'Something went wrong!')
            }
        } catch (error) {
            toast.error('Failed to send message!')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-20 pb-24 px-6 sm:px-10 lg:px-20 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center uppercase tracking-wide">
                    Contact Us
                </h2>
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto text-lg leading-relaxed">
                    We'd love to hear from you! Whether you have questions about products, pricing, or anything else,
                    our team is ready to answer all your queries promptly and professionally.
                </p>

                <div className="bg-white shadow-lg rounded-2xl p-8 sm:p-12">
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-8" onSubmit={handleSubmit} noValidate>
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="name"
                                className="block text-gray-800 font-semibold mb-2"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-gray-800 font-semibold mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-gray-800 font-semibold mb-2"
                            >
                                Phone
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                placeholder="+91 9876543210"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="message"
                                className="block text-gray-800 font-semibold mb-2"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                placeholder="Write your message here..."
                                required
                            ></textarea>
                        </div>

                        <div className="sm:col-span-2 text-right">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-primary/90 transition"
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-16 text-center text-gray-600 text-base space-y-2">
                    <p>
                        Email: <span className="text-gray-800 font-semibold">support@knstores.com</span>
                    </p>
                    <p>
                        Phone: <span className="text-gray-800 font-semibold">+91 98765 43210</span>
                    </p>
                    <p>
                        Address: <span className="text-gray-800 font-semibold">123 Market Street, Coimbatore, TN, India</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ContactUs
