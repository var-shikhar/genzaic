import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Palette, CreditCard, Shield, Zap, Globe, FileText, Check, Sparkles, Store, Rocket, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">G</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">GenZaic</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, 'features')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Pricing
            </a>
            <a 
              href="#marketplace" 
              onClick={(e) => scrollToSection(e, 'marketplace')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Marketplace
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Creator Login</Link>
            </Button>
            <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/50 to-background" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 mb-6">
              <IndianRupee className="w-4 h-4 text-success" />
              <span className="text-sm font-bold text-success">₹0 Setup Fee — Start Free Today!</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              The Digital Storefront for{' '}
              <span className="text-gradient">Indian Creators</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Sell PDFs, templates, code & digital products with ease. 
              <span className="text-foreground font-medium"> UPI-ready, GST-ready</span> — built for creators who mean business.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 h-14">
                <Link to="/signup">
                  Start Selling Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 h-14">
                <Link to="/login">Creator Login</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Zero setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Pay only when you earn</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Auto GST invoicing</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden max-w-5xl mx-auto">
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <div className="flex-1 mx-4">
                  <div className="bg-background rounded-md px-4 py-1.5 text-sm text-muted-foreground max-w-md mx-auto text-center">
                    yourstore.genzaic.com
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-background to-accent/30 min-h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                  {[
                    { title: 'React UI Kit', price: '₹1,999', color: 'gradient-card-1' },
                    { title: 'Business Templates', price: '₹499', color: 'gradient-card-2' },
                    { title: 'Design System', price: '₹2,499', color: 'gradient-card-3' },
                  ].map((product, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="bg-card rounded-xl p-4 border border-border shadow-md"
                    >
                      <div className={`h-24 ${product.color} rounded-lg mb-3`} />
                      <h3 className="font-semibold text-foreground">{product.title}</h3>
                      <p className="text-primary font-bold">{product.price}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features - Built for Indian Creators (FIRST) */}
      <section id="features" className="py-20 px-4 scroll-mt-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Indian Creators
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to run a professional digital business in India.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Secure KYC',
                description: 'Bank-grade verification with PAN & bank account validation.',
              },
              {
                icon: FileText,
                title: 'Auto GST Invoicing',
                description: 'Compliant invoices generated automatically for every sale.',
              },
              {
                icon: CreditCard,
                title: 'Indian Payments',
                description: 'UPI, credit/debit cards, net banking, and wallet support.',
              },
              {
                icon: Zap,
                title: 'Instant Delivery',
                description: 'Automatic file delivery with secure download links.',
              },
              {
                icon: Globe,
                title: 'Your Brand, Your Store',
                description: 'Custom storefront URL with professional themes.',
              },
              {
                icon: Check,
                title: 'T+7 Bank Payouts',
                description: 'Reliable payouts to your bank account within one week.',
              },
              {
                icon: Globe,
                title: 'Community Access',
                description: 'Connect with fellow creators and grow together.',
              },
              {
                icon: Sparkles,
                title: 'Customer Reviews',
                description: 'Build trust with ratings and reviews on your products.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (SECOND) */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Launch Your Store in 3 Simple Steps
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get your digital products online and start earning in minutes, not days.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Upload,
                title: 'Upload Your Products',
                description: 'Add your digital products — PDFs, templates, code, designs. Set your price in INR.',
                color: 'gradient-card-1',
                step: '01',
              },
              {
                icon: Palette,
                title: 'Design Your Store',
                description: 'Choose from beautiful pre-built themes. Your store is mobile-ready instantly.',
                color: 'gradient-card-2',
                step: '02',
              },
              {
                icon: CreditCard,
                title: 'Get Paid Instantly',
                description: 'Accept UPI, cards, wallets. Auto GST invoicing. T+1 payouts to your bank.',
                color: 'gradient-card-3',
                step: '03',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-8 border border-border shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-6 mt-4`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (THIRD) - HIGHLIGHTED USP */}
      <section id="pricing" className="py-20 px-4 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-primary/5" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-success/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 mb-6">
              <Sparkles className="w-4 h-4 text-success" />
              <span className="text-sm font-bold text-success">Our USP — Zero Risk, Maximum Reward</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Start for <span className="text-success">₹0</span> — Pay Only When You Earn
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No hidden fees. No monthly charges. We only succeed when you succeed.
            </p>
          </motion.div>

          {/* Main Pricing Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-success to-primary rounded-3xl blur-lg opacity-30 animate-pulse" />
              
              <div className="relative bg-card rounded-3xl border-2 border-success/50 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-center">
                  <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">
                    Creator Plan
                  </h3>
                  <p className="text-primary-foreground/80">Everything you need to start selling</p>
                </div>

                {/* Price */}
                <div className="px-8 py-12 text-center border-b border-border">
                  <span className="text-7xl md:text-9xl font-display font-bold text-success">₹0</span>
                  <p className="text-xl text-muted-foreground mt-4">Setup Fee — Start Free Today!</p>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    No upfront costs, no hidden fees. Pay only when you earn.
                  </p>
                </div>

                {/* Features */}
                <div className="px-8 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Unlimited products',
                      'Unlimited sales',
                      'Auto GST invoicing',
                      'T+7 bank payouts',
                      'UPI & card payments',
                      'Professional storefront',
                      'Secure file delivery',
                      'Analytics dashboard',
                      'Community access',
                      'Customer reviews & ratings',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-8 pb-8">
                  <Button 
                    size="lg" 
                    asChild 
                    className="w-full h-14 text-lg gradient-primary hover:opacity-90 transition-opacity"
                  >
                    <Link to="/signup">
                      <Rocket className="w-5 h-5 mr-2" />
                      Start Selling — It's Free!
                    </Link>
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    No credit card required • Setup in under 5 minutes
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Marketplace Section - Coming Soon */}
      <section id="marketplace" className="py-20 px-4 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30 mb-6">
              <Store className="w-4 h-4 text-warning" />
              <span className="text-sm font-bold text-warning">Coming Soon</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              GenZaic Marketplace
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Discover and sell digital products in India's first creator-focused marketplace. 
              Get discovered by millions of potential buyers.
            </p>

            <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Globe,
                    title: 'Reach Millions',
                    description: 'Get discovered by buyers searching for digital products.',
                  },
                  {
                    icon: Sparkles,
                    title: 'Featured Listings',
                    description: 'Top products get featured on our homepage.',
                  },
                  {
                    icon: CreditCard,
                    title: 'Unified Payments',
                    description: 'Zero setup fee, same fast payouts.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-warning" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-muted-foreground mb-4">Be the first to know when we launch</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full sm:flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button className="w-full sm:w-auto gradient-primary hover:opacity-90 transition-opacity">
                    Notify Me
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="gradient-hero rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-20" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Start your digital business with GenZaic. 
                <span className="font-bold text-white"> Zero setup fee — start today!</span>
              </p>
              <Button
                size="lg"
                asChild
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14"
              >
                <Link to="/signup">
                  Create Your Free Store
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">GenZaic</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 GenZaic. Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
