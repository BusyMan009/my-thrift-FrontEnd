import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faShirt, faShoePrints, faGem, faCouch, faCompactDisc, faGamepad, faBoxOpen, faWineBottle, faPortrait } from "@fortawesome/free-solid-svg-icons";
import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import "./app.css"

export default function SearchSection({ onFiltersChange }) {
  const categories = [
    { name: "All", icon: faList },
    { name: "Clothing", icon: faShirt },
    { name: "FootWear", icon: faShoePrints },
    { name: "Accessories", icon: faGem },
    { name: "Antiques", icon: faWineBottle },
    { name: "Decor", icon: faCouch },
    { name: "Media", icon: faCompactDisc },
    { name: "Games", icon: faGamepad },
    { name: "Art", icon: faPortrait },
    { name: "Other", icon: faBoxOpen },
  ];

  const [city, setCity] = React.useState('');
  const [condition, setCondition] = React.useState('');

  const saudiCities = [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
    'Taif', 'Buraydah', 'Tabuk', 'Khamis Mushait', 'Hafar Al-Batin', 'Jubail', 'Yanbu',
    'Najran', 'Al Bahah', 'Arar', 'Sakaka', 'Jazan', 'Abha', 'Qatif', 'Al-Ahsa',
    'Zulfi', 'Rafha', 'Wadi Al-Dawasir', 'Al Dawadmi', 'Sabya', 'Al Majmaah', 'Al Qunfudhah',
    'Al Lith', 'Rabigh', 'Al Kharj', 'Al Muzahimiyah', 'Bisha', 'Al Hawiyah', 'Al Aflaj'
  ];

  const handleCityChange = (event) => {
    const selectedCity = event.target.value;
    setCity(selectedCity);
    onFiltersChange && onFiltersChange({ location: selectedCity });
  };

  const handleConditionChange = (selectedCondition) => {
    setCondition(selectedCondition);
    onFiltersChange && onFiltersChange({ condition: selectedCondition });
  };

  return (
    <div className="mb-5 mt-3 px-2 sm:px-4 lg:px-0">
      <div className="flex flex-col xl:flex-row gap-4">
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <button style={{color:"white"}} className="btn navbar-color1 border-none hidden lg:block w-full sm:w-auto py-3 sm:py-2">Search</button>
            <input 
              style={{transition:"0.3s", background:"#F8F5E9"}} 
              type="text" 
              placeholder="Type here" 
              className="input bg-search w-full"
              onChange={(e) => onFiltersChange && onFiltersChange({ search: e.target.value })}
            />
          </div>

          <div    
            style={{scrollbarWidth: "thin", scrollbarColor:"#d4d2c9"}}    
            className="flex overflow-x-scroll gap-4 pb-2 w-full mt-5" 
          >
            {categories.map((category, index) => (
              <div       
                key={index} 
                style={{color:"rgb(131, 77, 26)"}}
                className="bg-[#F8F5E9] hover:bg-[#d8d6d1] px-4 py-3 active:shadow-xl hover:shadow-md cursor-pointer transition-all flex-shrink-0 w-24 min-w-24"
                onClick={() => onFiltersChange && onFiltersChange({ category: category.name === "All" ? "" : category.name })}
              >
                <span className="text-lg flex justify-center">
                  <FontAwesomeIcon icon={category.icon} style={{ fontSize:"20px"}}/>
                </span>
                <p className="flex justify-center mt-2 text-xs text-center leading-tight">{category.name}</p>
              </div>
            ))}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-6 mt-5 mb-10 items-center">                
            {/* City Select */}
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel style={{ color: "black" }}>City</InputLabel>
              <Select
                value={city}
                onChange={handleCityChange}
                style={{
                  background: "#F8F5E9",
                  color: "black",
                }}
                sx={{
                  height: '40px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fcfbf9',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fcfbf9',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fcfbf9',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      backgroundColor: '#fcfbf9',
                      maxHeight: 300,
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em style={{ color: "black" }}>All Cities</em>
                </MenuItem>
                {saudiCities.map((cityName, index) => (
                  <MenuItem
                    key={index}
                    value={cityName}
                    style={{
                      backgroundColor: "#fcfbf9",
                      color: "black"
                    }}
                  >
                    {cityName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Condition Radio Buttons */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Condition:</span>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value="Used"
                  checked={condition === 'Used'}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="radio radio-sm"
                  style={{borderColor: '#834d1a'}}
                />
                <span className="text-sm">Used</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value="New"
                  checked={condition === 'New'}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="radio radio-sm"
                  style={{borderColor: '#834d1a'}}
                />
                <span className="text-sm">New</span>
              </label>

              {condition && (
                <button
                  onClick={() => handleConditionChange('')}
                  className="text-xs text-gray-500 hover:text-[#834d1a] underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden 2xl:block w-80">
          <div className="bg-[#F8F5E9] p-4 mb-4">
            <h3 className="font-semibold mb-3">Popular Categories</h3>
            <div className="space-y-2">
              <div 
                className="flex items-center justify-between p-2 bg-white cursor-pointer hover:bg-gray-50"
                onClick={() => onFiltersChange && onFiltersChange({ category: "Clothing" })}
              >
                <span className="text-sm">Clothing</span>
                <span className="text-xs text-gray-500">1#</span>
              </div>
              <div 
                className="flex items-center justify-between p-2 bg-white cursor-pointer hover:bg-gray-50"
                onClick={() => onFiltersChange && onFiltersChange({ category: "Games" })}
              >
                <span className="text-sm">Games</span>
                <span className="text-xs text-gray-500">2#</span>
              </div>
              <div 
                className="flex items-center justify-between p-2 bg-white cursor-pointer hover:bg-gray-50"
                onClick={() => onFiltersChange && onFiltersChange({ category: "Accessories" })}
              >
                <span className="text-sm">Accessories</span>
                <span className="text-xs text-gray-500">3#</span>
              </div>
              <div 
                className="flex items-center justify-between p-2 bg-white cursor-pointer hover:bg-gray-50"
                onClick={() => onFiltersChange && onFiltersChange({ category: "Media" })}
              >
                <span className="text-sm">Media</span>
                <span className="text-xs text-gray-500">4#</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}