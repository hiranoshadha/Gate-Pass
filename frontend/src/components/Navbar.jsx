import React, { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, Menu, X, ChevronsRightLeft } from 'lucide-react';
import loginImage from "../assets/SLTMobitel_Logo.svg";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {useToast} from "../components/ToastProvider"

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const {showToast} = useToast();

  
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    
    const trimmedRole = storedRole ? storedRole.trim() : "";
    
    setUserRole(trimmedRole);
  }, [location.pathname]); 

  const isLoginPage = location.pathname === "/";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setUserRole("");
    showToast("Logout successful!", "success");
    navigate("/");
  };

  const getMenuItems = () => {
    
    switch (userRole) {
      case "SuperAdmin":
        return [
          { title: "New Request", path: "/newrequest" },
          { title: "My Request", path: "/myrequests" },
          { title: "Executive Approve", path: "/executiveApproval" },
          { title: "Verify", path: "/verify" },
          { title: "Pleader", path: "/dispatch" },
          { title: "Receive", path: "/receive" },
          { title: "My Receipt", path: "/myReceipts" },
          { title: "Item Tracker", path: "/itemTracker" },
          { title: "Admin", path: "/admin" },
          //{ title: "EmailForm", path: "/emailForm" }
        ];
      case "Admin":
        return [
          { title: "New Request", path: "/newrequest" },
          { title: "My Request", path: "/myrequests" },
          { title: "Executive Approve", path: "/executiveApproval" },
          { title: "Verify", path: "/verify" },
          { title: "Pleader", path: "/dispatch" },
          { title: "Receive", path: "/receive" },
          { title: "My Receipt", path: "/myReceipts" },
          { title: "Item Tracker", path: "/itemTracker" },
          { title: "Admin", path: "/admin" },
          //{ title: "EmailForm", path: "/emailForm" }
        ];
      case "User":
        return [
          { title: "New Request", path: "/newrequest" },
          { title: "My Request", path: "/myrequests" },
          { title: "Item Tracker", path: "/itemTracker" },
        ];
      case "Approver":
        return [
          { title: "New Request", path: "/newrequest" },
          { title: "My Request", path: "/myrequests" },
          { title: "Executive Approve", path: "/executiveApproval" },
          { title: "Item Tracker", path: "/itemTracker" },
        ];
      case "Verifier":
        return [
          { title: "New Request", path: "/newrequest" },
          { title: "My Request", path: "/myrequests" },
          { title: "Verify", path: "/verify" },
          { title: "Item Tracker", path: "/itemTracker" },
        ];
      case "Pleader":
        return [
          { title: "New Request", path: "/newrequest" },
          { title: "My Request", path: "/myrequests" },
          { title: "Pleader", path: "/dispatch" },
          { title: "Item Tracker", path: "/itemTracker" },
        ];
        case "Dispatcher":
        return [
          { title: "New Request", path: "/newrequest" },
          { title: "My Request", path: "/myrequests" },
          { title: "Receive", path: "/receive" },
          { title: "Item Tracker", path: "/itemTracker" },
        ];
      default:
        
        return [
          { title: "New Request", path: "/newrequest" },
          { title: "My Request", path: "/myrequests" },
        ];
    }
  };

  const menuItems = getMenuItems();
  

  return (
    <nav className="fixed w-full h-20 z-20 top-0 left-0 bg-white dark:bg-slate-900 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex items-center justify-between">
          
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img src={loginImage} className="h-10 mr-3 rounded-lg transform group-hover:scale-105 transition-transform duration-300" alt="Logo" />
              <div className="absolute inset-0 bg-blue-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
          </Link>

      

          
          {!isLoginPage && (
            <div className="hidden md:flex items-center space-x-2 flex-1 justify-center">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out relative group"
                >
                  {item.title}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>
          )}

          
          {!isLoginPage && (
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center !mt-0 gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
              >
                <LogOut size={20} className="transform group-hover:rotate-12 transition-transform duration-300" />
                <span>Logout</span>
              </button>
            </div>
          )}

         
          {!isLoginPage && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        
        {!isLoginPage && (
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
            <ul className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              
              
              <li className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;