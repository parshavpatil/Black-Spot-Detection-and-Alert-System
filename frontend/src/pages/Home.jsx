import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

function useBlackspots() {
  const { blackspots } = useApp();
  return blackspots
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);
}

function Home() {
  return (
    <div className="p-4">
      <section className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome to Blackspot Detection</h1>
          <p className="text-gray-700">
            Help make roads safer by reporting hazardous locations and exploring known
            blackspots on the map. Together we can improve road safety.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
          <Link
            to="/report"
            className="btn-primary"
          >
            Report Accident
          </Link>
          <Link
            to="/map"
            className="btn-secondary"
          >
            View Map
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Latest Blackspots</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {useBlackspots().map((spot) => (
            <article
              key={spot.id}
              className="card overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg rounded-xl border border-stone-200"
            >
              {spot.imageUrl ? (
                <img src={spot.imageUrl} alt={spot.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 w-full bg-gradient-to-br from-stone-200 to-stone-100 flex items-center justify-center text-stone-600">
                  <span className="text-sm font-medium">{spot.title}</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-lg tracking-tight">{spot.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      spot.severity === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : spot.severity === "medium"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    }`}
                  >
                    {spot.severity}
                  </span>
                </div>
                <p className="text-sm text-stone-700 mt-1 line-clamp-3">{spot.description}</p>
                <div className="text-xs text-stone-600 mt-2">Location: {spot.locationText}</div>
                <div className="pt-3 flex items-center justify-between">
                  <Link className="text-sm underline" to={`/blackspots/${spot.id}`}>View details</Link>
                  <span className="text-[11px] text-stone-500">{spot.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;


