import React, { useState } from 'react';
import { FaTimes, FaSave, FaExclamationTriangle, FaStar } from "react-icons/fa";

const PropertyForm = ({ property, editing, onSave, onCancel, onChange, isSubmitting = false }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...property,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'squareMeters' || name === 'landSquareMeters'
        ? value === '' ? '' : Number(value)
        : value,
    });
  };

  const handleImageFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    const newImagePreviews = newFiles
      .filter(file => file instanceof File)
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isNew: true,
        isMain: false 
      }));
    
    if (newImagePreviews.length === 0) return;
    
 
    const existingImages = Array.isArray(property.images) 
      ? property.images
          .filter(img => img !== null && img !== undefined)
          .map(img => {
            if (typeof img === 'string') {
              return { 
                url: img, 
                isNew: false,
                isMain: false
              };
            }
            return { 
              ...img, 
              isNew: img.isNew || false,
              isMain: img.isMain || false
            };
          })
      : [];
    
    if (existingImages.length === 0 && newImagePreviews.length > 0) {
      newImagePreviews[0].isMain = true;
    }
    
    const updatedImages = [...existingImages, ...newImagePreviews];
    
    onChange({ 
      ...property,
      images: updatedImages,
      removedImages: property.removedImages || []
    });
    
    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    if (!property.images || indexToRemove < 0 || indexToRemove >= property.images.length) return;
    
    const imageToRemove = property.images[indexToRemove];
    
    if (imageToRemove && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    const newImages = property.images.filter((_, index) => index !== indexToRemove);
    const newImageFiles = imageFiles.filter((_, index) => index !== indexToRemove);
    
    const removedImages = [...(property.removedImages || [])];
    
    if (imageToRemove && !imageToRemove.isNew) {
      const imageId = imageToRemove._id || imageToRemove.id || imageToRemove.idImagen || imageToRemove.url;
      if (imageId && !removedImages.includes(imageId)) {
        removedImages.push(imageId);
      }
    }

    setImageFiles(newImageFiles);
    
    if (newImages.length === 0) {
      onChange({ ...property, images: [], removedImages });
    } else {
      onChange({ ...property, images: newImages, removedImages });
    }
  };

  const handleSetMainImage = (indexToPromote) => {
    if (indexToPromote === 0) return;

    const newImages = [...property.images];
    const [promotedImage] = newImages.splice(indexToPromote, 1);
    newImages.unshift(promotedImage);
    
    const newImageFiles = [...imageFiles];
    if (newImageFiles.length > indexToPromote) {
      const [promotedFile] = newImageFiles.splice(indexToPromote, 1);
      newImageFiles.unshift(promotedFile);
      setImageFiles(newImageFiles);
    }
    
    onChange({ ...property, images: newImages });
  };
  

  React.useEffect(() => {
    return () => {
     
      if (property.images && Array.isArray(property.images)) {
        property.images.forEach(image => {
          if (image && image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
      }
    };
  }, [property.images]);

  const handleSave = async () => {
    if (!property.title || !property.address || !property.price) {
      alert('Por favor complete los campos requeridos');
      return;
    }
    const propertyId = property._id || property.id || property.idPropiedad;

  
    const existingImages = (property.images || [])
      .filter(img => !img.isNew && img.url)
      .map(img => ({
        id: img.id,
        url: img.url,
        isMain: img.isMain || false
      }));

   
    const newImageFiles = (property.images || [])
      .filter(img => img.isNew && img.file)
      .map(img => img.file);

    
    const removedImageIds = property.removedImages || [];

    const { images, _id, id, idPropiedad, ...propertyData } = property;

    if (!propertyId && editing) {
      alert('Error: No se encontró el ID de la propiedad. Recarga la página e intenta nuevamente.');
      return;
    }

    if (typeof onSave === 'function') {
      onSave(
        { 
          ...propertyData,
        
          images: existingImages
        },
        newImageFiles,
        removedImageIds 
      );
      return;
    }

  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {editing ? 'Editar Propiedad' : 'Registro de Propiedad'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Título *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={property.title}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese título de la propiedad"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Dirección *
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={property.address}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese dirección"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Precio *
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={property.price}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese precio"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Tipo
          </label>
          <select
            name="type"
            id="type"
            value={property.type}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Casa">Casa</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Local">Local</option>
            <option value="Terreno">Terreno</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bedrooms">
            Dormitorios
          </label>
          <input
            type="number"
            name="bedrooms"
            id="bedrooms"
            value={property.bedrooms}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Número de dormitorios"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="landSquareMeters">
            Metros cuadrados del terreno
          </label>
          <input
            type="number"
            name="landSquareMeters"
            id="landSquareMeters"
            value={property.landSquareMeters}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese los metros cuadrados del terreno"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bathrooms">
            Baños
          </label>
          <input
            type="number"
            name="bathrooms"
            id="bathrooms"
            value={property.bathrooms}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Número de baños"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="neighborhood">
            Barrio
          </label>
          <input
            type="text"
            name="neighborhood"
            id="neighborhood"
            value={property.neighborhood}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el barrio"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="locality">
            Localidad
          </label>
          <input
            type="text"
            name="locality"
            id="locality"
            value={property.locality}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la localidad"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">
            Provincia
          </label>
          <input
            type="text"
            name="province"
            id="province"
            value={property.province}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la provincia"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="squareMeters">
            Metros cuadrados
          </label>
          <input
            type="number"
            name="squareMeters"
            id="squareMeters"
            value={property.squareMeters}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese los metros cuadrados de la propiedad"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="operationType">
            Tipo de operación
          </label>
          <select
            name="operationType"
            id="operationType"
            value={property.operationType}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            Estado
          </label>
          <select
            name="status"
            id="status"
            value={property.status}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="disponible">Disponible</option>
            <option value="reservado">Reservado</option>
            <option value="ocupado">Ocupado</option>
          </select>
        </div>

        <div className="col-span-full">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Descripción
          </label>
          <textarea
            name="description"
            id="description"
            value={property.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la descripción de la propiedad"
            rows="4"
          />
        </div>

        <div className="col-span-full mb-6 p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image-upload">
            Imágenes de la propiedad
          </label>
          <input 
            type="file" 
            id="image-upload" 
            multiple 
            onChange={handleImageFileChange} 
            className="shadow border rounded-lg w-full py-3 px-4 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            required={!property.images || property.images.length === 0} 
          />
          
          {(property.images && property.images.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {property.images
                .filter(img => img !== null && img !== undefined)
                .map((img, index) => {
                  const imageUrl = img.url || img.preview || (typeof img === 'string' ? img : null);
                  
                  if (!imageUrl) return null;

                  return (
                    <div key={index} className="relative group">
                      <div className={`
                        relative 
                        h-24 w-24 
                        object-cover rounded-lg shadow-md border 
                        ${index === 0 ? 'border-4 border-yellow-500' : 'border-gray-200'}
                        overflow-hidden`}>
                        <img
                          src={imageUrl}
                          alt={`Imagen de la propiedad ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-property.jpg';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMainImage(index);
                              }}
                              className="p-1 bg-white bg-opacity-80 rounded-full text-yellow-600 hover:bg-yellow-100"
                              title="Establecer como principal"
                            >
                              <FaStar size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            className="p-1 bg-white bg-opacity-80 rounded-full text-red-600 hover:bg-red-100"
                            title="Eliminar imagen"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>{editing ? 'Actualizar Propiedad' : 'Guardar Propiedad'}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
        >
          <FaTimes />
          <span>Cancelar</span>
        </button>
      </div>

      {/* Modal de confirmación de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center text-yellow-600 mb-4">
              <FaExclamationTriangle className="w-6 h-6 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Cancelación</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Estás a punto de cancelar el registro. <strong className="font-extrabold text-black-600">Perderás todos los datos ingresados</strong> en el formulario. ¿Estás seguro?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-150"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  onCancel();
                }}
                className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-150"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyForm;