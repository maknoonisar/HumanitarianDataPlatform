import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/common/SearchBar";
import { Crisis } from "@/lib/types";
import { Link } from "wouter";

const HeroSection = () => {
  const { data: crises, isLoading, error } = useQuery<Crisis[]>({
    queryKey: ['/api/crises'],
    staleTime: 60 * 1000, // 1 minute
  });

  if (error) {
    console.error("Failed to load crises:", error);
  }

  return (
    <section className="bg-primary text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Find, Share & Use Humanitarian Data</h1>
            <p className="text-lg md:text-xl mb-6 text-white/90">Access critical data on global crises to improve humanitarian response and decision-making.</p>
            
            <SearchBar darkMode={true} />
          </div>
          <div className="md:w-1/2 md:pl-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-heading font-bold text-primary text-xl mb-4">Current Crisis Spotlight</h3>
              
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-neutral-200 rounded"></div>
                  <div className="h-20 bg-neutral-200 rounded"></div>
                </div>
              ) : error ? (
                <div className="text-error p-3 rounded border border-error/20 bg-error/10">
                  Failed to load crisis data. Please try again later.
                </div>
              ) : (
                <>
                  {crises && crises.slice(0, 2).map((crisis) => (
                    <div key={crisis.id} className="mb-3 pb-3 border-b border-neutral-200 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex items-start">
                        <span className="material-icons text-accent mr-2 mt-1">warning</span>
                        <div>
                          <h4 className="font-heading font-semibold text-neutral-800">{crisis.name}</h4>
                          <p className="text-sm text-neutral-500">{crisis.datasetCount || 0} datasets available</p>
                          <div className="flex mt-1 flex-wrap gap-1">
                            {crisis.tags && crisis.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs bg-neutral-200 text-neutral-800 px-2 py-1 rounded">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              <Link href="/crises" className="block text-center mt-4 text-secondary font-semibold hover:underline">
                View all active crises →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
