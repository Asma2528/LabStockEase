import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import MainLayout from './layouts/MainLayout';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, UserSlicePath } from './provider/slice/user.slice';

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selector = useSelector(UserSlicePath);


  const refreshToken = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, {
        refreshToken: localStorage.getItem("refreshToken"), // Ensure you store refreshToken in localStorage
      });

      localStorage.setItem("token", data.token);
      return data.token;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  const fetchUser = async (token) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      dispatch(setUser(data.user));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);

      if (error.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          fetchUser(newToken);
        } else {
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!selector?.email) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [selector.email, navigate, dispatch]);

  if (loading) {
    return <div>Loading....</div>;
  }

  return (
    <>
      <Header />
      <MainLayout>
        <Outlet />
      </MainLayout>
    </>
  );
}

export default App;
