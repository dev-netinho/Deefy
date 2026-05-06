import { IoMdHome, IoMdSearch } from "react-icons/io";
import { MdOutlineLibraryMusic, MdPlaylistPlay } from "react-icons/md";
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import logo from '../assets/logo.svg'
import './home.css'
import { Link } from 'react-router-dom'
import { useState } from "react";

function Home() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Sidebar
      className="sidebar"
      collapsed={collapsed}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div className="sidebar-logo">
        <img src={logo} alt="Logo Deefy" />
      </div>
      <Menu className='contents'
        menuItemStyles={{
          button: {
            [`&.active`]: {
              backgroundColor: '#13395e'
            },
          },
        }}
      >
        <MenuItem component={<Link to="/home" />}> <IoMdHome /> Home</MenuItem>
        <MenuItem component={<Link to="/search" />}> <IoMdSearch /> Pesquisa</MenuItem>
        <MenuItem component={<Link to="/library" />}> <MdOutlineLibraryMusic /> Biblioteca</MenuItem>
        <MenuItem component={<Link to="/library/playlists" />}> <MdPlaylistPlay /> Playlists</MenuItem>
      </Menu>
    </Sidebar>
  );
}

export default Home;
