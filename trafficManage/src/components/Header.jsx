import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';

export default function Header(props) {

  const [input, setInput] = useState("");
  const Navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  function handleChange(e){
    setInput(e.target.value);
  }
  function handleSubmit(e){
    e.preventDefault();
    props.onSearch(input);
    setInput("");

  }
  return (
    <div className=' flex justify-between items-center'>
      {location.pathname === "/" ? (
        <h1 className='font-bold text-2xl' >Hello Officer {props.name}  </h1>
        ): (
        <h1 className='font-bold text-2xl' >Traffic Management System </h1>
        )}
        
        <p className='font-bold text-xl'> Time : {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} </p>
       {location.pathname === "/Dashboard" && (
        <form onSubmit={handleSubmit} className='flex items-center'>
          <input
            type="text"
            className='bg-[#D9D9D9] text-black rounded-4xl mr-6 p-3 w-60 text-sm'
            placeholder='Search the area'
            value={input}
            onChange={handleChange}
          />
          <button
            type="submit"
            className='p-2 rounded hover:bg-[#78B159]'
          >
            Search
          </button>
        </form>
      )}
      <img src="/assets/gg_profile.png" className='w-10 h-10' alt="" />
    </div>
  )
}
