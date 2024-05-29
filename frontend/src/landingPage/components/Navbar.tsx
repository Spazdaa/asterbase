import React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { GrClose } from "react-icons/gr";
import { Link, useNavigate } from "react-router-dom";

import logo from "img/logo_large_transparent.png";

function Navbar(): JSX.Element {
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  function handleClickOutsideDropdown(e: MouseEvent): void {
    // Checks if the dropdown exists (!null) and if there is a click outside the dropdown
    if (
      dropdownRef.current != null &&
      !dropdownRef.current.contains(e.target as Element)
    ) {
      setDropdownVisible(false);
    }
  }

  function handleXButton(): void {
    setDropdownVisible(false);
  }

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideDropdown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, []);

  return (
    <nav className="bg-white px-6 py-6 lg:px-16 flex justify-between">
      <Link to="/" className="display flex gap-3 items-center">
        <img src={logo} alt="logo" className="w-7 h-7" />
        <h1 className="text-2xl font-semibold text-black">Asterspark</h1>
      </Link>
      <ul className="lg:flex lg:items-center text-md lg:gap-6 lg:visible hidden">
        <li>
          <Link to="/our-story">Our Story</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/pricing">Pricing</Link>
        </li>
        <li>
          <a
            href="https://discord.com/invite/r5z6TUjhkH"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <button
          className="bg-green-700 text-white lg:py-2 lg:px-7 rounded-md"
          onClick={() => {
            navigate("/login");
          }}
        >
          Get Started
        </button>
      </ul>

      {/* Small screen hamburger menu */}
      <div className="relative lg:invisible lg:absolute">
        <button
          onClick={() => {
            setDropdownVisible(true);
          }}
        >
          <GiHamburgerMenu size={28} />
        </button>
        {dropdownVisible && (
          <div
            ref={dropdownRef}
            className="absolute w-40 right-0 top-0 bg-white shadow-sm p-4 border-2 border-gray-200"
          >
            <ul className="flex flex-col items-end text-md gap-4">
              <button onClick={handleXButton} className="">
                <GrClose />
              </button>
              <li>
                <Link to="/our-story">Our Story</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
              <li>
                <a
                  href="https://discord.com/invite/r5z6TUjhkH"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <button
                className="bg-green-700 text-white py-1 px-4 rounded-md"
                onClick={() => {
                  navigate("/login");
                }}
              >
                Get Started
              </button>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
