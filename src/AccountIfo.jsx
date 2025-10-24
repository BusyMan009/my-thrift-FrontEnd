import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Eye,
  Edit,
  Calendar,
  MapPin,
  LogOut,
  AlertCircle,
  Phone,
  Mail,
  User,
  Save,
  X,
  Trash2,
  Upload
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useUser } from './contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import ConfirmationDialog from './ConfirmationDialog';
import API_BASE_URL from './config/api';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
const CITIES = [
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
  'Taif', 'Buraydah', 'Tabuk', 'Khamis Mushait', 'Hafar Al-Batin', 'Jubail', 'Yanbu',
  'Najran', 'Al Bahah', 'Arar', 'Sakaka', 'Jazan', 'Abha', 'Qatif', 'Al-Ahsa',
  'Zulfi', 'Rafha', 'Wadi Al-Dawasir', 'Al Dawadmi', 'Sabya', 'Al Majmaah', 'Al Qunfudhah',
  'Al Lith', 'Rabigh', 'Al Kharj', 'Al Muzahimiyah', 'Bisha', 'Al Hawiyah', 'Al Aflaj'
];
const CATEGORIES = [
  "Clothing",
  "FootWear", 
  "Accessories",
  "Antiques",
  "Decor",
  "Media",
  "Games",
  "Art",
  "Other"
];

const useApi = () => {
  const apiRequest = useCallback(async (url, options = {}) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return { data: null, error: "No authentication token found" };
      }

      const response = await axios({
        url: `${API_BASE_URL}${url}`,
        method: options?.method || "GET",
        data: options?.data || null,
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          ...(options?.headers || {}),
        },
      });
      
      return { data: response.data, error: null };
    } catch (error) {
      if (error.response?.status === 401) {
        return { data: null, error: "Session expired. Please login again." };
      }
      
      return { 
        data: null, 
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected error occurred'
      };
    }
  }, []);

  return { apiRequest };
};

const ErrorMessage = ({ message }) => (
  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
    <AlertCircle className="w-5 h-5" />
    <span>{message}</span>
  </div>
);

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="text-center py-12">
    <div className="relative inline-flex">
      <div className="w-12 h-12 border-4 border-[#834d1a]/20 border-t-[#834d1a] rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">{message}</p>
  </div>
);

const ProductEditModal = ({ product, isOpen, onClose, onSave, loading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        condition: product.condition || 'Used',
        location: product.location || ''
      });
      setExistingImages(product.images || []);
      setSelectedImages([]);
      setImagePreviews([]);
    }
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + selectedImages.length + files.length;
    
    if (totalImages > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    existingImages.forEach((image, index) => {
      submitData.append(`existingImages[${index}]`, image);
    });

    selectedImages.forEach((file) => {
      submitData.append('images', file);
    });

    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h3 className="text-2xl font-bold text-gray-900">Edit Advertisement</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6">
            <Alert message={error} type="error" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-transparent outline-none transition"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Price (SAR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-transparent outline-none transition"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-transparent outline-none transition"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Condition *</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-transparent outline-none transition"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-transparent outline-none transition"
              >
                <option value="">Select City</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-transparent outline-none transition resize-none"
              placeholder="Describe your item..."
            />
          </div>

          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Current Images</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-28 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">
              Add Images {(existingImages.length + selectedImages.length) > 0 && `(${existingImages.length + selectedImages.length}/5)`}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#834d1a] transition cursor-pointer bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload-edit"
              />
              <label
                htmlFor="image-upload-edit"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-10 h-10 text-gray-400" />
                <div>
                  <span className="text-gray-700 font-medium">Click to upload images</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5 images total, each up to 5MB
                  </p>
                </div>
              </label>
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-3 text-gray-700">New Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-28 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#834d1a] text-white px-8 py-3 rounded-lg hover:bg-[#6d3e15] transition disabled:opacity-50 font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Advertisement
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdCard = ({ ad, onEdit, onDelete, onView }) => {
  const adImage = ad.images?.[0] || "https://via.placeholder.com/64";
  const adTitle = ad.name;
  const adPrice = ad.price;
  const adViews = ad.views || 0;

  return (
    <div 
      className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border hover:bg-gray-50 transition border-none bg-[#F8F5E9] rounded-lg cursor-pointer"
      onClick={() => onView(ad)}
    >
      <img 
        src={adImage}
        alt={adTitle}
        className="w-12 h-12 sm:w-16 sm:h-16 object-cover flex-shrink-0 rounded-lg" 
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/64";
        }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm sm:text-base truncate hover:text-[#834d1a] transition">{adTitle}</h4>
        <div className="text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
          <span className="font-semibold text-[#834d1a]">SAR {adPrice}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">{adViews} views</span>
          </span>
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(ad);
          }}
          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          aria-label="Edit Advertisement"
        >
          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(ad);
          }}
          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          aria-label="Delete Advertisement"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

