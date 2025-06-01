
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useDispatch, useSelector } from 'react-redux';
import { SignOutSuccess } from '@/redux/user/slice';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
 const { currentUser } = useSelector((state : {
     user: {
      currentUser: {
        id:string,
      }
     }
   })=>state.user);

  const navigate=useNavigate();
  const dispatch=useDispatch();

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/signout', {
        method: 'POST',
        credentials: 'include', 
      });
  
      const data = await res.json(); 
  
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(SignOutSuccess());
        console.log("Logged out successfully");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };
  

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return null;
  }

  return (
<nav
  className={`fixed top-0 left-0 w-full z-50 bg-gradient-to-l from-blue-100 via-purple-100 to-pink-100 transition-all duration-300 
    ${isScrolled ? 'py-4 backdrop-blur-md shadow-md' : 'py-4'}
  `}
>

      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo size="md" />
        
        <div className="flex items-center space-x-6">
          {/* <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-700 hover:text-neon-purple transition-colors">
              Home
            </Link>
            <Link to="/#features" className="text-slate-700 hover:text-neon-purple transition-colors">
              Features
            </Link>
            <Link to="/#pricing" className="text-slate-700 hover:text-neon-purple transition-colors">
              Pricing
            </Link>
          </div> */}
          
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 rounded-full hover:bg-transparent">
                  <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-neon-purple object-contain  transition-all">
                    
                    {/* set user image here */}
                    
                    <AvatarImage src={currentUser.image} alt="Profile" />

                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-blue-100">
                <DropdownMenuItem
                  onClick={() => navigate('/profile/:id')}
                  className="cursor-pointer hover:bg-neon-purple/10 text-slate-700"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-neon-purple/10 text-red-500"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="hover:text-neon-purple hover:bg-neon-purple/10 transition-all">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-neon-purple hover:bg-neon-purple/90 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
