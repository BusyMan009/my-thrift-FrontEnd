import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import { faList, faShirt, faShoePrints, faGem, faCouch, faCompactDisc, faGamepad, faPalette, faBoxOpen } from "@fortawesome/free-solid-svg-icons";


export default function SearchSection(){


const categories = [
  { name: "All", icon: faList },
  { name: "Clothing", icon: faShirt },
  { name: "FootWear", icon: faShoePrints },
  { name: "Accessories", icon: faGem },
  { name: "Antiques", icon: faCouch },
  { name: "Decor", icon: faCouch },
  { name: "Media", icon: faCompactDisc },
  { name: "Games", icon: faGamepad },
  { name: "Art", icon: faPalette },
  { name: "Other", icon: faBoxOpen },
];




return(

       <div className="mb-12 mt-3   ">
        <div className='flex'>
      <button className='btn navbar-color1 border-none mt-5 mx-1 '>Search</button>
      <input style={{transition:"0.3s"}} type="text" placeholder="Type here" className="input bg-search mb-1 mt-6 w-full  " ></input> 
        </div>
<div 
  style={{scrollbarWidth: "thin",scrollbarColor:'#d4d2c9'}} 
  className="flex overflow-x-auto gap-4  pb-2 w-full mt-5"
>
  {categories.map((category, index) => (    
    <div 
      key={index}
      className="bg-search  min-w-25 px-4 py-3 active:shadow-xl hover:shadow-md cursor-pointer transition-all rounded-sm"
    >
      <span className="text-lg flex justify-center">
        <FontAwesomeIcon icon={category.icon} style={{ fontSize:"24px" }}/>
      </span>
      <p className="flex justify-center mt-2">{category.name}</p>
    </div>
  ))}
</div>


        
    
      </div>

);




}