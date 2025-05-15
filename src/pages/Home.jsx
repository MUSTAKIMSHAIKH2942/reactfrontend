import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to Indent System</h1>
      <Link to="/form" className="text-blue-600 underline">Go to Indent Form</Link>
    </div>
  );
};

export default Home;
