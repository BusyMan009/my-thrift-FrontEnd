import "./app.css"
export default function Navbar(){
    return(
          <div className=" navbar-color1  ">
        <div className='navbar  w-4/5 mx-auto'>
        
        {/* شعار الموقع على اليمين */}
        <div className="navbar-start w-1/5">
          <a className="btn btn-ghost text-xl">MY Thrift</a>
        </div>

        {/* قائمة التنقل في الوسط */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><a>Home</a></li>
            <li><a>Products</a></li>
            <li><a>Contact Us</a></li>
          </ul>
        </div>

        {/* صورة المستخدم على اليسار */}
        <div className="navbar-end w-4/6">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="User Avatar"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li><a>Settings</a></li>
              <li><a>Logout</a></li>
            </ul>
          </div>
        </div>
        </div>
      </div>
    )
}