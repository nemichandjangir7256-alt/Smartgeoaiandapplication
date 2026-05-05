import { MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground py-12 mt-auto">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-accent-foreground" />
          </div>
          <span className="font-bold text-sm tracking-tight">SmartGeo</span>
        </div>
        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} SmartGeo — Academic Innovation Project
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
