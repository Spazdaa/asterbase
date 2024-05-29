import React from "react";
// import {
//   AiFillLinkedin,
//   AiOutlineInstagram,
//   AiOutlineTwitter,
// } from "react-icons/ai";
import { BsDiscord } from "react-icons/bs";
import { Link } from "react-router-dom";
// import { FaTiktok } from "react-icons/fa";

function Footer(): JSX.Element {
  return (
    <footer className="px-6 lg:px-12 lg:py-10 py-6 bg-green-800">
      <h1 className="text-white text-md lg:text-lg mb-3">
        Asterbase Labs Ltd.
      </h1>
      <div className="flex gap-3 items-center">
        {/* <a
          href="https://twitter.com/asterbasehq"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AiOutlineTwitter size={24} color="white" />
        </a>
        <a
          href="https://www.instagram.com/asterbase/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AiOutlineInstagram size={24} color="white" />
        </a>
        <a
          href="https://www.linkedin.com/company/asterbase"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AiFillLinkedin size={24} color="white" />
        </a>
        <a
          href="https://www.tiktok.com/@asterbase"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTiktok size={20} color="white" />
        </a> */}
        <a
          href="https://discord.com/invite/r5z6TUjhkH"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BsDiscord size={22} color="white" />
        </a>
        <Link to="/terms" className="text-white">
          Terms of Service
        </Link>
        <Link to="/privacy" className="text-white">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
