import { Calendar, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-background overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] opacity-30" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] opacity-30" />

      <div className="container relative mx-auto px-4 py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 group">
              <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                AppointHQ
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Smart appointment booking platform for modern businesses. Streamline your scheduling with our premium tools.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/10 hover:border-primary/20 transition-all duration-300"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Security", "Changelog"]
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact"]
            },
            {
              title: "Legal",
              links: ["Privacy", "Terms", "Cookie Policy", "Licenses"]
            }
          ].map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-foreground mb-6">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to="/"
                      className="text-sm text-muted-foreground hover:text-primary hover:pl-1 transition-all duration-300"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AppointHQ. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> by JSHS SPIT Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
