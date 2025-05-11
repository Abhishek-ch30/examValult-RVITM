
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-6 px-6 bg-slate-900 text-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">Exam Vault RVITM</h3>
            <p className="text-gray-300">
              A comprehensive online examination system for RVITM students and teachers.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Contact</h4>
            <address className="not-italic text-gray-300">
              RV Institute of Technology and Management<br />
              Bangalore, Karnataka<br />
              India
            </address>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Exam Vault RVITM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
