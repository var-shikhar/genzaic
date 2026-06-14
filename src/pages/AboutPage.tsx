import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Genzaic" width={100} height={20} />
          </Link>
          
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              About GenZaic
            </h1>
            
            <p className="text-lg text-muted-foreground mb-12">
              GenZaic is a digital storefront platform built specifically for Indian creators. 
              We make it easy for creators to sell their digital products — PDFs, templates, code, 
              courses, and more — with zero upfront costs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: Target,
                  title: 'Our Mission',
                  description: 'To empower every Indian creator to monetize their skills and knowledge through digital products.',
                },
                {
                  icon: Users,
                  title: 'Who We Serve',
                  description: 'Content creators, educators, designers, developers, and anyone with valuable digital content to share.',
                },
                {
                  icon: Zap,
                  title: 'What We Offer',
                  description: 'A complete platform with payments, GST invoicing, secure delivery, and professional storefronts.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-card rounded-xl p-8 border border-border">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Why GenZaic?
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Zero Setup Fee:</strong> Start selling without any upfront investment.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">India-First:</strong> Built with Indian payment methods, GST compliance, and INR pricing in mind.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Simple & Fast:</strong> Launch your store in minutes, not days.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Reliable Payouts:</strong> Get paid to your bank account within one week.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2025 GenZaic. Made with ❤️ in India
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
