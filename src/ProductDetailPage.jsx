import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  Share2, 
  Flag, 
  MessageCircle,
  Eye,
  Shield,
  ChevronDown,
  ChevronUp,
  Verified,
  MoreVertical,
  Trash2,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import API_BASE_URL from './config/api';
import ConfirmationDialog from './ConfirmationDialog';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const commentSectionRef = useRef(null);
  
  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  
  // Self-messaging confirmation dialog
  const [showSelfMessageDialog, setShowSelfMessageDialog] = useState(false);

  // Get current user info
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Increment views when component mounts - تعليق مؤقت حتى يتم إضافة الـ endpoint
  useEffect(() => {
    const incrementViews = async () => {
      try {
        // مؤقتاً معطل حتى يتم إضافة endpoint في الـ backend
        // await axios.put(`${API_BASE_URL}/api/products/${id}/views`, {}, {
        //   headers: {
        //     'ngrok-skip-browser-warning': 'true'
        //   }
        // });
        console.log('Views increment disabled - endpoint not available');
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };

    if (id) {
      incrementViews();
    }
  }, [id]);

  // Check if product is in favorites
  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const storedUserData = localStorage.getItem('userData');
      
      if (!token || !storedUserData) return;
      
      const user = JSON.parse(storedUserData);
      const userId = user._id;
      
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      const favorites = response.data.favorites || [];
      const isProductFavorite = favorites.some(fav => fav._id === id);
      setIsFavorite(isProductFavorite);
      
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("authToken");
        const headers = {
          'ngrok-skip-browser-warning': 'true'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await axios.get(`${API_BASE_URL}/api/products/${id}`, {
          headers
        });
        
        setProduct(response.data);
        
        if (token) {
          checkIfFavorite();
        }
        
        try {
          const commentsResponse = await axios.get(`${API_BASE_URL}/api/comments/product/${id}`, {
            headers
          });
          setComments(commentsResponse.data || []);
        } catch (commentError) {
          console.log('Comments not available:', commentError);
          setComments([]);
        }
        
      } catch (err) {
        console.error('Error fetching product:', err);
        if (err.response?.status === 404) {
          setError('Product not found');
        } else if (err.response?.status === 401) {
          setError('You need to log in to view product details');
        } else {
          setError('Error loading product data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handle Send Message - start chat with seller
  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert('يجب تسجيل الدخول لإرسال رسالة');
        navigate('/login');
        return;
      }

      // Get the correct seller ID
      const sellerId = product.user?._id || product.userId || product.seller?._id;
      
      console.log('Product data:', product);
      console.log('Seller info:', product.user);
      console.log('Seller ID to use:', sellerId);

      if (!sellerId) {
        alert('معلومات البائع غير متوفرة');
        return;
      }

      // Check if trying to message yourself
      if (currentUser && (sellerId === currentUser.userId || sellerId === currentUser._id)) {
        setShowSelfMessageDialog(true);
        return;
      }

      // تصحيح المسار بناءً على ملف الـ routes
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

      console.log('Chat response:', response.data);

      if (response.data && response.data._id) {
        const chatId = response.data._id;
        // Navigate to chat page with the seller
        navigate(`/chat/${chatId}`);
      } else {
        console.error('Invalid response from chat API:', response.data);
        alert('حدث خطأ في بدء المحادثة. الرجاء المحاولة مرة أخرى');
      }
      
    } catch (error) {
      console.error('Error starting chat:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('الرجاء تسجيل الدخول لإرسال الرسائل');
        navigate('/login');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data.error || 'لا يمكن بدء المحادثة';
        alert(errorMsg);
      } else if (error.response?.status === 404) {
        alert('خطأ في الاتصال بخدمة المحادثة');
        console.error('Chat endpoint not found. Please check if the backend route is /api/chats/start or /api/chat/start');
      } else if (error.response?.status === 500) {
        alert('خطأ في الخادم. الرجاء المحاولة لاحقاً');
      } else {
        alert('حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى');
      }
    }
  };

  // Handle comment submission
const handleSubmitComment = async () => {
  if (!comment.trim() || commentLoading) return; 

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert('You need to log in to add a comment');
      return;
    }

    setCommentLoading(true); // تفعيل التحميل

    const response = await axios.post(`${API_BASE_URL}/api/comments`, {
      text: comment,
      ProductId: id
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    // تحقق من عدم وجود الكومنت قبل إضافته
    const commentExists = comments.some(c => c._id === response.data._id);
    if (!commentExists) {
      setComments(prev => [response.data, ...prev]);
    }
    
    setComment(''); 
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert('Error sending comment');
  } finally {
    setCommentLoading(false); 
  }
};


const [deleteCommentDialog, setDeleteCommentDialog] = useState(false);
const [commentToDelete, setCommentToDelete] = useState(null);
const [isDeletingComment, setIsDeletingComment] = useState(false);


const handleDeleteComment = (commentId) => {
  setCommentToDelete(commentId);
  setDeleteCommentDialog(true);
};

const confirmDeleteComment = async () => {
  if (!commentToDelete) return;

  setIsDeletingComment(true);
  
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert('You need to log in to delete comment');
      setDeleteCommentDialog(false);
      setIsDeletingComment(false);
      return;
    }

    await axios.delete(`${API_BASE_URL}/api/comments/${commentToDelete}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    setComments(prev => prev.filter(comment => comment._id !== commentToDelete));
    setShowDropdown(null);
    setDeleteCommentDialog(false);
    setCommentToDelete(null);
    
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error.response?.status === 403) {
      alert('You do not have permission to delete this comment');
    } else {
      alert('Error deleting comment');
    }
    setDeleteCommentDialog(false);
  } finally {
    setIsDeletingComment(false);
  }
};

const closeDeleteCommentDialog = () => {
  if (!isDeletingComment) {
    setDeleteCommentDialog(false);
    setCommentToDelete(null);
  }
};

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert('You need to log in to add to favorites');
        return;
      }
      
      const storedUserData = localStorage.getItem('userData');
      const user = JSON.parse(storedUserData);
      const userId = user._id;

      if (isFavorite) {
        await axios.put(`${API_BASE_URL}/api/users/${userId}/favorites/remove`, 
          { productId: id }, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );
        setIsFavorite(false);
      } else {
        await axios.put(`${API_BASE_URL}/api/users/products/${userId}/favorites/add`, 
          { productId: id }, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorites');
    }
  };

  // WhatsApp contact - use phoneNumber from product
  const handleWhatsAppContact = () => {
    const phone = product?.phoneNumber;
    
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
    
    const message = `Hi, I'm interested in "${product.name}" for ${product.price} SAR

Product link: ${window.location.href}`;

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#834d1a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 shadow-sm max-w-md w-full mx-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#834d1a] text-white py-2 px-4 hover:bg-[#6d3e15] transition"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 hover:bg-gray-300 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : []);
  const seller = product.user || {};
  
  // Check for phoneNumber in product
  const hasSellerPhone = product?.phoneNumber && product.phoneNumber.trim() !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white">
      {/* Self Message Confirmation Dialog */}
      <ConfirmationDialog
        open={showSelfMessageDialog}
        onClose={() => setShowSelfMessageDialog(false)}
        onConfirm={() => setShowSelfMessageDialog(false)}
        title="Cannot Message Yourself"
        message="You cannot send a message to yourself. This is your own product listing."
        confirmText="OK"
        cancelText=""
        type="info"
        confirmButtonStyle="primary"
        showIcon={true}
        size="sm"
      />

      {/* Header */}
      <div className="bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#834d1a] transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleFavoriteToggle}
                className="p-2 hover:bg-gray-100 transition"
                disabled={!currentUser}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-[#834d1a] text-[#834d1a]' : 'text-gray-400'}`} />
              </button>
              <button className="p-2 hover:bg-gray-100 transition">
                <Share2 className="w-6 h-6 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 transition">
                <Flag className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Product Title and Price */}
            <div className="bg-[#F8F5E9] p-6">
              <div className="mb-4">
                <span className="inline-block bg-white text-gray-700 px-3 py-1 text-sm font-medium">
                  {product.category || 'Uncategorized'}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {product.name || product.title}
              </h1>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-4xl font-bold text-[#834d1a]">
                  {product.price}
                </span>
                <span className="text-xl text-gray-600">SAR</span>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Condition</div>
                  <div className="font-medium text-[#834d1a]">
                    {product.condition }
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Views</div>
                  <div className="font-medium flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" />
                    {product.views || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-medium">{product.location || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Posted</div>
                  <div className="font-medium text-xs">
                    {product.createdAt 
                      ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                
                <div className="prose max-w-none">
                  <div className={`text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden ${
                    !showFullDescription && product.description?.length > 300 ? 'line-clamp-4' : ''
                  }`}>
                    {product.description || 'No description available for this product.'}
                  </div>
                  
                  {product.description?.length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-3 flex items-center gap-1 text-[#834d1a] hover:text-[#6d3e15] font-medium transition"
                    >
                      {showFullDescription ? (
                        <>
                          <span>Show less</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Show more</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white overflow-hidden shadow-xl rounded-2xl">
              <div className="relative aspect-video p-5 bg-[#F8F5E9] rounded-2xl">
                {images.length > 0 ? (
                  <img 
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent && !parent.querySelector('.no-image-placeholder')) {
                        const div = document.createElement('div');
                        div.className = 'no-image-placeholder w-full h-full flex items-center justify-center text-white rounded-xl';
                        div.style.backgroundColor = '#834d1a';
                        div.innerHTML = '<span class="text-sm opacity-70">No image</span>';
                        parent.appendChild(div);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white rounded-xl" style={{backgroundColor: '#834d1a'}}>
                    <span className="text-sm opacity-70">No image</span>
                  </div>
                )}
                
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 text-sm rounded-lg">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="p-4 bg-white rounded-2xl">
                  <div className="flex gap-3 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 overflow-hidden transition-all duration-300 hover:scale-110 rounded-xl ${
                          index === selectedImageIndex 
                            ? 'ring-2 ring-[#834d1a]/50 shadow-lg' 
                            : 'hover:ring-1 hover:ring-gray-300'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.backgroundColor = '#834d1a';
                            e.target.style.display = 'flex';
                            e.target.style.alignItems = 'center';
                            e.target.style.justifyContent = 'center';
                            e.target.style.color = 'white';
                            e.target.style.fontSize = '10px';
                            e.target.innerHTML = 'No image';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div ref={commentSectionRef} className="bg-white p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Questions & Comments
              </h3>
              
              {/* Add Comment */}
              <div className="space-y-4 mb-8">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ask a question about this product..."
                  maxLength={500}
                  className="w-full h-24 p-4 bg-gray-50 resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#834d1a]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {comment.length}/500 characters
                  </span>
                  <button 
                    onClick={handleSubmitComment}
                    className="bg-[#834d1a] hover:bg-[#6d3e15] text-white px-6 py-2 font-medium transition disabled:opacity-50 flex items-center gap-2"
                    disabled={!comment.trim()}
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment, index) => (
                    <div key={index} className="pb-6 last:border-b-0 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        {comment.User?.profileImage ? (
                          <img 
                            src={comment.User.profileImage}
                            alt={comment.User?.name || 'User'}
                            className="w-10 h-10 object-cover flex-shrink-0"
                            style={{borderRadius: '4px'}}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent && !parent.querySelector('.comment-no-image')) {
                                const div = document.createElement('div');
                                div.className = 'comment-no-image w-10 h-10 flex items-center justify-center text-white text-xs flex-shrink-0';
                                div.style.backgroundColor = '#834d1a';
                                div.style.borderRadius = '4px';
                                div.innerHTML = '👤';
                                parent.appendChild(div);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-white text-xs flex-shrink-0" 
                               style={{backgroundColor: '#834d1a', borderRadius: '4px'}}>
                            👤
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-medium text-gray-900">
                                  {comment.User?.name || 'Anonymous'}
                                </span>
                                {comment.User?._id === product.user?._id && (
                                  <span className="bg-[#834d1a] text-white text-xs px-2 py-1 font-medium">
                                    Seller
                                  </span>
                                )}
                                <span className="text-sm text-gray-500">
                                  {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-gray-700 break-words">{comment.text}</p>
                            </div>
                            
                            {currentUser && currentUser.userId === comment.User._id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment._id);
                                }}
                                className="p-1 hover:bg-red-50 transition-colors group"
                                title="Delete comment"
                              >
                                <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No questions yet</h4>
                  <p className="text-gray-400">Be the first to ask about this product</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              
              {/* Contact Actions */}
              <div className="bg-[#F8F5E9] p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Seller</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleSendMessage}
                    className="w-full rounded-xl shadow-lg hover:shadow-xl bg-gradient-to-r from-[#834d1a] to-[#6d3e15] hover:from-[#6d3e15] hover:to-[#834d1a] text-white py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                  
                  {hasSellerPhone && (
                    <button 
                      onClick={handleWhatsAppContact}
                      className="w-full rounded-xl shadow-lg hover:shadow-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </button>
                    )}
                </div>
              </div>

{/* Seller Info */}
<div className="bg-[#F8F5E9] p-6">
  <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>
  
  <div 
    className="flex items-start gap-4 mb-4 cursor-pointer hover:bg-[#F0EDE0] p-3 rounded-xl transition-all duration-300 group"
    onClick={() => navigate(`/seller/${seller._id || seller.id}`)}
  >
    {seller.profileImage || seller.avatar ? (
      <img 
        src={seller.profileImage || seller.avatar}
        alt={seller.name || 'Seller'}
        className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
        style={{borderRadius: '4px'}}
        onError={(e) => {
          e.target.style.display = 'none';
          const parent = e.target.parentElement;
          if (parent && !parent.querySelector('.seller-no-image')) {
            const div = document.createElement('div');
            div.className = 'seller-no-image w-16 h-16 flex items-center justify-center text-white text-xs';
            div.style.backgroundColor = '#834d1a';
            div.style.borderRadius = '4px';
            div.innerHTML = 'Seller';
            parent.appendChild(div);
          }
        }}
      />
    ) : (
      <div className="w-16 h-16 flex items-center justify-center text-white text-xs group-hover:scale-105 transition-transform" 
           style={{backgroundColor: '#834d1a', borderRadius: '4px'}}>
        Seller
      </div>
    )}
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-semibold text-gray-900 group-hover:text-[#834d1a] transition-colors">
          {seller.name || 'Unknown Seller'}
        </h4>
        {seller.verified && (
          <Verified className="w-4 h-4 text-blue-500" />
        )}
      </div>
      
      <div className="flex items-center gap-1 mb-2">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">
          {seller.location || product.location || 'Location not specified'}
        </span>
      </div>
      
      <p className="text-xs text-[#834d1a] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        Click to view seller profile →
      </p>
    </div>
  </div>
</div>

              {/* Product Stats */}
              <div className="bg-[#F8F5E9] p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Listing Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium">
                      {product.createdAt 
                        ? new Date(product.createdAt).toLocaleDateString('en-US')
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{product.views || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ID</span>
                    <span className="font-mono text-xs bg-white px-2 py-1">
                      {product._id?.slice(-8) || '--------'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog
  open={deleteCommentDialog}
  onClose={closeDeleteCommentDialog}
  onConfirm={confirmDeleteComment}
  title="Delete Comment"
  message="Are you sure you want to delete this comment? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  type="warning"
  confirmButtonStyle="danger"
  isLoading={isDeletingComment}
  showIcon={true}
  size="sm"
/>
    </div>
  );
};

export default ProductDetailPage;