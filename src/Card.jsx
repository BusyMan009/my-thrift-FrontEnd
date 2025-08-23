import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLocationDot } from '@fortawesome/free-solid-svg-icons';

export default function Card(){
      const riyal = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-saudi-riyal-icon lucide-saudi-riyal"><path d="m20 19.5-5.5 1.2"/><path d="M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2"/><path d="m2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2"/><path d="M20 10 4 13.5"/></svg>

    return(
                    <div style={{transition:"0.3s"}} className="card w-full navbar-color2 shadow-sm mt-8 p-2 cursor-pointer hover:shadow-lg active:shadow-2xl  ">
              <figure>
                <img className='min-w-full'
                  src="https://thumbcdn.haraj.com.sa/1800x1012_45335385-6E78-4999-ADEA-66942B87E17A.jpg-140x140.webp"
                  alt="Shoes" 
                />
              </figure>
              <div className="card-body px-0">
                <h2 dir='auto' className="card-title truncate navbar-color-c ">old Envirmoint</h2>
                <hr style={{opacity:"20%"}}/>
                <span   className="text-sm font-semibold">Condition: <span style={{color:"#9c9a91"}}>new</span></span>


                  <span className="flex items-center text-sm text-gray-500">
          <FontAwesomeIcon icon={faClock} className="mr-1" />
          <span style={{color:"#9c9a91"}}>2 hours ago</span>
        </span>

        {/* loc */}
        <span className="flex items-center text-sm text-gray-500">
          <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
          <span style={{color:"#9c9a91"}} >Riyadh</span>
        </span>
      

                
                <div className="card-actions flex justify-between  items-center mx-0 mt-3">
                  <div className="badge navbar-color1 border-none mx-2 p-4">FootWear</div>
                  <button   className=" mt-1  border-none flex mx-6"> <span className='text-2xl '>30000</span> <span className='pt-1'>{riyal}</span></button>
                </div>
              </div>
            </div>
    );
}