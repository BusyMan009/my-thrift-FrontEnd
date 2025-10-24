import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import "./app.css"

export default function SelectLabels() {
  const [city, setCity] = React.useState('');

  const saudiCities = [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
    'Taif', 'Buraydah', 'Tabuk', 'Khamis Mushait', 'Hafar Al-Batin', 'Jubail', 'Yanbu',
    'Najran', 'Al Bahah', 'Arar', 'Sakaka', 'Jazan', 'Abha', 'Qatif', 'Al-Ahsa',
    'Zulfi', 'Rafha', 'Wadi Al-Dawasir', 'Al Dawadmi', 'Sabya', 'Al Majmaah', 'Al Qunfudhah',
    'Al Lith', 'Rabigh', 'Al Kharj', 'Al Muzahimiyah', 'Bisha', 'Al Hawiyah', 'Al Aflaj'
  ];

  const handleChange = (event) => {
    setCity(event.target.value);
  };

  return (
    <div>
      <FormControl sx={{ m: 1, minWidth: 220 }}>
        <InputLabel style={{ color: "black" }}>City</InputLabel>
        <Select
          value={city}
          onChange={handleChange}
          style={{
            background: "#F8F5E9",
            marginTop: "4px",
            color: "black",
            width: "220px"
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
              },
            },
          }}
        >
          <MenuItem value="">
            <em style={{ color: "black" }}>None</em>
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
    </div>
  );
}