const ProfileDisplay = ({ userData, onEdit }) => (
  <div className="bg-white border-none p-6 rounded-lg">
    <div className="flex justify-between items-start mb-6">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <button 
        onClick={onEdit}
        className="flex items-center gap-2 text-[#834d1a] hover:bg-[#834d1a] hover:text-white px-4 py-2 rounded-lg transition"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-gray-500" />
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium">{userData.name}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-gray-500" />
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{userData.email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Phone className="w-5 h-5 text-gray-500" />
        <div>
          <p className="text-sm text-gray-500">Phone Number</p>
          <p className="font-medium">{userData.phone || 'Not specified'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-gray-500" />
        <div>
          <p className="text-sm text-gray-500">City</p>
          <p className="font-medium">{userData.location}</p>
        </div>
      </div>
      
      {userData.bio && (
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 mb-2">Bio</p>
          <p className="text-gray-700 leading-relaxed">{userData.bio}</p>
        </div>
      )}
    </div>
  </div>
);

const ProfileEdit = ({ userData, onSave, onCancel, loading, error, successMessage }) => {
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    location: userData.location || '',
    bio: userData.bio || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitFormData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitFormData.append(key, formData[key]);
      }
    });
    
    const fileInput = e.target.profileImage;
    if (fileInput.files[0]) {
      submitFormData.append('profileImage', fileInput.files[0]);
    }
    
    onSave(submitFormData);
  };

  return (
    <div className="bg-white border-none p-6 rounded-lg">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold">Edit Personal Information</h3>
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>

      {successMessage && (
        <div className="mb-4">
          <Alert message={successMessage} type="success" />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert message={error} type="error" />
        </div>
      )}
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 focus:ring-2 focus:ring-[#834d1a] outline-none border-none bg-[#F8F5E9] rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 focus:ring-2 focus:ring-[#834d1a] outline-none border-none bg-[#F8F5E9] rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="^05[0-9]{8}$"
              placeholder="05xxxxxxxx"
              className="w-full p-3 focus:ring-2 focus:ring-[#834d1a] outline-none border-none bg-[#F8F5E9] rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Example: 0512345678</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <select 
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 focus:ring-2 focus:ring-[#834d1a] outline-none border-none bg-[#F8F5E9] rounded-lg"
            >
              <option value="">Select City</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Write a brief bio about yourself..."
              className="w-full p-3 focus:ring-2 focus:ring-[#834d1a] outline-none border-none bg-[#F8F5E9] resize-none rounded-lg"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Profile Picture</label>
            <input 
              type="file"
              name="profileImage"
              accept="image/jpeg,image/png,image/jpg"
              className="w-full p-3 focus:ring-2 focus:ring-[#834d1a] outline-none border-none bg-[#F8F5E9] rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum size: 5MB. Supported formats: JPEG, PNG, JPG
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#834d1a] text-white px-6 py-2 rounded-lg hover:bg-[#6d3e15] transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default function AccountPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ads');
  const [isEditing, setIsEditing] = useState(false);
  const [userProducts, setUserProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState(null);
  
  const [deleteDialog, setDeleteDialog] = useState({ 
    isOpen: false, 
    product: null 
  });
  
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, product: null });
  const [editLoading, setEditLoading] = useState(false);
  
  const { user, loading, error, updateUserProfile, logout: contextLogout } = useUser();
  const { apiRequest } = useApi();

  const fetchUserProducts = useCallback(async () => {
    if (!user) {
      setUserProducts([]);
      return;
    }

    setProductsLoading(true);
    setLocalError(null);
    
    try {
      const result = await apiRequest('/api/products/user/my-products');
      
      if (result.error) {
        setLocalError(result.error);
        setUserProducts([]);
      } else {
        const products = Array.isArray(result.data) ? result.data : [];
        setUserProducts(products);
      }
    } catch (err) {
      setLocalError(err.message);
      setUserProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [apiRequest, user]);

  useEffect(() => {
    if (user && !loading && activeTab === 'ads') {
      fetchUserProducts();
    }
  }, [user, loading, fetchUserProducts, activeTab]);

  const handleViewProduct = useCallback((product) => {
    navigate(`/product/${product._id}`);
  }, [navigate]);

  const handleEditProduct = useCallback(async (formData) => {
    const productId = editModal.product._id;
    setEditLoading(true);
    setLocalError(null);

    try {
      const result = await apiRequest(`/api/products/${productId}`, {
        method: 'PUT',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (result.error) {
        setLocalError(result.error);
      } else {
        setUserProducts(prev => prev.map(p => 
          p._id === productId ? result.data : p
        ));
        setSuccessMessage('Updated successfully');
        setEditModal({ isOpen: false, product: null });
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setEditLoading(false);
    }
  }, [apiRequest, editModal.product]);

  const handleDeleteProduct = useCallback(async () => {
    const product = deleteDialog.product;
    setDeleteLoading(true);
    setLocalError(null);

    try {
      const result = await apiRequest(`/api/products/${product._id}`, {
        method: 'DELETE'
      });

      if (result.error) {
        setLocalError(result.error);
      } else {
        setUserProductssetUserProducts(prev => prev.filter(p => p._id !== product._id));
        setSuccessMessage('Deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setDeleteLoading(false);
      setDeleteDialog({ isOpen: false, product: null });
    }
  }, [apiRequest, deleteDialog.product]);

  const openEditModal = useCallback((product) => {
    setEditModal({ isOpen: true, product });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal({ isOpen: false, product: null });
    setLocalError(null);
  }, []);

  const openDeleteDialog = useCallback((product) => {
    setDeleteDialog({ isOpen: true, product });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ isOpen: false, product: null });
  }, []);

  const handleProfileUpdate = useCallback(async (formData) => {
    setProfileUpdateLoading(true);
    setLocalError(null);
    setSuccessMessage('');

    try {
      const result = await updateUserProfile(formData);
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setProfileUpdateLoading(false);
    }
  }, [updateUserProfile]);

  const handleLogout = useCallback(() => {
    setLogoutDialog(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setSuccessMessage('Logged out successfully');
    setLogoutDialog(false);
    setTimeout(() => {
      contextLogout();
    }, 1000);
  }, [contextLogout]);

  const closeLogoutDialog = useCallback(() => {
    setLogoutDialog(false);
  }, []);

  const userData = useMemo(() => {
    if (!user) return null;
    
    return {
      name: user.name || "Unknown User",
      email: user.email || "No email provided",
      phone: user.phone || "",
      location: user.location || "",
      bio: user.bio || "",
      joinDate: user.createdAt
        ? formatDistanceToNow(new Date(user.createdAt), {addSuffix: true})
        : "Unknown",
      avatar: user.profileImage || user.avatar || DEFAULT_AVATAR,
      rating: user.rating || 4.8,
      totalAds: userProducts.length,
      activeAds: userProducts.filter(ad => ad.status === 'active').length,
      totalViews: user.totalViews || 0,
      messages: user.messages || 0
    };
  }, [user, userProducts]);

  const renderMyAds = useCallback(() => {
    if (productsLoading) {
      return <LoadingSpinner message="Loading your advertisements..." />;
    }

    if (localError) {
      return (
        <div className="space-y-4">
          <Alert message={localError} type="error" />
          <button 
            onClick={fetchUserProducts}
            className="bg-[#834d1a] text-white px-4 py-2 rounded-lg hover:bg-[#6d3e15] transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (userProducts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 bg-[#F8F5E9] rounded-lg">
          <p className="text-lg">No advertisements found</p>
          <p className="text-sm mt-2">You haven't posted any advertisements yet</p>
          <button 
            onClick={() => window.location.href = '/addTrift'}
            className="mt-4 bg-[#834d1a] text-white px-4 py-2 rounded-lg hover:bg-[#6d3e15] transition"
          >
            Post Your First Ad
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {userProducts.map((ad, index) => (
          <AdCard 
            key={ad._id || index} 
            ad={ad} 
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            onView={handleViewProduct}
          />
        ))}
      </div>
    );
  }, [productsLoading, userProducts, localError, fetchUserProducts, openEditModal, openDeleteDialog, handleViewProduct]);

  const renderTabContent = useCallback(() => {
    if (!userData) return null;

    switch(activeTab) {
      case 'profile':
        return isEditing ? (
          <ProfileEdit 
            userData={userData}
            onSave={handleProfileUpdate}
            onCancel={() => setIsEditing(false)}
            loading={profileUpdateLoading}
            error={localError}
            successMessage={successMessage}
          />
        ) : (
          <ProfileDisplay 
            userData={userData}
            onEdit={() => setIsEditing(true)}
          />
        );

      case 'ads':
        return (
          <div className="bg-white border-none p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-6">
              <h3 className="text-lg font-semibold">My Advertisements</h3>
              <button 
                onClick={() => window.location.href = '/addTrift'}
                className="bg-[#834d1a] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#6d3e15] transition text-sm sm:text-base self-start sm:self-auto"
              >
                + Add New Ad
              </button>
            </div>

            {successMessage && (
              <div className="mb-4">
                <Alert message={successMessage} type="success" />
              </div>
            )}

            {renderMyAds()}
          </div>
        );

      default:
        return null;
    }
  }, [activeTab, userData, isEditing, handleProfileUpdate, profileUpdateLoading, localError, successMessage, renderMyAds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert message={error} type="error" />
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-[#834d1a] text-white py-2 rounded-lg hover:bg-[#6d3e15] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-[#834d1a] text-white px-6 py-2 rounded-lg hover:bg-[#6d3e15] transition"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <ProductEditModal
          product={editModal.product}
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          onSave={handleEditProduct}
          loading={editLoading}
          error={localError}
        />

        <ConfirmationDialog
          open={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteProduct}
          title="Delete Advertisement"
          message={`Are you sure you want to delete "${deleteDialog.product?.name || 'this advertisement'}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          confirmButtonStyle="danger"
          isLoading={deleteLoading}
          showIcon={true}
          size="sm"
        />

        <ConfirmationDialog
          open={logoutDialog}
          onClose={closeLogoutDialog}
          onConfirm={confirmLogout}
          title="Logout Confirmation"
          message="Are you sure you want to log out?"
          confirmText="Logout"
          cancelText="Stay Logged In"
          type="warning"
          confirmButtonStyle="danger"
          isLoading={false}
          showIcon={true}
          size="sm"
        />

        {successMessage && (
          <div className="mb-6">
            <Alert message={successMessage} type="success" />
          </div>
        )}

        <div className="bg-white border-none p-6 mb-6 rounded-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img 
              src={userData.avatar} 
              alt={userData.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#834d1a]"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {userData.location || 'Not specified'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {userData.joinDate}
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              activeTab === 'ads' 
                ? 'bg-[#834d1a] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Advertisements
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              activeTab === 'profile' 
                ? 'bg-[#834d1a] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Profile Information
          </button>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
}