import Card from "./Card";
import './HomePage.css'
import { useNavigate } from "react-router-dom";
import SearchSection from "./SearchSection";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import API_BASE_URL from "./config/api";
import { useUser } from './contexts/UserContext';
import { useProducts } from './contexts/ProductsContext';
import { useLayoutEffect } from 'react';


const PRODUCTS_PER_PAGE = 20;

// API HOOK
const useApi = () => {
  const apiRequest = useCallback(async (url, options = {}) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${url}`,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...options.headers
        },
        ...options,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message || 'Error loading data'
      };
    }
  }, []);

  return { apiRequest };
};

// LOADING COMPONENT
const LoadingSpinner = ({ message = "Loading products..." }) => (
  <div className="col-span-full text-center py-8">
    <div className="loading loading-spinner loading-lg" style={{ borderTopColor: '#834d1a' }}></div>
    <p className="mt-2" style={{ color: '#834d1a' }}>{message}</p>
  </div>
);

// ERROR COMPONENT
const ErrorMessage = ({ error, onRetry }) => (
  <div className="col-span-full text-center py-8">
    <p className="text-red-500 mb-4">Error: {error}</p>
    <button onClick={onRetry} className="btn btn-outline">Try Again</button>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { 
    products, 
    loading, 
    error, 
    pagination,
    setProducts, 
    appendProducts,
    setLoading,
    setError,
    setPagination
  } = useProducts();



  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });
  
  const { apiRequest } = useApi();
  const hasRestoredScroll = useRef(false);


  // BUILD QUERY PARAMS
  const buildQueryParams = useCallback((page = 1) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', PRODUCTS_PER_PAGE.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value);
      }
    });
    
    return params.toString();
  }, [filters]);

  // NAVIGATE TO ADD PRODUCT
  const handleAddProduct = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/addTrift");
    } else {
      navigate("/addTrift");
    }
  }, [isAuthenticated, navigate]);

  // NAVIGATE TO PRODUCT DETAIL
  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  // FETCH PRODUCTS
  const fetchProducts = useCallback(async (page = 1, loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }
    
    const queryParams = buildQueryParams(page);
    const { data, error: apiError } = await apiRequest(`/api/products?${queryParams}`);
    
    if (apiError) {
      setError(apiError);
      if (!loadMore) {
        setProducts([]);
        setPagination(null);
      }
    } else {
      if (data && typeof data === 'object' && data.data && data.pagination) {
        if (loadMore) {
          appendProducts(data.data);
        } else {
          setProducts(data.data);
        }
        setPagination(data.pagination);
      } else {
        const productsArray = Array.isArray(data) ? data : [];
        if (loadMore) {
          appendProducts(productsArray);
        } else {
          setProducts(productsArray);
        }
        setPagination(null);
      }
    }
    
    setLoading(false);
    setLoadingMore(false);
  }, [apiRequest, buildQueryParams, setProducts, appendProducts, setLoading, setError, setPagination]);

  // INITIAL LOAD - SHOW LOADING IF NO PRODUCTS
  useEffect(() => {
    if (products.length === 0 && !loading) {
      setLoading(true);
      setCurrentPage(1);
      fetchProducts(1, false);
    }
  }, []);

  // RE-FETCH ON FILTER CHANGE
  useEffect(() => {
    setCurrentPage(1);
    hasRestoredScroll.current = false;
    fetchProducts(1, false);
  }, [filters]);

  // LOAD MORE
  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.hasNext && !loadingMore) {
      const nextPage = pagination.currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [fetchProducts, pagination, loadingMore]);

  // MEMOIZED CARDS
  const cardComponents = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    return products.map((product) => {
      const timeAgo = product.createdAt 
        ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })
        : 'Unknown time';

      return (
        <Card 
          key={product._id || Math.random()}
          title={product.name || 'No title'} 
          condition={product.condition || 'Not specified'} 
          time={timeAgo} 
          location={product.location || 'Not specified'} 
          category={product.category || 'Uncategorized'} 
          price={product.price || 0} 
          img={product.images?.[0] || product.image || 'https://via.placeholder.com/300x200'}
          onClick={() => handleProductClick(product._id)}
        />
      );
    });
  }, [products, handleProductClick]);

  // UPDATE FILTERS
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // RETRY
  const handleRetry = useCallback(() => {
    setCurrentPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // RENDER GRID
  const renderGridContent = useCallback(() => {
    if (loading) return <LoadingSpinner message="Loading products..." />;
    if (error) return <ErrorMessage error={error} onRetry={handleRetry} />;
    if (cardComponents.length === 0) return <LoadingSpinner message="Loading products..." />;
    return cardComponents;
  }, [loading, error, cardComponents, handleRetry]);

  return (
    <div>
      <div className="bg-white w-full min-h-screen mx-auto" dir="ltr">
        <div className='flex w-full'>
          <div className='w-full mx-auto sm:w-11/12'>
            
            <SearchSection onFiltersChange={updateFilters} />

            <hr style={{opacity:"20%", width:"95%"}} className='mx-auto' />

            <div className="flex justify-end mx-5">
              <button 
                style={{color:"white", background:"#834d1a"}} 
                className='btn navbar-color text-lg shadow-none rounded-sm active:shadow-2xl w-52 mt-5 hover:bg-opacity-90 transition-all duration-200 border-none'
                onClick={handleAddProduct}
              >
                Add Product +
              </button>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3.5 gap-y-4 mt-10 px-5'>
              {renderGridContent()}
            </div>

            {loadingMore && (
              <div className="text-center mt-4">
                <div className="loading loading-spinner loading-md" style={{ borderTopColor: '#834d1a' }}></div>
                <p className="text-sm mt-2" style={{ color: '#834d1a' }}>Loading more...</p>
              </div>
            )}

            {!loading && !error && cardComponents.length > 0 && (
              <>
                {pagination && pagination.hasNext && (
                  <div className="text-center mt-8 mb-20">
                    <button 
                      className="btn btn-outline"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{ borderColor: '#834d1a', color: '#834d1a' }}
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
                
                {pagination && !pagination.hasNext && (
                  <div className="text-center mt-8 mb-20 text-gray-500">
                    <p>You've reached the end!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}