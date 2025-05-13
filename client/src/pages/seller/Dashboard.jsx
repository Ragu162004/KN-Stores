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
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaClock, FaBan } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/api/order/seller', { withCredentials: true });
        setOrders(res.data.orders || []);
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, []);

  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalIncome = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.amount, 0);
  const pendingPayments = orders.filter(o => !o.isPaid).length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

  const monthlyIncome = Array(12).fill(0);
  const orderCategoryCount = {};
  const stockCount = {};
  const paymentTypes = { COD: 0, Stripe: 0 };

  orders.forEach(order => {
    const month = new Date(order.createdAt).getMonth();
    if (order.isPaid) monthlyIncome[month] += order.amount;

    if (order.paymentType === 'cod') paymentTypes.COD += 1;
    else paymentTypes.Stripe += 1;

    order.items.forEach(item => {
      const category = item.product?.category || 'Unknown';
      const productName = item.product?.name || 'Unnamed';

      orderCategoryCount[category] = (orderCategoryCount[category] || 0) + item.quantity;
      stockCount[productName] = (stockCount[productName] || 0) + item.quantity;
    });
  });

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Revenue',
      data: monthlyIncome,
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

  const isLoadingPaymentChart = paymentTypes.COD === 0 && paymentTypes.Stripe === 0;

  return (
    <div className="py-10 px-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">📊 Seller Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-12">
        <StatCard title="Total Users" value={totalUsers} icon={<FaUsers />} color="bg-blue-100" />
        <StatCard title="Total Orders" value={totalOrders} icon={<FaShoppingCart />} color="bg-green-100" />
        <StatCard title="Total Income" value={`₹${totalIncome}`} icon={<FaMoneyBillWave />} color="bg-yellow-100" />
        <StatCard title="Pending Payments" value={pendingPayments} icon={<FaClock />} color="bg-purple-100" />
        <StatCard title="Cancelled Orders" value={cancelledOrders} icon={<FaBan />} color="bg-red-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <ChartCard title="📈 Monthly Revenue Trend">
          <Line data={lineChartData} />
        </ChartCard>
        <ChartCard title="📦 Product Stock Distribution">
          <Bar data={barChartData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1">
        <ChartCard title="💳 Payment Methods (COD vs Online)">
          {isLoadingPaymentChart ? (
            <div className="relative flex items-center justify-center h-64">
              <div className="w-20 h-20 border-8 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              <span className="absolute text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <Pie data={pieChartData} />
          )}
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
