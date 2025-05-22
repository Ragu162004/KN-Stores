import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets, categories } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [open, setOpen] = React.useState(false)
  const { user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout');
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all z-50">

      <NavLink to='/' onClick={() => setOpen(false)}>
        <img className="h-16" src={assets.logo} alt="logo" />
      </NavLink>

      <div className="hidden sm:flex items-center gap-10 text-base md:text-lg font-medium">
        <NavLink to='/' className="hover:text-primary">Home</NavLink>

        {/* All Product with Dropdown */}
        <div className="relative group">
          <NavLink to='/products' className="hover:text-primary">All Product</NavLink>
          <div className="absolute left-0 top-full hidden group-hover:flex flex-col bg-white shadow-md border border-gray-200 rounded-md min-w-[200px] z-30">
            {categories.map((cat, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 whitespace-nowrap cursor-pointer text-base"
                onClick={() => {
                  setOpen(false);
                  navigate(`/products/${cat.path.toLowerCase()}`);
                }}
              >
                {cat.text}
              </div>
            ))}
          </div>
        </div>

        <NavLink to='/contact-us' className="hover:text-primary">Contact</NavLink>

        <div className="hidden lg:flex items-center text-base gap-3 border border-gray-300 px-3 rounded-full">
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 w-full bg-transparent outline-none placeholder-gray-500 text-base"
            type="text"
            placeholder="Search products"
          />
          <img src={assets.search_icon} alt='search' className='w-5 h-5' />
        </div>

        <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80' />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
        </div>

        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className="cursor-pointer px-10 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-base"
          >
            Login
          </button>
        ) : (
          <div className='relative group'>
            <img src={assets.profile_icon} className='w-10' alt="profile" />
            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-3 w-36 rounded-md text-base z-40'>
              <li onClick={() => navigate("my-orders")} className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'>My Orders</li>
              <li onClick={logout} className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'>Logout</li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className='flex items-center gap-6 sm:hidden'>
        <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80' />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Menu">
          {!open ? <img src={assets.menu_icon} alt='menu' /> : <img src={assets.cancel} className='h-6' alt='cancel' />}
        </button>
      </div>

      {open && (
        <div className="absolute top-[100px] right-0 w-fit bg-white shadow-md py-4 flex flex-col items-start gap-3 px-10 text-base md:hidden z-40">
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>

          <div className='flex flex-col'>
            <p className='cursor-pointer' onClick={() => {
              setOpen(false);
              navigate("/products");
            }}>All Products</p>
          </div>

          {user && (
            <NavLink to="/my-orders" onClick={() => setOpen(false)}>My Orders</NavLink>
          )}
          <NavLink to="/contact-us" onClick={() => setOpen(false)}>Contact</NavLink>

          {!user ? (
            <button
              onClick={() => {
                setOpen(false);
                setShowUserLogin(true);
              }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-base"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-base"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
