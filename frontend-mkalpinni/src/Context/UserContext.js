import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/apiConfig';
import axios from "axios";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const getUserRoleName = (idrol) => {
    switch (idrol) {
      case 1: return 'Propietario';
      case 2: return 'Inquilino';
      case 3: return 'Administrador';
      case 4: return 'Comprador';
      default: return 'Usuario';
    }
  };

  const login = async ({ email, password }) => {
    try {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      setUser(null);

      setIsLoggingIn(true);

      const { data } = await axios.post(`${API_BASE_URL}/Usuario/IniciarSesion`, {
        correo: email,
        contrasenaHash: password,
      });

      if (!data.status) {
        throw new Error("Inicio de sesión fallido");
      }

      const userData = data.value;
      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);

    } catch (error) {
      console.error("Error en login", error.response ? error.response.data : error);
      navigate("/iniciarsesion");
    }
  };

  const refreshUser = () => {
    const storedUser = sessionStorage.getItem("userData");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggingIn && user?.idrol) {
      switch (user.idrol) {
        case 1:
          navigate("/cliente", { replace: true });
          break;
        case 2:
          navigate("/cliente", { replace: true });
          break;
        case 3:
          navigate("/admin", { replace: true });
          break;
        case 4:
          navigate("/cliente", { replace: true });
          break;
        default:
          navigate("/iniciarsesion", { replace: true });
      }
      setIsLoggingIn(false);
    }
  }, [user, isLoggingIn, navigate]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);
  }, [navigate]);

  const userRoleName = user?.idrol ? getUserRoleName(user.idrol) : '';

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    userRoleName,
    getUserRoleName,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
