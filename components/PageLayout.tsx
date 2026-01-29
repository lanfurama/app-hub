import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

/**
 * Wraps route content with page-enter animation on navigation.
 * Uses location.pathname as key so each route change remounts and replays the animation.
 */
export const PageLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-enter">
      <Outlet />
    </div>
  );
};
