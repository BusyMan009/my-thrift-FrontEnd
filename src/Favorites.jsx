import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ArrowLeft } from 'lucide-react';
import FavoriteCard from './FavoriteCard';
import API_BASE_URL from './config/api';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const storedUserData = localStorage.getItem('userData');
        if (!storedUserData) throw new Error("User data not found");

        const user = JSON.parse(storedUserData);
        const userId = user._id;
        const token = localStorage.getItem('authToken');

        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          }
        });

        const data = response.data;
        
        // Handle response structure
        let favoritesArray = [];
        
        if (Array.isArray(data)) {
          favoritesArray = data;
        } else if (data && typeof data === 'object') {
          if (data.favorites && Array.isArray(data.favorites)) {
            favoritesArray = data.favorites;
          } else if (data.posts && Array.isArray(data.posts)) {
            favoritesArray = data.posts;
          }
        }
        
        // Filter valid items
        favoritesArray = favoritesArray.filter(item => 
          item != null && typeof item === 'object' && (item._id || item.id)
        );
        
        // Reverse for newest first
        const reversedFavorites = [...favoritesArray].reverse();
        setFavorites(reversedFavorites);
      } catch (err) {
        setError(err.message || 'Error loading favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (productId) => {
    try {
      const storedUserData = localStorage.getItem('userData');
      const user = JSON.parse(storedUserData);
      const userId = user._id;
      const token = localStorage.getItem('authToken');

      const isFavorited = favorites.some(item => (item._id || item.id) === productId);
      const endpoint = isFavorited ? 'remove' : 'add';
      
      await axios.put(
        `${API_BASE_URL}/api/users/${userId}/favorites/${endpoint}`,
        { productId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          }
        }
      );

      if (isFavorited) {
        setFavorites(prev => prev.filter(item => (item._id || item.id) !== productId));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#834d1a]/20 border-t-[#834d1a] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 shadow-sm max-w-md w-full mx-4">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#834d1a] text-white py-2 px-4 rounded hover:bg-[#6d3e15] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F8F5E9'}}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-6 h-6 text-[#834d1a] fill-current" />
                Favorites
              </h1>
              <p className="text-gray-600 text-sm">
                {favorites.length > 0 
                  ? `${favorites.length} items in favorites`
                  : 'No favorites yet'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Start adding products you like to your favorites
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#834d1a] text-white px-6 py-3 rounded hover:bg-[#6d3e15] transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((item, index) => {
              if (!item) return null;
              
              const itemId = item._id || item.id || `fallback-${index}`;
              
              return (
                <FavoriteCard
                  key={itemId}
                  item={item}
                  onToggleFavorite={toggleFavorite}
                  onProductClick={handleProductClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;