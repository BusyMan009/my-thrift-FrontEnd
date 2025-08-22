import './App.css'
import Navbar from './Navbar'
import SearchSection from './SearchSection'

function App() {
  return (
    <div className='bg-white'>
      <Navbar/>
      <div className="bg-white w-4/5 min-h-screen mx-auto" dir="ltr">

        <div className='flex w-full'>
          
          {/* العمود الأيسر */}
          <div className='w-full mx-auto sm:w-4/6'>
            <SearchSection/>

            {/* الكارد تحت البحث */}
            <div className="card bg-base-100 w-96 shadow-sm mt-8">
              <figure>
                <img
                  src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                  alt="Shoes" 
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">Card Title</h2>
                <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Buy Now</button>
                </div>
              </div>
            </div>
            
          </div>

          
          

          {/* العمود الأيمن */}
          <div className='w-0 sm:w-2/6'>
            <h1>try to</h1>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
