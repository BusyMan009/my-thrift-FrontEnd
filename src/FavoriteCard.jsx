// FavoriteCard.jsx - Fixed with English
import React, { useState } from 'react';
import { Heart, Calendar, User } from 'lucide-react';

const FavoriteCard = ({ item, onToggleFavorite, onProductClick }) => {
  console.log('FavoriteCard received item:', item);
  console.log('FavoriteCard item type:', typeof item);
  
  // Validate item data
  if (!item) {
    console.log('FavoriteCard: Item is null or undefined');
    return null;
  }
  
  if (typeof item !== 'object') {
    console.log('FavoriteCard: Item is not an object:', typeof item, item);
    return null;
  }

  const itemId = item._id || item.id;
  if (!itemId) {
    console.log('FavoriteCard: Item has no ID:', item);
    console.log('FavoriteCard: Item keys:', Object.keys(item));
    return null;
  }

  console.log('FavoriteCard valid item with ID:', itemId);
  console.log('FavoriteCard item keys:', Object.keys(item || {}));
  console.log('FavoriteCard item title:', item.title);
  console.log('FavoriteCard item name:', item.name);
  console.log('FavoriteCard item productTitle:', item.productTitle);

  const [imgSrc, setImgSrc] = useState(
    item.images?.[0] || 
    item.image || 
    item.imageUrl || 
    item.photo || 
    ''
  );
  const [hasError, setHasError] = useState(false);

  const hasValidImage = imgSrc && 
    imgSrc !== '' && 
    !imgSrc.includes('placeholder') && 
    !imgSrc.includes('via.placeholder');

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years} year${years > 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      console.log('Date formatting error:', error);
      return '';
    }
  };

  // Get product title from various possible fields
  const getProductTitle = () => {
    console.log('=== Getting Product Title ===');
    console.log('item.title:', item.title);
    console.log('item.name:', item.name);
    console.log('item.productTitle:', item.productTitle);
    console.log('item.productName:', item.productName);
    console.log('All item keys:', Object.keys(item));
    
    // جرب كل الحقول الممكنة
    const title = item.title || 
                 item.name || 
                 item.productTitle || 
                 item.productName ||
                 item.itemName ||
                 item.displayName ||
                 'Product';
    
    console.log('Final title result:', title);
    console.log('=== End Getting Title ===');
    return title;
  };

  // Get product description from various possible fields
  const getProductDescription = () => {
    return item.description ||'No description available';
  };

  // Get product price from various possible fields
  const getProductPrice = () => {
    return item.price || '0';
  };

  // Get product date from various possible fields
  const getProductDate = () => {
    return item.createdAt || 
           item.dateAdded || 
           item.created || 
           item.date;
  };

  // Get seller name from various possible fields
  const getSellerName = () => {
    return item.user?.name || 
           item.seller?.name || 
           item.owner?.name ||
           item.createdBy?.name;
  };

  const productTitle = getProductTitle();
  const productDescription = getProductDescription();
  const productPrice = getProductPrice();
  const productDate = getProductDate();
  const sellerName = getSellerName();

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col sm:flex-row" >
      
      {/* Image Section */}
      <div className="w-full h-48 sm:w-48 sm:h-36 flex-shrink-0 relative overflow-hidden">
        {hasValidImage && !hasError ? (
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={imgSrc}
            alt={productTitle}
            onError={handleImageError}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300"
            style={{backgroundColor: '#834d1a'}}
          >
            <span className="text-sm opacity-70">No Image</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-h-[120px] sm:min-h-[144px]" onClick={() => onProductClick(itemId)}>
        <div className="flex-1">
          {/* Header with Title and Heart */}
          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
            <h3 
              className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2 flex-1 leading-tight"
              title={productTitle}
            >
              {productTitle}
            </h3>
            
            {/* Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(itemId);
              }}
              className="p-1.5 sm:p-2 hover:bg-[#834d1a]/10 rounded transition-colors group/heart flex-shrink-0"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#834d1a] fill-current group-hover/heart:scale-110 transition-transform" />
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3  ">
            {productDescription}
          </p>

          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 mb-2 sm:mb-3">
            {/* Seller Info */}
            {sellerName && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Seller:</span>
                <span className="text-[#834d1a] font-medium">
                  {sellerName}
                </span>
              </div>
            )}
            
            {/* Date Added */}
            {productDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(productDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Price and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#834d1a]">
              {productPrice}
            </span>
            <span className="text-[#834d1a] font-medium text-sm sm:text-base">SAR</span>
          </div>
          
          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(itemId);
            }}
            className="text-[#834d1a] hover:text-[#6d3e15] font-medium text-xs sm:text-sm hover:underline transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteCard;