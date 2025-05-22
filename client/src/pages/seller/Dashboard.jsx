import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  FaUsers,
  FaShoppingCart,
  FaMoneyBillWave,
  FaClock,
  FaBan,
  FaTruck,
  FaCheckCircle
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardHome = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res1 = await axios.get('/api/order/seller', { withCredentials: true });
        const res2 = await axios.get('/api/user/getAllUser', { withCredentials: true });
        setOrders(res1.data.orders || []);
        setUsers(res2.data.user || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, []);

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const matchesYear = selectedYear === '' || orderDate.getFullYear() === parseInt(selectedYear);
    const matchesMonth = selectedMonth === '' || orderDate.getMonth() === parseInt(selectedMonth);
    return matchesYear && matchesMonth;
  });

  const monthlyIncome = Array(12).fill(0);
  const dailyIncome = Array(31).fill(0);
  const stockCount = {};
  const paymentTypes = { COD: 0, Stripe: 0 };
  const orderStatusCounts = {};

  let totalIncome = 0;
  let pendingPayments = 0;
  let cancelledOrders = 0;
  let completedOrders = 0;
  let remainingDeliveryOrders = 0;

  filteredOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const month = orderDate.getMonth();
    const day = orderDate.getDate() - 1;

    if (order.isPaid) {
      monthlyIncome[month] += order.amount;
      if (selectedMonth !== '') {
        dailyIncome[day] += order.amount;
      }
    }

    if (!order.isPaid && order.status !== 'Cancelled' && order.status !== 'Delivered') {
      pendingPayments++;
    }

    if (order.status === 'Cancelled') cancelledOrders++;

    if (order.isPaid && order.status === 'Delivered') completedOrders++;

    if (order.status === 'Order Placed') remainingDeliveryOrders++;

    if (order.paymentType === 'COD') paymentTypes.COD += 1;
    else paymentTypes.Stripe += 1;

    orderStatusCounts[order.status] = (orderStatusCounts[order.status] || 0) + 1;

    order.items.forEach(item => {
      const productName = item.product?.name || 'Unnamed';
      stockCount[productName] = (stockCount[productName] || 0) + item.product.StockNumber;
    });

    if (order.isPaid) totalIncome += order.amount;
  });

  const lineChartData = {
    labels: selectedMonth === ''
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : Array.from({ length: 31 }, (_, i) => `${i + 1}`),
    datasets: [{
      label: selectedMonth === '' ? 'Monthly Revenue' : `Day-wise Revenue for ${parseInt(selectedMonth) + 1}/${selectedYear || 'All Time'}`,
      data: selectedMonth === '' ? monthlyIncome : dailyIncome,
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.3,
    }],
  };

  const barChartData = {
    labels: Object.keys(stockCount),
    datasets: [{
      label: 'Product Stock Orders',
      data: Object.values(stockCount),
      backgroundColor: '#34d399',
    }],
  };

  const pieChartData = {
    labels: ['Cash on Delivery', 'Online Payment'],
    datasets: [{
      data: [paymentTypes.COD, paymentTypes.Stripe],
      backgroundColor: ['#10b981', '#3b82f6'],
    }],
  };

  const statusChartData = {
    labels: Object.keys(orderStatusCounts),
    datasets: [{
      data: Object.values(orderStatusCounts),
      backgroundColor: ['#4ade80', '#facc15', '#f87171', '#60a5fa', '#a78bfa', '#fb923c'],
    }],
  };

  return (
    <div className="py-10 px-6 bg-gray-50 min-h-screen w-full">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">📊 Seller Dashboard</h1>
      <p className="text-sm text-gray-600 mb-6">
        Showing data for {selectedMonth === '' ? 'all months' : new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })}{' '}
        {selectedYear || 'All Time'}
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Time</option>
          {[currentYear, currentYear - 1, currentYear - 2].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-6 mb-10">
        <StatCard title="Total Users" value={users.length} icon={<FaUsers />} color="bg-blue-100" />
        <StatCard title="Total Orders" value={filteredOrders.length} icon={<FaShoppingCart />} color="bg-green-100" />
        <StatCard title="Total Income" value={`₹${totalIncome}`} icon={<FaMoneyBillWave />} color="bg-yellow-100" />
        <StatCard title="Completed Orders" value={completedOrders} icon={<FaCheckCircle />} color="bg-green-200" />
        <StatCard title="Pending Payments" value={pendingPayments} icon={<FaClock />} color="bg-purple-100" />
        <StatCard title="Cancelled Orders" value={cancelledOrders} icon={<FaBan />} color="bg-red-100" />
        <StatCard title="Remaining Deliveries" value={remainingDeliveryOrders} icon={<FaTruck />} color="bg-orange-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <ChartCard title={selectedMonth === '' ? "📈 Monthly Revenue Trend" : "📅 Day-wise Revenue"}>
          <Line data={lineChartData} />
        </ChartCard>
        <ChartCard title="📦 Product Wise Stocks">
          <Bar data={barChartData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ChartCard title="💳 Payment Methods (COD vs Online)">
          <Pie data={pieChartData} />
        </ChartCard>
        <ChartCard title="📊 Order Status Distribution">
          <Pie data={statusChartData} />
        </ChartCard>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 ${color}`}>
    <div className="flex items-center space-x-4">
      <div className="text-3xl text-indigo-600">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-xl font-semibold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
    <div className="relative h-64">
      {children}
    </div>
  </div>
);

export default DashboardHome;
