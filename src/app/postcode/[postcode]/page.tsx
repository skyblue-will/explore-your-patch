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
          ← Back
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-patch-deep-green mb-2">
          {location.postcode}
        </h1>
        <p className="text-xl text-patch-forest/70 font-serif italic">
          {location.admin_district}{location.region ? `, ${location.region}` : ''}
        </p>
        {location.parish && (
          <p className="text-sm text-patch-lichen mt-1">{location.parish}</p>
        )}
      </div>

      {/* Summary Cards */}
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
          label="Avg. Price"
          value={housePrices?.averagePrice ? `£${formatNumber(housePrices.averagePrice)}` : '—'}
          subtitle={housePrices?.count ? `${housePrices.count} sales` : 'no data'}
          color="property"
        />
        <SummaryCard
          emoji="🔒"
          label="Crimes"
          value={crime ? formatNumber(crime.total) : '—'}
          subtitle={crime?.month || ''}
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

      {/* NATURE & WILDLIFE */}
      <section className="category-section category-nature">
        <h2 className="category-title category-title-nature">Wildlife</h2>
        <p className="section-subtitle">Species within 2km · Source: NBN Atlas</p>
        {species && species.totalRecords > 0 ? (
          <div className="category-card">
            <p className="storytelling text-lg mb-6">
              <span className="text-nature-500 font-semibold">{formatNumber(species.totalRecords)}</span> records
              across <span className="text-nature-500 font-semibold">{species.groups.length}</span> wildlife groups.
            </p>
            {species.groups.length > 0 && (
              <div className="mb-6">
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
                <h3 className="text-sm font-semibold text-nature-600 uppercase tracking-wider mb-3">Top species</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {species.topSpecies.map((s: any) => (
                    <div key={s.name} className="flex justify-between items-center py-2 px-3 rounded-lg bg-nature-50">
                      <span className="text-gray-700 italic">{s.name}</span>
                      <span className="text-nature-500 text-sm font-medium">{formatNumber(s.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="category-card"><p className="storytelling">No records found nearby — doesn&apos;t mean nothing&apos;s here, just that none have been submitted yet.</p></div>
        )}
      </section>

      {/* BATHING WATER */}
      {bathingWater && bathingWater.sites.length > 0 && (
        <section className="category-section category-ocean">
          <h2 className="category-title category-title-ocean">Bathing Water</h2>
          <p className="section-subtitle">Nearest monitored sites · Source: Environment Agency</p>
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
                    <span className="text-sm text-gray-500">{site.distance.toFixed(1)}km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SAFETY & CRIME */}
      <section className="category-section category-safety">
        <h2 className="category-title category-title-safety">Crime</h2>
        <p className="section-subtitle">{crime?.month || 'Latest month'} · Source: Police UK</p>
        {crime ? (
          <div className="category-card">
            <p className="storytelling text-lg mb-6">
              <span className="text-safety-600 font-semibold">{formatNumber(crime.total)}</span> incidents recorded nearby.
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
          <div className="category-card"><p className="storytelling">Crime data unavailable for this area.</p></div>
        )}
      </section>

      {/* PROPERTY */}
      <section className="category-section category-property">
        <h2 className="category-title category-title-property">House Prices</h2>
        <p className="section-subtitle">Recorded sales · Source: Land Registry</p>
        {housePrices && housePrices.sales.length > 0 ? (
          <div className="category-card">
            <p className="storytelling text-lg mb-6">
              Average price <span className="font-serif font-bold text-property-500 text-2xl">£{formatNumber(housePrices.averagePrice)}</span>
              {' '}from {housePrices.count} sales.
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
          <div className="category-card"><p className="storytelling">No sales data for this postcode.</p></div>
        )}
      </section>

      {/* FLOOD RISK */}
      <section className="category-section category-flood">
        <h2 className="category-title category-title-flood">Flooding</h2>
        <p className="section-subtitle">Monitoring stations within 10km · Source: Environment Agency</p>

        {floodWarnings && floodWarnings.count > 0 && (
          <div className="category-card mb-4 border-l-4 border-amber-400 bg-amber-50/80">
            <h3 className="font-serif text-lg text-amber-800 mb-2">⚠️ Active warnings</h3>
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
              <span className="text-flood-500 font-semibold">{floodStations.count}</span> monitoring station{floodStations.count !== 1 ? 's' : ''} nearby.
            </p>
            {floodStations.stations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {floodStations.stations.map((s: any, i: number) => (
                  <div key={i} className="py-3 px-4 rounded-lg bg-flood-50 border border-flood-border/50">
                    <p className="font-medium text-flood-700">{s.label}</p>
                    {s.river && <p className="text-sm text-flood-500">{s.river}</p>}
                    {s.town && <p className="text-sm text-gray-500">{s.town}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="category-card"><p className="storytelling">Flood data unavailable.</p></div>
        )}
      </section>
    </div>
  )
}

function SummaryCard({ emoji, label, value, subtitle, color }: { emoji: string; label: string; value: string; subtitle: string; color: string }) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    nature: { bg: 'bg-nature-bg', border: 'border-nature-border/50', text: 'text-nature-500' },
    property: { bg: 'bg-property-bg', border: 'border-property-border/50', text: 'text-property-500' },
    safety: { bg: 'bg-safety-bg', border: 'border-safety-border/50', text: 'text-safety-500' },
    flood: { bg: 'bg-flood-bg', border: 'border-flood-border/50', text: 'text-flood-500' },
  }
  const c = colorMap[color] || colorMap.nature
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 text-center transition-shadow hover:shadow-md`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className={`stat-number text-2xl ${c.text}`}>{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-1">{label}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
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
