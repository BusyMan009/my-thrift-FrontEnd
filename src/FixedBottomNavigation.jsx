import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Paper from '@mui/material/Paper';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser } from './contexts/UserContext';

export default function FixedBottomNavigation() {
  const [value, setValue] = React.useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useUser();

  // Update active tab based on current route
  React.useEffect(() => {
    switch(location.pathname) {
      case '/': setValue(0); break;
      case '/favorites': setValue(1); break;
      case '/addTrift': setValue(2); break;
      case '/chat': setValue(3); break;
      case '/account': setValue(4); break;
      default: setValue(0);
    }
  }, [location.pathname]);

  const handleClickHome = () => {
    navigate("/");
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

  const handleClickChat = () => {
    navigate("/chat");
  };

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

  return (
    <Box sx={{ pb: 7 }}>
      <CssBaseline />
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: 1000
        }} 
        elevation={0}
      >
        <BottomNavigation
          sx={{
            background: 'linear-gradient(135deg, #F8F5E9 0%, #E8E5D8 100%)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(132, 77, 26, 0.1)',
            borderRadius: '20px 20px 0 0',
            height: '70px',
            '& .MuiBottomNavigationAction-root': {
              color: '#9c9a91',
              minWidth: '60px',
              padding: '8px 12px',
              borderRadius: '12px',
              margin: '4px 2px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiSvgIcon-root': {
                fontSize: '22px',
                transition: 'all 0.3s ease'
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '10px',
                fontWeight: '600',
                marginTop: '4px',
                opacity: 0.8
              },
              '&:hover': {
                backgroundColor: 'rgba(132, 77, 26, 0.08)',
                transform: 'translateY(-2px)',
                color: '#834d1a'
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(132, 77, 26, 0.12)',
                color: '#834d1a',
                '& .MuiSvgIcon-root': {
                  transform: 'scale(1.1)',
                  color: '#834d1a'
                },
                '& .MuiBottomNavigationAction-label': {
                  opacity: 1,
                  fontWeight: '700'
                }
              }
            },
            '& .MuiBottomNavigationAction-root:nth-of-type(3)': {
              '& .MuiSvgIcon-root': {
                fontSize: '28px',
                color: '#834d1a'
              },
              '&.Mui-selected .MuiSvgIcon-root': {
                color: '#B8860B',
                transform: 'scale(1.2)'
              },
              '&:hover .MuiSvgIcon-root': {
                color: '#B8860B',
                transform: 'scale(1.15)'
              }
            }
          }}
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction 
            onClick={handleClickHome}
            label="Home" 
            icon={<RestoreIcon />} 
          />
          <BottomNavigationAction 
            onClick={handleClickFavorites}
            label="Favorites" 
            icon={<FavoriteIcon />} 
          />
          <BottomNavigationAction 
            onClick={handleClickAdd}
            label="Add Thrift" 
            icon={<AddCircleIcon />} 
          />
          <BottomNavigationAction 
            onClick={handleClickChat}
            label="Chat" 
            icon={<ChatBubbleIcon />} 
          />
          <BottomNavigationAction 
            onClick={handleClickAcc}
            label="Account" 
            icon={<AccountCircleIcon />} 
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}