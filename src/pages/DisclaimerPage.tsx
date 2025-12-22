import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">G</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">GenZaic</span>
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
              Disclaimer
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  General Information
                </h2>
                <p>
                  The information provided on GenZaic is for general informational purposes only. 
                  While we strive to keep the information accurate and up-to-date, we make no 
                  representations or warranties of any kind, express or implied, about the completeness, 
                  accuracy, reliability, suitability, or availability of the platform or the information, 
                  products, services, or related graphics contained on the platform.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  No Guarantee of Earnings
                </h2>
                <p>
                  GenZaic provides a platform for creators to sell digital products. We do not guarantee 
                  any specific level of sales, revenue, or earnings. Success on the platform depends on 
                  various factors including but not limited to product quality, pricing, marketing efforts, 
                  and market demand.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Third-Party Content
                </h2>
                <p>
                  GenZaic hosts digital products created and uploaded by third-party sellers. We are not 
                  responsible for the content, quality, or accuracy of these products. Buyers are 
                  encouraged to review product descriptions and seller information before making purchases.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Payment Processing
                </h2>
                <p>
                  Payment processing is handled by third-party payment providers. While we strive to 
                  ensure secure transactions, we are not liable for any issues arising from payment 
                  processing failures or delays caused by external factors.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Platform Availability
                </h2>
                <p>
                  We aim to provide uninterrupted access to GenZaic, but we do not guarantee that the 
                  platform will be available at all times. Scheduled maintenance, technical issues, or 
                  circumstances beyond our control may result in temporary unavailability.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Changes to This Disclaimer
                </h2>
                <p>
                  We reserve the right to update or modify this disclaimer at any time without prior 
                  notice. Continued use of the platform after any changes constitutes acceptance of the 
                  updated disclaimer.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Contact Us
                </h2>
                <p>
                  If you have any questions about this disclaimer, please contact us through our 
                  support channels.
                </p>
              </section>
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

export default DisclaimerPage;
