import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLocationDot, faTag } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function Card({title, condition, time, location, category, price, oldPrice, img, onClick}) {
  const [imgSrc, setImgSrc] = useState(img);
  const [hasError, setHasError] = useState(false);

  const riyal = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block"
    >
      <path d="m20 19.5-5.5 1.2"/>
      <path d="M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2"/>
      <path d="m2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2"/>
      <path d="M20 10 4 13.5"/>
    </svg>
  );

  const hasValidImage = img && 
    img !== '' && 
    !img.includes('placeholder') && 
    !img.includes('via.placeholder');

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(null);
    }
  };

  // Calculate discount if oldPrice exists
  const savings = oldPrice && price ? oldPrice - price : null;

  return(
    <div 
      onClick={onClick} 
      className="bg-white shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 cursor-pointer overflow-hidden transition-shadow"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        {hasValidImage && !hasError ? (
          <img
            className="w-full h-48 sm:h-56 object-cover"
            src={imgSrc}
            alt={title || "Product image"}
            onError={handleImageError}
          />
        ) : (
          <div 
            className="w-full h-48 sm:h-56 flex items-center justify-center text-white bg-gradient-to-br from-[#834d1a] to-[#6d3e15]"
          >
            <div className="text-center opacity-70">
              <FontAwesomeIcon icon={faTag} className="text-2xl mb-2" />
              <div className="text-sm font-medium">No Image</div>
            </div>
          </div>
        )}

        {savings && (
          <div className="absolute top-3 left-3">
            <div className="bg-red-500 text-white px-3 py-1 text-xs font-semibold rounded">
              Sale -{savings} SR
            </div>
          </div>
        )}
      </div>
                    
      {/* Card Content */}
      <div className="p-4 space-y-3">
        <h3 dir='auto' className="text-base font-semibold text-gray-900 leading-snug">
          <a href="#" className="hover:text-[#834d1a] transition-colors">
            {title && title.length > 50 ? `${title.substring(0, 50)}...` : title}
          </a>
        </h3>
                         
        <div className="flex items-center">
          <span className="text-xs font-medium text-[#834d1a] bg-[#834d1a]/10 px-3 py-1 rounded-full">
            {condition && condition.length > 10 ? `${condition.substring(0, 10)}...` : condition}
          </span>
        </div>
                          
        {/* Product meta info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs text-gray-500">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1 text-gray-400" />
            <span className="truncate">
              {time && time.length > 15 ? `${time.substring(0, 15)}...` : time}
            </span>
          </div>
                                
          <div className="flex items-center">
            <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 mr-1 text-gray-400" />
            <span className="truncate">
              {location && location.length > 15 ? `${location.substring(0, 15)}...` : location}
            </span>
          </div>

          <span className="text-xs text-white bg-[#834d1a] px-2 py-1 rounded-full truncate self-start sm:self-center">
            {category && category.length > 12 ? `${category.substring(0, 12)}...` : category}
          </span>
        </div>
        
        {/* Pricing */}
        <div className="pt-2">
          <div className="flex items-center space-x-2">
            {oldPrice && (
              <div className="flex items-center text-sm text-gray-400 line-through">
                <span>{oldPrice}</span>
                <span className="ml-1">{riyal}</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-900">
                {price && price.toString().length > 8 ? `${price.toString().substring(0, 8)}...` : price}
              </span>
              <span className="text-gray-700 ml-1">{riyal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}