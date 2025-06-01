import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Twitter, Facebook, Instagram, Mail } from 'lucide-react';
import Container from '../Container';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Captus</span>
            </Link>
            <p className="mt-4 text-gray-600">
              Advanced photo management for professionals and enthusiasts.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="/#features" className="text-gray-600 hover:text-primary-600">Features</a></li>
              <li><a href="/#pricing" className="text-gray-600 hover:text-primary-600">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Testimonials</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">FAQ</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-primary-600">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Contact</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">GDPR</a></li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            &copy; {year} Captus. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;