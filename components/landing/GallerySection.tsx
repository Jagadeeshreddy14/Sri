'use client';

import React from 'react';

export default function GallerySection() {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      caption: 'Twin Deluxe Suite',
    },
    {
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      caption: 'Hostel Exterior Elevation',
    },
    {
      url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      caption: 'Dining Hall & Kitchen',
    },
    {
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      caption: 'Study Lounge & Library',
    },
    {
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      caption: 'Modern Sanitized Bathroom',
    },
    {
      url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      caption: 'Private Single Room',
    },
  ];

  return (
    <section id="gallery" className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Visual Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Take a Tour of Grand Horizon Campus
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real snapshots from our luxury wings, study lounges, dining hall, and amenities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-3xl overflow-hidden shadow-md h-64 border border-slate-200 dark:border-slate-800"
            >
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5 opacity-0 group-hover:opacity-100 transition duration-300">
                <span className="text-sm font-bold text-white">{img.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
