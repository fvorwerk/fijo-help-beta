import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="text-sm text-gray-600 py-2 px-4 bg-gray-100 rounded-md">
      <ul className="flex space-x-2">
        <li>
          <Link to="/dashboard" className="text-blue-600 hover:underline">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          return (
            <li key={to} className="flex items-center">
              <span className="mx-1">/</span>
              <Link to={to} className="text-blue-600 hover:underline capitalize">{value}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Breadcrumbs;
