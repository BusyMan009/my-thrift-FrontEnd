import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from './contexts/UserContext';
import { 
  Home, 
  Heart, 
  Plus, 
  MessageCircle, 
  User
} from 'lucide-react';

export default function CenteredTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  
  const { user, isAuthenticated, loading } = useUser();

  const handleClickAcc = () => {
    console.log('Account clicked, isAuthenticated:', isAuthenticated);
    console.log('User data:', user);
    console.log('Loading:', loading);
    
    if (!isAuthenticated) {
      console.log('Redirecting to login with redirect=/account');
      navigate("/login?redirect=/account");
    } else {
      console.log('User authenticated, going to account');
      navigate("/account");
    }
  };

  const handleClickAdd = () => {
    console.log('Add Thrift clicked, isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('Redirecting to login with redirect=/addTrift');
      navigate("/login?redirect=/addTrift");
    } else {
      console.log('User authenticated, going to addTrift');
      navigate("/addTrift");
    }
  };

  const handleClickFavorites = () => {
    console.log('Favorites clicked, isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('Redirecting to login with redirect=/favorites');
      navigate("/login?redirect=/favorites");
    } else {
      console.log('User authenticated, going to favorites');
      navigate("/favorites");
    }
  };

  const handleClickHome = () => {
    navigate("/");
  };

  const handleClickChat = () => {
    navigate("/chat");
  };
  
  useEffect(() => {
    switch(location.pathname) {
      case '/': setValue(0); break;
      case '/favorites': setValue(1); break;
      case '/addTrift': setValue(2); break;
      case '/chat': setValue(3); break;
      case '/account': setValue(4); break;
      default: setValue(0);
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="w-fit mx-auto bg-[#F8F5E9] px-10 mt-3 py-4">
        <div className="loading loading-spinner loading-sm"></div>
      </div>
    );
  }

  return (
    <div className="bg-white py-3">
      <div className="flex items-center justify-center space-x-1 bg-gradient-to-r from-[#F8F5E9] to-[#F0EDE0] rounded-full p-1 backdrop-blur-sm w-fit mx-auto shadow-md">
        
        {/* Home Tab */}
        <button
          onClick={handleClickHome}
          className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            value === 0 
              ? 'bg-[#834d1a] text-white shadow-lg' 
              : 'text-[#834d1a] hover:bg-white/70'
          }`}
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        
        {/* Favorites Tab */}
        <button
          onClick={handleClickFavorites}
          className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            value === 1 
              ? 'bg-[#834d1a] text-white shadow-lg' 
              : 'text-[#834d1a] hover:bg-white/70'
          }`}
        >
          <Heart className="w-4 h-4" />
          Favorites
        </button>
        
        {/* Add Thrift Tab - Special styling */}
        <button
          onClick={handleClickAdd}
          className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 font-bold cursor-pointer ${
            value === 2 
              ? 'bg-[#B8860B] text-white shadow-xl' 
              : 'bg-[#834d1a] text-white hover:bg-[#B8860B] hover:-translate-y-0.5 hover:shadow-lg'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Thrift
        </button>
        
        {/* Chat Tab */}
        <button
          onClick={handleClickChat}
          className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            value === 3 
              ? 'bg-[#834d1a] text-white shadow-lg' 
              : 'text-[#834d1a] hover:bg-white/70'
          }`}
        >
          <MessageCircle className="w-4 h-4 " />
          Chat
        </button>
        
        {/* Account Tab */}
        <button
          onClick={handleClickAcc}
          className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            value === 4 
              ? 'bg-[#834d1a] text-white shadow-lg' 
              : 'text-[#834d1a] hover:bg-white/70'
          }`}
        >
          <User className="w-4 h-4" />
          Account
        </button>
        
      </div>
      <hr className='mt-4 w-3/4 mx-auto opacity-20' />
    </div>
  );
}