import React, { useState, useEffect } from 'react';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated by checking the presence of the access token
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div>
      <h1>Welcome to MyList!</h1>
    </div>
  );
}

export default Home;
