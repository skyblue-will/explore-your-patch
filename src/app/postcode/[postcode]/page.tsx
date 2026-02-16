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

      {/* Summary Cards — colour-coded */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        <SummaryCard
          emoji="🦋"
          label="Species Records"
          value={species ? formatNumber(species.totalRecords) : '—'}
          subtitle="within 2km"
          color="nature"
        />
        <SummaryCard
          emoji="🏠"
          label="Avg. House Price"
          value={housePrices?.averagePrice ? `£${formatNumber(housePrices.averagePrice)}` : '—'}
          subtitle={housePrices?.count ? `from ${housePrices.count} sales` : 'no data'}
          color="property"
        />
        <SummaryCard
          emoji="🔒"
          label="Recent Crimes"
          value={crime ? formatNumber(crime.total) : '—'}
          subtitle={crime?.month || 'latest month'}
          color="safety"
        />
        <SummaryCard
          emoji="🌊"
          label="Flood Stations"
          value={floodStations ? String(floodStations.count) : '—'}
          subtitle="within 10km"
          color="flood"
        />
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* NATURE & WILDLIFE — Green */}
      {/* ═══════════════════════════════════════ */}
      <section className="category-section category-nature">
        <span className="category-label category-label-nature">🌿 Nature & Wildlife</span>
        <h2 className="category-title category-title-nature">What lives here</h2>
        <p className="section-subtitle">Species recorded within 2km of this postcode</p>
        {species ? (
          <div className="category-card">
            {species.totalRecords > 0 ? (
              <>
                <p className="storytelling text-lg mb-6">
                  <span className="text-nature-500 font-semibold">{formatNumber(species.totalRecords)} wildlife records</span> have been
                  documented within 2km of {location.postcode}. This area is home to a rich variety of life.
                </p>
                {species.groups.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-serif text-nature-600 mb-3">Wildlife groups spotted here</h3>
                    <div className="flex flex-wrap gap-2">
                      {species.groups.map((g: any) => (
                        <span key={g.name} className="px-3 py-1.5 rounded-full bg-nature-100 text-nature-600 text-sm font-medium">
                          {g.name} <span className="opacity-60">({formatNumber(g.count)})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {species.topSpecies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-serif text-nature-600 mb-3">Most recorded species</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {species.topSpecies.map((s: any) => (
                        <div key={s.name} className="flex justify-between items-center py-2 px-3 rounded-lg bg-nature-50">
                          <span className="text-gray-700 italic">{s.name}</span>
                          <span className="text-nature-500 text-sm font-medium">{formatNumber(s.count)} records</span>
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
          <div className="category-card"><p className="storytelling">Wildlife data is currently unavailable.</p></div>
        )}
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* BATHING WATER — Ocean Blue */}
      {/* ═══════════════════════════════════════ */}
      {bathingWater && bathingWater.sites.length > 0 && (
        <section className="category-section category-ocean">
          <span className="category-label category-label-ocean">🏊 Water Quality</span>
          <h2 className="category-title category-title-ocean">Nearest bathing spots</h2>
          <p className="section-subtitle">Monitored bathing water quality from the Environment Agency</p>
          <div className="category-card">
            <div className="space-y-4">
              {bathingWater.sites.map((site: any) => (
                <div key={site.name} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-ocean-border/30 last:border-0">
                  <div>
                    <p className="font-medium text-ocean-700">{site.name}</p>
                    {site.district && <p className="text-sm text-gray-500">{site.district}</p>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 sm:mt-0">
                    <ClassificationBadge classification={site.classification} />
                    <span className="text-sm text-gray-500">{site.distance.toFixed(1)} km away</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* SAFETY & CRIME — Slate */}
      {/* ═══════════════════════════════════════ */}
      <section className="category-section category-safety">
        <span className="category-label category-label-safety">🔒 Safety & Crime</span>
        <h2 className="category-title category-title-safety">How safe is it?</h2>
        <p className="section-subtitle">Recent street-level crime data from Police UK</p>
        {crime ? (
          <div className="category-card">
            <p className="storytelling text-lg mb-6">
              <span className="text-safety-600 font-semibold">{formatNumber(crime.total)} incidents</span> were recorded
              near this postcode in {crime.month}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crime.byCategory.slice(0, 10).map((c: any) => (
                <div key={c.category} className="flex justify-between items-center py-2.5 px-4 rounded-lg bg-safety-50 border border-safety-border/50">
                  <span className="text-gray-700 capitalize">{c.category}</span>
                  <span className="font-serif font-bold text-safety-600">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="category-card"><p className="storytelling">Crime data is currently unavailable for this area.</p></div>
        )}
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* PROPERTY — Amber/Sandstone */}
      {/* ═══════════════════════════════════════ */}
      <section className="category-section category-property">
        <span className="category-label category-label-property">🏡 Property</span>
        <h2 className="category-title category-title-property">What homes cost here</h2>
        <p className="section-subtitle">House sales from Land Registry price paid data</p>
        {housePrices && housePrices.sales.length > 0 ? (
          <div className="category-card">
            <p className="storytelling text-lg mb-6">
              The average sale price in <span className="font-semibold text-property-600">{location.postcode}</span> is{' '}
              <span className="font-serif font-bold text-property-500 text-2xl">£{formatNumber(housePrices.averagePrice)}</span>,
              based on {housePrices.count} recorded transactions.
            </p>
            <div className="space-y-3">
              {housePrices.sales.slice(0, 8).map((s: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-property-border/30 last:border-0">
                  <div>
                    <p className="font-medium text-gray-700">{s.address || 'Property'}</p>
                    <p className="text-sm text-gray-500 capitalize">{s.type} · {s.date}</p>
                  </div>
                  <p className="font-serif font-bold text-property-500 text-lg mt-1 sm:mt-0">£{formatNumber(s.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="category-card"><p className="storytelling">No house price data found for this postcode — it may be a new or commercial postcode.</p></div>
        )}
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* FLOOD RISK — Blue */}
      {/* ═══════════════════════════════════════ */}
      <section className="category-section category-flood">
        <span className="category-label category-label-flood">🌊 Flood Risk</span>
        <h2 className="category-title category-title-flood">Flood monitoring nearby</h2>
        <p className="section-subtitle">Flood monitoring stations and warnings from the Environment Agency</p>

        {floodWarnings && floodWarnings.count > 0 && (
          <div className="category-card mb-4 border-l-4 border-amber-400 bg-amber-50/80">
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
          <div className="category-card">
            <p className="storytelling text-lg mb-6">
              There {floodStations.count === 1 ? 'is' : 'are'}{' '}
              <span className="text-flood-500 font-semibold">{floodStations.count} flood monitoring station{floodStations.count !== 1 ? 's' : ''}</span>{' '}
              within 10km, keeping watch over local rivers and waterways.
            </p>
            {floodStations.stations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {floodStations.stations.map((s: any, i: number) => (
                  <div key={i} className="py-3 px-4 rounded-lg bg-flood-50 border border-flood-border/50">
                    <p className="font-medium text-flood-700">{s.label}</p>
                    {s.river && <p className="text-sm text-flood-500">River {s.river}</p>}
                    {s.town && <p className="text-sm text-gray-500">{s.town}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="category-card"><p className="storytelling">Flood monitoring data is currently unavailable.</p></div>
        )}
      </section>

      {/* Data Attribution */}
      <div className="text-center text-sm text-patch-lichen space-y-1 mt-8">
        <p className="font-medium">Data sourced from official open datasets</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
          <span>postcodes.io</span><span>·</span>
          <span>Police UK</span><span>·</span>
          <span>Environment Agency</span><span>·</span>
          <span>Land Registry</span><span>·</span>
          <span>NBN Atlas</span>
        </div>
        <p className="opacity-60 mt-2">All data is open and refreshed every 24 hours</p>
      </div>
    </div>
  )
}

function SummaryCard({ emoji, label, value, subtitle, color }: { emoji: string; label: string; value: string; subtitle: string; color: string }) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    nature: { bg: 'bg-nature-bg', border: 'border-nature-border/50', text: 'text-nature-500' },
    property: { bg: 'bg-property-bg', border: 'border-property-border/50', text: 'text-property-500' },
    safety: { bg: 'bg-safety-bg', border: 'border-safety-border/50', text: 'text-safety-500' },
    flood: { bg: 'bg-flood-bg', border: 'border-flood-border/50', text: 'text-flood-500' },
    ocean: { bg: 'bg-ocean-bg', border: 'border-ocean-border/50', text: 'text-ocean-500' },
  }
  const c = colorMap[color] || colorMap.nature
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 text-center transition-shadow hover:shadow-md`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className={`stat-number text-2xl ${c.text}`}>{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-1">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>
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
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[classification] || 'bg-gray-100 text-gray-600'}`}>
      {classification}
    </span>
  )
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-GB')
}
