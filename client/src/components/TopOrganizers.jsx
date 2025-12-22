import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import { API_URL } from '../config';

const TopOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopOrganizers = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/services/top-organizers`);
        setOrganizers(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch top organizers', error);
        setLoading(false);
      }
    };

    fetchTopOrganizers();
  }, []);

  if (loading) return (
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 animate-pulse bg-neutral-800 rounded-xl border border-neutral-700"></div>
      ))}
    </div>
  );

  if (organizers.length === 0) return null;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {organizers.map((org, index) => (
        <div key={org._id} className="group relative bg-neutral-900/50 hover:bg-neutral-800/80 transition-all duration-300 p-6 rounded-2xl border border-white/10 hover:border-white/20 hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-500 to-orange-600 text-white px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl font-bold text-sm shadow-lg">
            #{index + 1}
          </div>

          <div className="flex items-center gap-4 mb-6 mt-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-2xl border border-white/5 ring-4 ring-neutral-900">
              {org.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{org.name}</h3>
              <p className="text-sm text-neutral-400">{org.count} Reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-neutral-950/50 p-3 rounded-xl border border-white/5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(org.averageRating) ? "text-amber-400 fill-amber-400" : "text-neutral-700"}`}
                />
              ))}
            </div>
            <span className="font-bold text-neutral-200 ml-auto text-lg">{org.averageRating.toFixed(1)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopOrganizers;
