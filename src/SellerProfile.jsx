import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './config/api';
import { MapPin, Verified, Calendar, Package, ArrowLeft, Clock, Eye, Phone, MessageCircle } from 'lucide-react';

export default function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  // WhatsApp Icon Component
  const WhatsAppIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );

  useEffect(() => {
    fetchSellerData();
    fetchCurrentUser();
  }, [sellerId]);

  const fetchCurrentUser = () => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    console.log('Current User:', currentUser);
  };

  const fetchSellerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");

      const headers = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const sellerResponse = await axios.get(
        `${API_BASE_URL}/api/users/${sellerId}`,
        { headers }
      );

      setSeller(sellerResponse.data.user);
      setProducts(sellerResponse.data.products || []);
      console.log('Seller Data:', sellerResponse.data.user);
      console.log('Seller Phone:', sellerResponse.data.user.phone);

    } catch (error) {
      if (error.response?.status === 401) {
        setError('Failed to load seller profile');
        setSeller(null);
        setProducts([]);
      } else {
        setError('Failed to load seller profile');
        setSeller(null);
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert('Please login to send a message');
        navigate('/login');
        return;
      }

      if (!sellerId) {
        alert('Seller information not available');
        return;
      }

      if (currentUser && (sellerId === currentUser.userId || sellerId === currentUser._id || sellerId === currentUser.id)) {
        alert('You cannot send a message to yourself');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/chats/start`, 
        { otherUserId: sellerId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (response.data && response.data._id) {
        const chatId = response.data._id;
        navigate(`/chat/${chatId}`);
      } else {
        alert('An error occurred while starting the conversation');
      }
           
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Please login to send messages');
        navigate('/login');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data.error || 'Cannot start conversation';
        alert(errorMsg);
      } else {
        alert('Connection error. Please try again');
      }
    }
  };

  const handleWhatsAppContact = () => {
    const phone = seller?.phone;
    
    if (!phone) {
      alert('Seller contact information not available');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone) {
      alert('Invalid phone number');
      return;
    }

    let whatsappPhone = '';
    
    if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
      whatsappPhone = `966${cleanPhone.substring(1)}`;
    } else if (cleanPhone.startsWith('966') && cleanPhone.length === 12) {
      whatsappPhone = cleanPhone;
    } else if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
      whatsappPhone = `966${cleanPhone}`;
    } else {
      whatsappPhone = cleanPhone;
    }
    
    const message = `Hi, I'm interested in your products on the marketplace.

Seller Profile: ${window.location.href}`;

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const activeProducts = products.filter(p => !p.status || p.status === 'active');
  const displayedProducts = activeProducts;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5E9] via-[#F0EDE0] to-[#E8E5D8] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#834d1a] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5E9] via-[#F0EDE0] to-[#E8E5D8] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Seller not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            Please login to view seller profile details.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login?redirect=/seller/' + sellerId)}
              className="w-full px-6 py-3 bg-[#834d1a] text-white rounded-xl hover:bg-[#6d3e15] transition-colors"
            >
              Login to View Profile
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && (sellerId === currentUser.userId || sellerId === currentUser._id || sellerId === currentUser.id);
  console.log('isOwnProfile:', isOwnProfile, 'sellerId:', sellerId, 'currentUser:', currentUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5E9] via-[#F0EDE0] to-[#E8E5D8]">
      
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#834d1a] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          
          <div className="bg-gradient-to-r from-[#834d1a] to-[#6d3e15] h-32"></div>
          
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                {seller.profileImage || seller.avatar ? (
                  <img 
                    src={seller.profileImage || seller.avatar}
                    alt={seller.name}
                    className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-[#834d1a] flex items-center justify-center text-white text-3xl font-bold">
                    {seller.name?.charAt(0) || 'S'}
                  </div>
                )}
                
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {seller.name || 'Unknown Seller'}
                    </h1>
                    {seller.verified && (
                      <Verified className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              {/* {!isOwnProfile && ( */}
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
                  {/* Chat Button */}
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#834d1a] to-[#6d3e15] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Send Message</span>
                  </button>

                  {/* WhatsApp Button */}
                  {seller.phone && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all hover:bg-[#20BA5A]"
                    >
                      <WhatsAppIcon />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>
              {/* )} */}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#F8F5E9] rounded-xl p-4 text-center">
                <Package className="w-6 h-6 text-[#834d1a] mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{activeProducts.length}</p>
                <p className="text-sm text-gray-600">Active Listings</p>
              </div>
              
              <div className="bg-[#F8F5E9] rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 text-[#834d1a] mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">{formatDate(seller.createdAt)}</p>
                <p className="text-sm text-gray-600">Member Since</p>
              </div>
              
              <div className="bg-[#F8F5E9] rounded-xl p-4 text-center">
                <Eye className="w-6 h-6 text-[#834d1a] mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{products.reduce((sum, p) => sum + (p.views || 0), 0)}</p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {seller.location && (
                <div className="flex items-center gap-3 p-4 bg-[#F8F5E9] rounded-xl">
                  <MapPin className="w-5 h-5 text-[#834d1a] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{seller.location}</p>
                  </div>
                </div>
              )}
              
              {seller.phone && (
                <div className="flex items-center gap-3 p-4 bg-[#F8F5E9] rounded-xl">
                  <Phone className="w-5 h-5 text-[#834d1a] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <a href={`tel:${seller.phone}`} className="font-semibold text-gray-900 hover:text-[#834d1a] transition-colors">
                      {seller.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {seller.bio && (
              <div className="p-4 bg-[#F8F5E9] rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{seller.bio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Listings ({activeProducts.length})</h2>
          
          {displayedProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Active Listings
              </h3>
              <p className="text-gray-500">
                This seller doesn't have any active items yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-16 h-16" />
                      </div>
                    )}

                    {product.featured && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#834d1a] transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-2xl font-bold text-[#834d1a]">
                        {product.price} SR
                      </p>
                      {product.condition && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {product.condition}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{product.location || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}