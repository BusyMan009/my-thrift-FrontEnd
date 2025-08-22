export default function SearchSection(){

  const categories = [
    'الكل', 'طعام', 'تسوق', 'سفر', 'رياضة', 'تعليم', 'صحة', 'تقنية','طعام', 'تسوق', 'سفر', 'رياضة', 'تعليم', 'صحة', 'تقنية'
  ];


return(

       <div className="mb-12 mt-3   ">
      <button className='btn navbar-color1 border-none mt-5 mx-1 '>Search</button>
      <input type="text" placeholder="Type here" className="input bg-search mb-1 mt-6 sm:w-3/6 " ></input> 
        
<div 
  style={{scrollbarWidth: "thin",scrollbarColor:'#d4d2c9'}} 
  className="flex overflow-x-auto gap-4 pb-2 w-full w-fill mt-5"
>
  {categories.map((category, index) => (
    <div 
      key={index}
      className="bg-search  sm:min-w-fit px-4 py-3 hover:shadow-md cursor-pointer transition-all rounded-sm"
    >
      <span className="text-lg">🏷️</span>
      <p>{category}</p>
    </div>
  ))}
</div>

        
    
      </div>

);




}