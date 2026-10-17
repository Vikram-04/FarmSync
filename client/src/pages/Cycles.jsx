import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Plus, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function Cycles() {
  const [cycles, setCycles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const response = await api.get('/cycles');
        setCycles(response.data);
      } catch (err) {
        setError('Failed to load crop cycles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCycles();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Crop Cycles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track your farming seasons</p>
        </div>
        <Link
          to="/cycles/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/30"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Cycle
        </Link>
      </div>

      {cycles.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 mb-4">
            <Sprout className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No crop cycles yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Create your first crop cycle to start tracking weather, expenses, revenue, and disease predictions.
          </p>
          <Link
            to="/cycles/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-brand-50 text-brand-700 font-medium rounded-xl hover:bg-brand-100 transition-colors"
          >
            Create your first cycle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cycles.map((cycle) => (
            <Link
              key={cycle._id}
              to={`/cycles/${cycle._id}`}
              className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all duration-200 block relative overflow-hidden"
            >
              {/* Status indicator */}
              <div className={`absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full opacity-20 transition-transform group-hover:scale-110 ${
                cycle.status === 'active' ? 'bg-brand-500' : 'bg-gray-400'
              }`} />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600">
                  <Sprout className="h-6 w-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cycle.status === 'active' 
                    ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {cycle.status === 'active' ? 'Active' : 'Completed'}
                </span>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{cycle.cropId?.priceCommodity || cycle.crop}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {cycle.seasonId?.name || cycle.season}</span>
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {cycle.areaHectares} ha</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Sowed: {new Date(cycle.sowingDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center text-brand-600 font-medium group-hover:translate-x-1 transition-transform">
                    View Dashboard <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
