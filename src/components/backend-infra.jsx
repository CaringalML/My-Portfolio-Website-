import React from 'react';
import { useNavigate } from 'react-router-dom';

const Backend = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/')}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back to Portfolio
      </button>
      <h1 className="text-3xl font-bold mb-6">
        Student Record System Laravel RESTful API AWS Infrastructure
      </h1>
      {/* Add your backend project details here */}
    </div>
  );
};

export default Backend;