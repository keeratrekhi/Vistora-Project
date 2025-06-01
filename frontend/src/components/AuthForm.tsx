import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

interface AuthFormProps {
  isSignUp: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isSignUp }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuthContext();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      if (isSignUp) {
        await signup(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        general: isSignUp 
          ? 'Failed to create account. Please try again.' 
          : 'Invalid email or password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isSignUp ? 'Ready Join Us?' : 'Welcome Back!'}
      </h2>
      
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <Input
            label="Full Name"
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            fullWidth
          />
        )}
        
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          fullWidth
        />
        
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          fullWidth
        />
        
        <div className="mt-2 mb-6">
          {isSignUp ? (
            <p className="text-sm text-gray-600">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          ) : (
            <div className="flex justify-end">
              <a href="#" className="text-sm text-primary-600 hover:underline">
                Forgot your password?
              </a>
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          isLoading={isLoading}
          fullWidth
        >
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <Link
            to={isSignUp ? '/login' : '/signup'}
            className="text-primary-600 hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default AuthForm;