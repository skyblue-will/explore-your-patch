import { lookupPostcode, getCrime, getFloodStations, getFloodWarnings, getHousePrices, getBathingWater, getSpecies } from '../../../lib/apis'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { postcode: string } }) {
  const pc = decodeURIComponent(params.postcode).toUpperCase()
  return { title: `${pc} — Explore Your Patch` }
}

export default async function PostcodePage({ params }: { params: { postcode: string } }) {
  const pc = decodeURIComponent(params.postcode)
  const location = await lookupPostcode(pc)
  if (!location) notFound()

  const [crime, floodStations, floodWarnings, housePrices, bathingWater, species] = await Promise.all([
    getCrime(location.lat, location.lng),
    getFloodStations(location.lat, location.lng),
    getFloodWarnings(location.lat, location.lng),
    getHousePrices(location.postcode),
    getBathingWater(location.lat, location.lng),
    getSpecies(location.lat, location.lng),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <Link href="/" className="text-patch-lichen text-sm hover:text-patch-forest transition mb-4 inline-block">
          ← Search another postcode
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-patch-deep-green mb-2">
          {location.postcode}
        </h1>
        <p className="text-xl text-patch-forest/70 font-serif italic">
          {location.admin_district}{location.region ? `, ${location.region}` : ''}
        </p>
        {location.parish && (
          <p className="text-sm text-patch-lichen mt-1">Parish of {location.parish}</p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <SummaryCard
          emoji="🦋"
          label="Species Records"
          value={species ? formatNumber(species.totalRecords) : '—'}
          subtitle="within 2km"
        />
        <SummaryCard
          emoji="🏠"
          label="Avg. House Price"
          value={housePrices?.averagePrice ? `£${formatNumber(housePrices.averagePrice)}` : '—'}
          subtitle={housePrices?.count ? `from ${housePrices.count} sales` : 'no data'}
        />
        <SummaryCard
          emoji="🔒"
          label="Recent Crimes"
          value={crime ? formatNumber(crime.total) : '—'}
          subtitle={crime?.month || 'latest month'}
        />
        <SummaryCard
          emoji="🌊"
          label="Flood Stations"
          value={floodStations ? String(floodStations.count) : '—'}
          subtitle="within 10km"
        />
      </div>

      {/* Nature & Wildlife */}
      <section className="mb-12">
        <h2 className="section-title">🌿 Nature & Wildlife</h2>
        <p className="section-subtitle">Species recorded within 2km of this postcode</p>
        {species ? (
          <div className="card">
            {species.totalRecords > 0 ? (
              <>
                <p className="storytelling text-lg mb-6">
                  <span className="text-patch-forest font-semibold">{formatNumber(species.totalRecords)} wildlife records</span> have been
                  documented within 2km of {location.postcode}. This area is home to a rich variety of life.
                </p>
                {species.groups.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-serif text-patch-forest mb-3">Wildlife groups spotted here</h3>
                    <div className="flex flex-wrap gap-2">
                      {species.groups.map(g => (
                        <span key={g.name} className="px-3 py-1.5 rounded-full bg-patch-forest/10 text-patch-deep-green text-sm">
                          {g.name} <span className="text-patch-lichen">({formatNumber(g.count)})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {species.topSpecies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-serif text-patch-forest mb-3">Most recorded species</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {species.topSpecies.map(s => (
                        <div key={s.name} className="flex justify-between items-center py-2 px-3 rounded-lg bg-patch-cream/50">
                          <span className="text-gray-700 italic">{s.name}</span>
                          <span className="text-patch-lichen text-sm">{formatNumber(s.count)} records</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="storytelling">No wildlife records found in the immediate area — this doesn&apos;t mean there&apos;s nothing here, just that records haven&apos;t been submitted yet.</p>
            )}
          </div>
        ) : (
          <div className="card"><p className="storytelling">Wildlife data is currently unavailable.</p></div>
        )}
      </section>

      {/* Bathing Water */}
      {bathingWater && bathingWater.sites.length > 0 && (
        <section className="mb-12">
          <h2 className="section-title">🏊 Bathing Water Quality</h2>
          <p className="section-subtitle">Nearest monitored bathing sites</p>
          <div className="card">
            <div className="space-y-4">
              {bathingWater.sites.map((site: any) => (
                <div key={site.name} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-patch-lichen/10 last:border-0">
                  <div>
                    <p className="font-medium text-patch-deep-green">{site.name}</p>
                    {site.district && <p className="text-sm text-patch-lichen">{site.district}</p>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 sm:mt-0">
                    <ClassificationBadge classification={site.classification} />
                    <span className="text-sm text-patch-lichen">{site.distance.toFixed(1)} km away</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Safety */}
      <section className="mb-12">
        <h2 className="section-title">🔒 Safety & Crime</h2>
        <p className="section-subtitle">Recent street-level crime data from Police UK</p>
        {crime ? (
          <div className="card">
            <p className="storytelling text-lg mb-6">
              <span className="text-patch-forest font-semibold">{formatNumber(crime.total)} incidents</span> were recorded
              near this postcode in {crime.month}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crime.byCategory.slice(0, 10).map(c => (
                <div key={c.category} className="flex justify-between items-center py-2 px-4 rounded-lg bg-patch-cream/50">
                  <span className="text-gray-700 capitalize">{c.category}</span>
                  <span className="font-serif font-bold text-patch-forest">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card"><p className="storytelling">Crime data is currently unavailable for this area.</p></div>
        )}
      </section>

      {/* Property */}
      <section className="mb-12">
        <h2 className="section-title">🏡 Property</h2>
        <p className="section-subtitle">House sales from Land Registry price paid data</p>
        {housePrices && housePrices.sales.length > 0 ? (
          <div className="card">
            <p className="storytelling text-lg mb-6">
              The average sale price in <span className="font-semibold text-patch-forest">{location.postcode}</span> is{' '}
              <span className="font-serif font-bold text-patch-brown text-2xl">£{formatNumber(housePrices.averagePrice)}</span>,
              based on {housePrices.count} recorded transactions.
            </p>
            <div className="space-y-3">
              {housePrices.sales.slice(0, 8).map((s: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-patch-lichen/10 last:border-0">
                  <div>
                    <p className="font-medium text-gray-700">{s.address || 'Property'}</p>
                    <p className="text-sm text-patch-lichen capitalize">{s.type} · {s.date}</p>
                  </div>
                  <p className="font-serif font-bold text-patch-brown text-lg mt-1 sm:mt-0">£{formatNumber(s.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card"><p className="storytelling">No house price data found for this postcode — it may be a new or commercial postcode.</p></div>
        )}
      </section>

      {/* Flooding */}
      <section className="mb-12">
        <h2 className="section-title">🌊 Flood Risk & Environment</h2>
        <p className="section-subtitle">Flood monitoring stations and warnings near this postcode</p>

        {floodWarnings && floodWarnings.count > 0 && (
          <div className="card mb-4 border-l-4 border-amber-500 bg-amber-50/50">
            <h3 className="font-serif text-lg text-amber-800 mb-2">⚠️ Active Flood Warnings</h3>
            {floodWarnings.warnings.map((w: any, i: number) => (
              <div key={i} className="mb-3 last:mb-0">
                <p className="text-gray-700">{w.description}</p>
                {w.area && <p className="text-sm text-amber-700">{w.area}</p>}
              </div>
            ))}
          </div>
        )}

        {floodStations ? (
          <div className="card">
            <p className="storytelling text-lg mb-6">
              There {floodStations.count === 1 ? 'is' : 'are'}{' '}
              <span className="text-patch-cornflower font-semibold">{floodStations.count} flood monitoring station{floodStations.count !== 1 ? 's' : ''}</span>{' '}
              within 10km, keeping watch over local rivers and waterways.
            </p>
            {floodStations.stations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {floodStations.stations.map((s: any, i: number) => (
                  <div key={i} className="py-3 px-4 rounded-lg bg-patch-cornflower/5 border border-patch-cornflower/15">
                    <p className="font-medium text-patch-deep-green">{s.label}</p>
                    {s.river && <p className="text-sm text-patch-cornflower">River {s.river}</p>}
                    {s.town && <p className="text-sm text-patch-lichen">{s.town}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card"><p className="storytelling">Flood monitoring data is currently unavailable.</p></div>
        )}
      </section>

      {/* Data Attribution */}
      <div className="text-center text-sm text-patch-lichen space-y-1">
        <p>Data sourced from postcodes.io, Police UK, Environment Agency, Land Registry & NBN Atlas</p>
        <p>All data is open and refreshed every 24 hours</p>
      </div>
    </div>
  )
}

function SummaryCard({ emoji, label, value, subtitle }: { emoji: string; label: string; value: string; subtitle: string }) {
  return (
    <div className="card text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="stat-number text-2xl">{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-1">{label}</div>
      <div className="text-xs text-patch-lichen mt-0.5">{subtitle}</div>
    </div>
  )
}

function ClassificationBadge({ classification }: { classification: string }) {
  const colors: Record<string, string> = {
    Excellent: 'bg-emerald-100 text-emerald-800',
    Good: 'bg-green-100 text-green-800',
    Sufficient: 'bg-yellow-100 text-yellow-800',
    Poor: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[classification] || 'bg-gray-100 text-gray-600'}`}>
      {classification}
    </span>
  )
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-GB')
}
