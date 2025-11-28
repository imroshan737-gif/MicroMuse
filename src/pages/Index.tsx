import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

const Index = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  
  useEffect(() => {
    // Redirect based on user state
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  }, [user, navigate]);
  
  return null;
};

export default Index;
