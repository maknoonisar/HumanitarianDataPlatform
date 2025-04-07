import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-md bg-white flex items-center justify-center text-primary font-heading font-bold">
                HDX
              </div>
              <span className="ml-2 text-xl font-heading font-medium">Humanitarian Data Exchange</span>
            </div>
            <p className="text-neutral-300 text-sm">Connecting humanitarian data providers with users to improve crisis response through evidence-based decision-making.</p>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-neutral-300">
              <li><Link href="/data-catalog" className="hover:text-white transition">Data Catalog</Link></li>
              <li><Link href="/organizations" className="hover:text-white transition">Organizations</Link></li>
              <li><Link href="/visualizations" className="hover:text-white transition">Visualizations</Link></li>
              <li><Link href="/crises" className="hover:text-white transition">Active Crises</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">About HDX</h4>
            <ul className="space-y-2 text-neutral-300">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="/data-policy" className="hover:text-white transition">Data Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Connect With Us</h4>
            <ul className="space-y-2 text-neutral-300">
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link href="/feedback" className="hover:text-white transition">Feedback</Link></li>
              <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
              <li>
                <div className="flex space-x-4 mt-2">
                  <a href="#" className="text-neutral-300 hover:text-white transition">
                    <span className="material-icons">mail</span>
                  </a>
                  <a href="#" className="text-neutral-300 hover:text-white transition">
                    <span className="material-icons">help</span>
                  </a>
                  <a href="#" className="text-neutral-300 hover:text-white transition">
                    <span className="material-icons">forum</span>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-700 text-neutral-400 text-sm flex flex-col md:flex-row justify-between">
          <div>
            <p>© {new Date().getFullYear()} Humanitarian Data Exchange. All rights reserved.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/privacy" className="text-neutral-400 hover:text-white transition mr-4">Privacy Policy</Link>
            <Link href="/cookies" className="text-neutral-400 hover:text-white transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
