import { NavLink } from 'react-router-dom';
import { CloudUpload, FileText } from 'lucide-react';

const SideNavBar = () => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface border-r border-outline-variant flex flex-col py-section-margin gap-unit hidden md:flex">
      <div className="px-gutter mb-gutter">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Management</h2>
        <p className="text-on-surface-variant text-label-sm font-label-sm">Financial Tools</p>
      </div>
      <nav className="flex flex-col">
        <NavLink 
          to="/upload" 
          className={({ isActive }) => 
            `flex items-center gap-gutter px-gutter py-3 cursor-pointer font-label-md text-label-md transition-all ${
              isActive 
                ? 'bg-secondary-container text-on-secondary-container font-bold border-l-4 border-primary' 
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`
          }
        >
          <CloudUpload size={24} />
          <span>Upload Receipt</span>
        </NavLink>
        <NavLink 
          to="/receipts" 
          className={({ isActive }) => 
            `flex items-center gap-gutter px-gutter py-3 cursor-pointer font-label-md text-label-md transition-all ${
              isActive 
                ? 'bg-secondary-container text-on-secondary-container font-bold border-l-4 border-primary' 
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`
          }
        >
          <FileText size={24} />
          <span>Receipts</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default SideNavBar;
