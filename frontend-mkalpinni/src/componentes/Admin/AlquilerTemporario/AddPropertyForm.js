import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';

const AddPropertyForm = ({ onAddProperty }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [services, setServices] = useState([]);
  const [priceNight, setPriceNight] = useState('');
  const [priceWeek, setPriceWeek] = useState('');
  const [priceMonth, setPriceMonth] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProperty = {
      name,
      description,
      location: { city, address },
      capacity: parseInt(capacity),
      services,
      price: {
        night: parseFloat(priceNight),
        week: parseFloat(priceWeek),
        month: parseFloat(priceMonth),
      },
      images,
      availability: [],
    };
    onAddProperty(newProperty);
    setName('');
    setDescription('');
    setCity('');
    setAddress('');
    setCapacity('');
    setServices([]);
    setPriceNight('');
    setPriceWeek('');
    setPriceMonth('');
    setImages([]);
  };

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setServices([...services, value]);
    } else {
      setServices(services.filter((service) => service !== value));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages(imageUrls);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
      <h3 className="font-bold mb-2">Agregar Propiedad</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Capacidad"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <div>
          <label className="block mb-1">Servicios:</label>
          {['WiFi', 'Aire acondicionado', 'TV'].map((service) => (
            <label key={service} className="flex items-center">
              <input
                type="checkbox"
                value={service}
                checked={services.includes(service)}
                onChange={handleServiceChange}
                className="mr-2"
              />
              {service}
            </label>
          ))}
        </div>
        <input
          type="number"
          placeholder="Precio por noche"
          value={priceNight}
          onChange={(e) => setPriceNight(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Precio por semana"
          value={priceWeek}
          onChange={(e) => setPriceWeek(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Precio por mes"
          value={priceMonth}
          onChange={(e) => setPriceMonth(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className="p-2 border rounded"
        />
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
        Agregar Propiedad
      </button>
    </form>
  );
};

export default AddPropertyForm;