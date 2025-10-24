import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Camera, MapPin, Tag, DollarSign, FileText, Package, Sparkles, Check, AlertCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './config/api';

const AddThriftPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    condition: 'New',
    category: '',
    location: '',
    phoneNumber: ''
  });
  const [useUserPhone, setUseUserPhone] = useState(true);
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.phone) {
          setUserPhoneNumber(user.phone);
          setFormData(prev => ({ ...prev, phoneNumber: user.phone }));
        } else {
          setUseUserPhone(false);
        }
      }
    } catch (error) {
      setUseUserPhone(false);
    }
  }, []);

  const conditions = [
    { value: 'New', label: 'New', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'Used', label: 'Used', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  ];

  const categories = [
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

  const saudiCities = [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
    'Taif', 'Buraydah', 'Tabuk', 'Khamis Mushait', 'Hafar Al-Batin', 'Jubail', 'Yanbu',
    'Najran', 'Al Bahah', 'Arar', 'Sakaka', 'Jazan', 'Abha', 'Qatif', 'Al-Ahsa',
    'Zulfi', 'Rafha', 'Wadi Al-Dawasir', 'Al Dawadmi', 'Sabya', 'Al Majmaah', 'Al Qunfudhah',
    'Al Lith', 'Rabigh', 'Al Kharj', 'Al Muzahimiyah', 'Bisha', 'Al Hawiyah', 'Al Aflaj'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePhoneToggle = () => {
    const newUseUserPhone = !useUserPhone;
    setUseUserPhone(newUseUserPhone);
    
    if (newUseUserPhone && userPhoneNumber) {
      setFormData(prev => ({ ...prev, phoneNumber: userPhoneNumber }));
    } else if (!newUseUserPhone) {
      setFormData(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages = validFiles.slice(0, 10 - images.length).map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.location || !formData.phoneNumber || images.length === 0) {
      setError('Please fill all required fields including phone number and add images');
      return;
    }

    const phoneRegex = /^(\+966|966|05)[0-9]{8}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid Saudi phone number (e.g., +966501234567 or 0501234567)');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('condition', formData.condition);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('phoneNumber', formData.phoneNumber);
    
    images.forEach((image) => {
      formDataToSend.append('images', image.file);
    });
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setIsSubmitting(false);
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/products`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201 || response.status === 200) {
        setSubmitSuccess(true);
        
        setTimeout(() => {
          navigate('/account');
        }, 3000);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.error || 'An error occurred while adding the product');
      } else {
        setError('Connection error with server');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div style={{background:"#F8F5E9"}} className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-[#F8F5E9] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-[#834d1a]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Successfully Created!</h2>
          <p className="text-gray-600 mb-6">Your product has been added successfully</p>
          <div className="w-full bg-[#F8F5E9] rounded-full h-2">
            <div className="bg-[#834d1a] h-2 rounded-full w-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Redirecting to your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"#F8F5E9"}} className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Product
          </h1>
          <p className="text-gray-600">Fill out the form below to add a new product to your store</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 ml-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div style={{background:"#F8F5E9"}} className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Camera style={{color:"#834d1a"}} className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
                <p className="text-sm text-gray-600">Add up to 10 images for your product</p>
              </div>
              <div className="mr-auto">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  {images.length}/10
                </span>
              </div>
            </div>
            
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-[#834d1a] bg-[#F8F5E9]' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`w-10 h-10 mx-auto mb-4 ${dragActive ? 'text-[#834d1a]' : 'text-gray-400'}`} />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Drag images here</h3>
              <p className="text-gray-500 mb-4">Or click to select images from your device</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{background:"#834d1a", color:"white"}}
                className="hover:bg-[#6d3e15] px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
              >
                Select Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div style={{background:"#F8F5E9"}} className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Package style={{color:"#834d1a"}} className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
                <p className="text-sm text-gray-600">Fill in the basic product information</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-[#834d1a] transition-colors duration-200"
                  placeholder="Enter product name..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  Price (SAR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-[#834d1a] transition-colors duration-200"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Package className="w-4 h-4" />
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-[#834d1a] transition-colors duration-200"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4" />
                  City *
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-[#834d1a] transition-colors duration-200"
                  required
                >
                  <option value="">Select City</option>
                  {saudiCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4" />
                  Contact Phone Number *
                </label>
                {userPhoneNumber && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Use my phone number</span>
                    <button
                      type="button"
                      onClick={handlePhoneToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useUserPhone ? 'bg-[#834d1a]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useUserPhone ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
              
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={useUserPhone && userPhoneNumber}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
                  useUserPhone && userPhoneNumber
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'focus:ring-2 focus:ring-[#834d1a] focus:border-[#834d1a]'
                }`}
                placeholder="Enter phone number (e.g., +966501234567 or 0501234567)"
                required
              />
              {useUserPhone && userPhoneNumber && (
                <p className="text-sm text-gray-500">Using your account phone number</p>
              )}
            </div>

            <div className="space-y-4 mt-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Sparkles className="w-4 h-4" />
                Product Condition *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {conditions.map(condition => (
                  <label
                    key={condition.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all duration-200 hover:shadow-sm ${
                      formData.condition === condition.value
                        ? 'bg-[#F8F5E9] text-[#834d1a] border-[#834d1a]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <span className="font-medium">{condition.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4" />
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#834d1a] focus:border-[#834d1a] transition-colors duration-200 resize-none"
                placeholder="Write a detailed description of the product (optional)..."
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#9ca3af' : '#834d1a',
                  color: 'white'
                }}
                className={`w-full py-3.5 rounded-lg font-semibold transition-all duration-200 ${
                  isSubmitting
                    ? 'cursor-not-allowed'
                    : 'hover:bg-[#6d3e15] focus:ring-4 focus:ring-[#834d1a]/20'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Add Product'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddThriftPage;