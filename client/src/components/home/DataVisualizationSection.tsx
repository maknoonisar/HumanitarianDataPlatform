import { useQuery } from "@tanstack/react-query";
import { Visualization } from "@/lib/types";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DummyDisplacementData = [
  { year: 2019, refugees: 26.0, idps: 45.7, others: 5.3 },
  { year: 2020, refugees: 26.4, idps: 48.0, others: 5.7 },
  { year: 2021, refugees: 27.1, idps: 51.3, others: 6.1 },
  { year: 2022, refugees: 32.5, idps: 55.2, others: 6.9 },
  { year: 2023, refugees: 35.3, idps: 58.6, others: 7.4 },
];

const DummyFoodInsecurityData = [
  { country: "Somalia", insecurityLevel: 4.5 },
  { country: "Yemen", insecurityLevel: 4.2 },
  { country: "South Sudan", insecurityLevel: 4.0 },
  { country: "Afghanistan", insecurityLevel: 3.8 },
  { country: "DR Congo", insecurityLevel: 3.5 },
];

const DataVisualizationSection = () => {
  const { data: visualizations, isLoading, error } = useQuery<Visualization[]>({
    queryKey: ['/api/visualizations'],
    staleTime: 60 * 1000, // 1 minute
  });

  if (error) {
    console.error("Failed to load visualizations:", error);
  }

  return (
    <section className="mb-16">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-neutral-800 mb-8">Data Visualizations</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <h3 className="font-heading font-bold text-xl text-neutral-800">Global Forced Displacement Trends</h3>
            
            <div className="flex items-center mt-4 md:mt-0">
              <div className="relative mr-4">
                <select className="bg-neutral-100 border border-neutral-200 rounded-md py-1 pl-3 pr-10 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Last 5 Years</option>
                  <option>Last 10 Years</option>
                  <option>Last 20 Years</option>
                </select>
                <span className="material-icons absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500 pointer-events-none text-sm">
                  expand_more
                </span>
              </div>
              
              <button className="flex items-center text-primary text-sm hover:text-primary/80">
                <span className="material-icons text-sm mr-1">file_download</span>
                Download
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          <div className="bg-neutral-100 rounded-lg p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={DummyDisplacementData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: 'People (millions)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="refugees" stroke="#1f77b4" name="Refugees" />
                <Line type="monotone" dataKey="idps" stroke="#ff7043" name="IDPs" />
                <Line type="monotone" dataKey="others" stroke="#26a69a" name="Others of Concern" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-sm text-neutral-500">
            <p>Source: UNHCR Refugee Data Finder, Updated June 2023</p>
            <p className="mt-2">This visualization shows global forced displacement trends over time, including refugees, asylum-seekers, internally displaced people, and other populations of concern.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-heading font-bold text-lg text-neutral-800">Food Insecurity Hotspots</h3>
          </div>
          
          <div className="p-4">
            <div className="bg-neutral-100 rounded-lg p-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={DummyFoodInsecurityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis label={{ value: 'Severity (1-5)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="insecurityLevel" fill="#ff7043" name="Food Insecurity Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 text-sm text-neutral-500">
              <p>Source: WFP HungerMap, Updated June 2023</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-heading font-bold text-lg text-neutral-800">Health Facility Access in Crisis Areas</h3>
          </div>
          
          <div className="p-4">
            <div className="bg-neutral-100 rounded-lg p-4 h-60 flex justify-center items-center">
              <div className="text-center text-neutral-500">
                <p>Interactive visualization loading...</p>
                <p className="text-sm mt-2">Health facility access across crisis regions</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-neutral-500">
              <p>Source: WHO Health Resources Availability Monitoring System, Updated May 2023</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <Link href="/visualizations" className="inline-flex items-center text-primary font-semibold hover:text-primary/80">
          Explore all visualizations
          <span className="material-icons ml-1">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
};

export default DataVisualizationSection;
