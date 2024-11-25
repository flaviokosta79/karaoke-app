import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, MusicNote as MusicIcon, Settings as SettingsIcon } from '@mui/icons-material';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSession = location.pathname.includes('/session');

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:text-gray-300"
            >
              <HomeIcon className="h-6 w-6" />
              <span className="font-bold text-xl">Karaoke Social</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {isSession && (
              <>
                <button
                  onClick={() => {/* Handle queue */}}
                  className="flex items-center space-x-2 hover:text-gray-300"
                >
                  <MusicIcon className="h-6 w-6" />
                  <span>Queue</span>
                </button>
                <button
                  onClick={() => {/* Handle settings */}}
                  className="flex items-center space-x-2 hover:text-gray-300"
                >
                  <SettingsIcon className="h-6 w-6" />
                  <span>Settings</span>
                </button>
              </>
            )}
            {!isSession && (
              <button
                onClick={() => navigate('/setup')}
                className="flex items-center space-x-2 hover:text-gray-300"
              >
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
