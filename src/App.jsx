import './App.css'
import Navbar from './Navbar'
import FixedBottomNavigation from './FixedBottomNavigation'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Footer from './Footer'
import HomePage from './HomePage'
import Favorites from './Favorites'
import ResetPassword from './ResetPassword'
import { UserProvider } from './contexts/UserContext'
import { ProductsProvider } from './contexts/ProductsContext';
import SellerProfile from './SellerProfile';
import { Suspense, lazy, useEffect } from 'react'

const ChatPage = lazy(() => import('./ChatPage'))
const AccountInfo = lazy(() => import('./AccountIfo'))
const SingUp = lazy(() => import('./SignUp'))
const AddThriftPage = lazy(() => import('./AddThriftPag'))
const ProductDetailPage = lazy(() => import('./ProductDetailPage'))

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
)

const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return null;
};

const Layout = ({ children }) => {
  const location = useLocation()
  const isChatPage = location.pathname.startsWith('/chat')

  return (
    <>
      <ScrollToTop />
      
      {!isChatPage && <Navbar />}

      {children}

      {!isChatPage && (
        <div className='sm:hidden block'>
          <FixedBottomNavigation />
        </div>
      )}

      {!isChatPage && <Footer />}
    </>
  )
}

function App() {
  return (
    <div className='bg-white h-screen'>
      <UserProvider>
        <ProductsProvider>
          <BrowserRouter>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path='/' element={<HomePage/>}/>
                  <Route path="/chat/:chatId?" element={<ChatPage />} />
                  <Route path='/Account' element={<AccountInfo />}/>
                  <Route path='/login' element={<SingUp />}/>
                  <Route path='/addTrift' element={<AddThriftPage />}/>
                  <Route path='/product/:id' element={<ProductDetailPage />}/>
                  <Route path='/favorites' element={<Favorites/>} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/seller/:sellerId" element={<SellerProfile />} />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </ProductsProvider>
      </UserProvider>
    </div>
  )
}

export default App