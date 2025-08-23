import './App.css'
import Navbar from './Navbar'
import SearchSection from './SearchSection'
import Card from './Card'

function App() {
  return (
    <div className='bg-white'>
      {/* Top navigation bar */}
      <Navbar />

      {/* Main content wrapper */}
      <div className="bg-white w-11/12 min-h-screen mx-auto" dir="ltr">
        <div className='flex w-full'>
          
          {/* Left column: search + card */}
          <div className='w-full mx-auto sm:w-5/6'>
            
            {/* Search input & categories section */}
            <SearchSection />

            {/* Example card below the search section */}
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3.5 gap-y-4'>
              {/* Cards will be placed here */}
              <Card/>
              <Card/>
              <Card/>
              <Card/>
              <Card/>
              <Card/>
              <Card/>
              <Card/>

              <Card/>
              <Card/>
              <Card/>

              <Card/>
              <Card/>
              <Card/>


              <Card/>
              <Card/>
              <Card/>
              <Card/>


              <Card/>
              <Card/>
              
            </div>
          </div>

          {/* Right column: placeholder content */}
          <div className='hidden xl:block sm:w-3/12 m-4 mt-10 navbar-color2 p-5 h-fit'>
            <h2 className='font-bold text-lg mb-4 flex justify-center'>Filters</h2>

            {/* Price Filter */}
            <div className='mb-4'>
              <h3 className='font-semibold mb-2'>Price</h3>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                className='w-full'
              />
              <div className='flex justify-between text-sm mt-1'>
                <span>0 SAR</span>
                <span>1000 SAR</span>
              </div>
            </div>

            {/* Condition Filter */}
            <div className='mb-4'>
              <h3 className='font-semibold mb-2'>Condition</h3>
              <div className='flex flex-col gap-1'>
                <label className='flex items-center gap-2'>
                  <input type="checkbox" />
                  New
                </label>
                <label className='flex items-center gap-2'>
                  <input type="checkbox" />
                  Used
                </label>
              </div>
            </div>

            {/* Category Filter */}
            <div className='mb-4'>
              <h3 className='font-semibold mb-2'>Category</h3>
              <select className='w-full border rounded p-1'>
                <option>All</option>
                <option>Clothing</option>
                <option>Footwear</option>
                <option>Accessories</option>
                <option>Home Decor</option>
                <option>Collectibles</option>
              </select>
            </div>

            <button className='btn navbar-color1 border-none w-full mt-2'>Apply Filters</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
