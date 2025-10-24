import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-[#F8F5E9] border-t border-[#d8d6d1] mt-20">
<div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-5">
  <div className="flex items-center gap-3">
    <p className="text-2xl font-semibold flex items-center gap-2">
      <a 
        href="https://www.linkedin.com/in/salem-aljomah" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
        style={{ color: '#003d5c', fontSize: '2rem', fontWeight: '700' }}
      >
        <FontAwesomeIcon icon={faLinkedin} size="xl" />
        سالم
      </a>
      <span style={{ color: '#834d1a' }}>صُنِعَ مِن قِبَل</span>
    </p>
  </div>
</div>  
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Browse Categories
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Sell Your Items
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Safety Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#834d1a] transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#d8d6d1] pt-8">

          
          {/* Copyright */}
          <div className="text-center mt-4">
            <p className="text-gray-500 text-xs">
              © 2024 Thrift+. All rights reserved.
            </p>
          </div>
        </div>
        
      </div>
    </footer>
  );
}