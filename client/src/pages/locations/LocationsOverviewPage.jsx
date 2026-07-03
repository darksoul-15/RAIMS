import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as locationService from '../../services/locationService';
import { assetStatusClass, humanizeStatus } from '../../utils/statusColors';

const LocationsOverviewPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reuse, setReuse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('locations');

  useEffect(() => {
    locationService.getLocationSummaries().then((s) => {
      setSummaries(s);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (tab === 'reuse') {
      locationService.getReuseSuggestions().then(setReuse);
    }
  }, [tab]);

  const toggleExpand = async (id) => {
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(id);
    const loc = await locationService.getLocationWithAssets(id);
    setDetail(loc);
  };

  if (loading) return <div className="p-6 max-w-6xl mx-auto space-y-6 text-ink-400">Loading locations…</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="heading-page mb-4">Locations & Reuse</h1>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('locations')}
          className={`rounded px-4 py-2 text-sm font-medium ${tab === 'locations' ? 'bg-ink-900 text-white' : 'border border-border hover:bg-cream-100'}`}
        >
          Locations
        </button>
        <button
          onClick={() => setTab('reuse')}
          className={`rounded px-4 py-2 text-sm font-medium ${tab === 'reuse' ? 'bg-ink-900 text-white' : 'border border-border hover:bg-cream-100'}`}
        >
          Reuse Suggestions
        </button>
      </div>

      {tab === 'locations' && (
        <div className="space-y-3">
          {summaries.map((loc) => (
            <div key={loc._id} className="rounded-lg border border-border bg-white">
              <button
                onClick={() => toggleExpand(loc._id)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-surface-2"
              >
                <div>
                  <h3 className="font-medium text-ink-900">{loc.name}</h3>
                  <p className="text-sm text-ink-400">
                    {loc.type} · {loc.assetCount} asset{loc.assetCount !== 1 ? 's' : ''} · {loc.availableItems}/{loc.totalItems} items available
                  </p>
                  {loc.categories.length > 0 && (
                    <div className="flex gap-1.5 mt-1">
                      {loc.categories.map((c) => (
                        <span key={c} className="rounded bg-cream-100 px-2 py-0.5 text-xs text-ink-600">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-ink-400 text-lg">{expanded === loc._id ? '▲' : '▼'}</span>
              </button>

              {expanded === loc._id && detail && (
                <div className="border-t border-border px-4 pb-4">
                  {!detail.assets.length ? (
                    <p className="text-sm text-ink-400 pt-3">No assets at this location.</p>
                  ) : (
                    <table className="w-full text-sm mt-3">
                      <thead>
                        <tr className="border-b border-border text-left text-ink-400">
                          <th className="py-1.5 pr-3 font-medium">Code</th>
                          <th className="py-1.5 pr-3 font-medium">Name</th>
                          <th className="py-1.5 pr-3 font-medium">Category</th>
                          <th className="py-1.5 pr-3 font-medium">Available</th>
                          <th className="py-1.5 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.assets.map((a) => (
                          <tr key={a._id} className="border-b border-border">
                            <td className="py-1.5 pr-3 font-mono text-xs text-ink-400">
                              <Link to={`/assets/${a._id}`} className="hover:text-amber-600">{a.assetCode}</Link>
                            </td>
                            <td className="py-1.5 pr-3 text-ink-900">{a.name}</td>
                            <td className="py-1.5 pr-3 text-ink-600">{a.category}</td>
                            <td className="py-1.5 pr-3">{a.quantityAvailable}/{a.quantityTotal}</td>
                            <td className="py-1.5">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${assetStatusClass(a.status)}`}>
                                {humanizeStatus(a.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'reuse' && (
        <div>
          <p className="text-sm text-ink-400 mb-4">
            Assets with 60%+ stock sitting idle — consider sharing across projects.
          </p>
          {!reuse.length ? (
            <p className="text-ink-400 py-4">All assets are well-utilized.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reuse.map((a) => (
                <Link
                  key={a._id}
                  to={`/assets/${a._id}`}
                  className="block rounded-lg border border-border bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-ink-900">{a.name}</h3>
                  <p className="font-mono text-xs text-ink-400">{a.assetCode}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-ink-600">{a.category}</span>
                    <span className="text-green-700">{a.quantityAvailable}/{a.quantityTotal} avail.</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-ink-400 mb-1">
                      <span>Utilization</span>
                      <span>{a.utilizationPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-cream-200">
                      <div
                        className="h-1.5 rounded-full bg-amber-400"
                        style={{ width: `${a.utilizationPct}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-ink-400">{a.location}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationsOverviewPage;
