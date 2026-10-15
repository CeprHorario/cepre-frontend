import React from 'react';
import { useNavigate } from "react-router-dom";

const Button = ({ path, title, img, handleClick }) => {
  return (
    <button
      onClick={() => handleClick(path)}
      className="flex flex-col items-center justify-center w-56 h-60 bg-gray-200 rounded-xl shadow-lg hover:bg-gray-300 transition-all cursor-pointer"
    >
      <img src={img} alt={title} className="w-16 h-16 mb-3" />
      <p className="text-lg font-semibold">{title}</p>
    </button>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const options = [
    { path: 'generar', title: 'Generar Proceso', img: 'validar.png' },
    { path: 'gestionar', title: 'Gestionar Datos', img: 'gestionar.png' },
    { path: 'importar', title: 'Importar Archivos', img: 'importar.png' },
    { path: 'configuracion', title: 'Configurar Sistema', img: 'gestionar.png' }
    
  ];

  const handleClick = (path) => {
    navigate(`${path}`);
  };

  return (
    <div className="md:m-5 select-none">
      <div className="w-full min-h-screen md:min-h-[82vh] flex flex-col items-center justify-center bg-[#F4F4F4] md:rounded-lg">  
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-16 gap-y-8 p-4 w-full ">
          {options.map((option, index) => (
            <div key={index} className="sm:mx-2 flex justify-center"> {/* Added flex justify-center for mobile */}
              <Button
                path={option.path}
                title={option.title}
                img={option.img}
                handleClick={handleClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
