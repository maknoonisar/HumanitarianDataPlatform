import { Link } from "wouter";

const CallToAction = () => {
  return (
    <section className="bg-primary/10 py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-neutral-800 mb-4">Join the Humanitarian Data Community</h2>
        <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">Contribute data, collaborate with partners, and enhance humanitarian response through better information sharing.</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/share-data" className="bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded transition">
            Share Your Data
          </Link>
          <Link href="/sign-up" className="bg-white hover:bg-neutral-100 text-primary font-semibold py-3 px-6 rounded border border-primary transition">
            Create an Account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
