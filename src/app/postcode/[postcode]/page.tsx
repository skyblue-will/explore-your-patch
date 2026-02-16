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
    <article className="max-w-3xl mx-auto px-4 py-6">
      {/* Header — compact */}
      <header className="mb-6">
        <div className="flex items-baseline gap-4">
          <Link href="/" className="text-patch-muted text-sm hover:text-patch-green transition shrink-0">←</Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-patch-deep tracking-tight">
              {location.postcode}
            </h1>
            <p className="text-patch-muted text-sm">
              {location.admin_district}{location.region ? `, ${location.region}` : ''}
            </p>
          </div>
        </div>
      </header>

      {/* Stats — 2x2 on mobile, 4 across on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-patch-line divide-x divide-y md:divide-y-0 divide-patch-line mb-8">
        <Stat value={species ? formatK(species.totalRecords) : '—'} label="Species records" color="text-nature-main" />
        <Stat value={housePrices?.averagePrice ? `£${formatK(housePrices.averagePrice)}` : '—'} label="Avg. price" color="text-property-main" />
        <Stat value={crime ? formatK(crime.total) : '—'} label="Crimes" color="text-safety-main" />
        <Stat value={floodStations ? String(floodStations.count) : '—'} label="Flood stations" color="text-flood-main" />
      </div>

      {/* ── Wildlife ── */}
      {species && species.totalRecords > 0 && (
        <section className="section-divider">
          <SectionHead title="Wildlife" color="text-nature-main" source="NBN Atlas · within 2km" />
          <p className="text-patch-muted text-sm mb-4">
            {formatNumber(species.totalRecords)} records across {species.groups.length} groups
          </p>
          {species.groups.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm mb-6">
              {species.groups.map((g: any) => (
                <div key={g.name} className="flex justify-between py-0.5">
                  <span className="text-gray-700">{g.name}</span>
                  <span className="text-patch-muted tabular-nums">{formatNumber(g.count)}</span>
                </div>
              ))}
            </div>
          )}
          {species.topSpecies.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-patch-muted uppercase tracking-wider mb-2">Top species</h3>
              {species.topSpecies.map((s: any) => (
                <div key={s.name} className="data-row">
                  <span className="text-gray-700 italic text-sm">{s.name}</span>
                  <span className="text-patch-muted text-sm tabular-nums">{formatNumber(s.count)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Bathing Water ── */}
      {bathingWater && bathingWater.sites.length > 0 && (
        <section className="section-divider">
          <SectionHead title="Bathing Water" color="text-ocean-main" source="Environment Agency" />
          {bathingWater.sites.map((site: any) => (
            <div key={site.name} className="data-row">
              <div className="min-w-0">
                <span className="text-gray-700 text-sm">{site.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <QualityDot classification={site.classification} />
                <span className="text-patch-muted text-sm tabular-nums">{site.distance.toFixed(1)}km</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Crime ── */}
      {crime && (
        <section className="section-divider">
          <SectionHead title="Crime" color="text-safety-main" source={`Police UK · ${crime.month}`} />
          <p className="text-patch-muted text-sm mb-4">
            {formatNumber(crime.total)} incidents nearby
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {crime.byCategory.slice(0, 10).map((c: any) => (
              <div key={c.category} className="data-row">
                <span className="text-gray-700 text-sm capitalize">{c.category}</span>
                <span className="text-sm font-semibold tabular-nums">{c.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── House Prices ── */}
      <section className="section-divider">
        <SectionHead title="House Prices" color="text-property-main" source="Land Registry" />
        {housePrices && housePrices.sales.length > 0 ? (
          <>
            <p className="text-patch-muted text-sm mb-4">
              Average <span className="font-serif font-semibold text-property-main text-lg">£{formatNumber(housePrices.averagePrice)}</span> from {housePrices.count} sales
            </p>
            {housePrices.sales.slice(0, 8).map((s: any, i: number) => (
              <div key={i} className="data-row">
                <div className="min-w-0 mr-4">
                  <span className="text-gray-700 text-sm block truncate">{s.address || 'Property'}</span>
                  <span className="text-patch-muted text-xs capitalize">{s.type} · {s.date}</span>
                </div>
                <span className="font-semibold text-sm tabular-nums shrink-0">£{formatNumber(s.amount)}</span>
              </div>
            ))}
          </>
        ) : (
          <p className="text-patch-muted text-sm">No sales data for this postcode.</p>
        )}
      </section>

      {/* ── Flooding ── */}
      <section className="section-divider">
        <SectionHead title="Flooding" color="text-flood-main" source="Environment Agency · within 10km" />

        {floodWarnings && floodWarnings.count > 0 && (
          <div className="border-l-2 border-amber-400 pl-4 mb-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">Active warnings</p>
            {floodWarnings.warnings.map((w: any, i: number) => (
              <p key={i} className="text-sm text-gray-700 mb-1">{w.description}</p>
            ))}
          </div>
        )}

        {floodStations && (
          <>
            <p className="text-patch-muted text-sm mb-4">
              {floodStations.count} station{floodStations.count !== 1 ? 's' : ''} nearby
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {floodStations.stations.map((s: any, i: number) => (
                <div key={i} className="data-row">
                  <div className="min-w-0">
                    <span className="text-gray-700 text-sm">{s.label}</span>
                    {s.river && <span className="text-patch-muted text-xs ml-2">{s.river}</span>}
                  </div>
                  {s.town && <span className="text-patch-muted text-sm shrink-0">{s.town}</span>}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </article>
  )
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="py-3 px-3 text-center">
      <div className={`text-xl md:text-2xl font-serif font-semibold ${color} leading-none`}>{value}</div>
      <div className="text-[11px] text-patch-muted mt-1 leading-tight">{label}</div>
    </div>
  )
}

function SectionHead({ title, color, source }: { title: string; color: string; source: string }) {
  return (
    <div className="mb-3">
      <h2 className={`text-lg font-serif ${color}`}>{title}</h2>
      <p className="section-source">{source}</p>
    </div>
  )
}

function QualityDot({ classification }: { classification: string }) {
  const colors: Record<string, string> = {
    Excellent: 'bg-emerald-500',
    Good: 'bg-green-400',
    Sufficient: 'bg-yellow-400',
    Poor: 'bg-red-400',
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-patch-muted">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[classification] || 'bg-gray-300'}`} />
      {classification}
    </span>
  )
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-GB')
}

function formatK(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'm'
  if (n >= 10000) return (n / 1000).toFixed(0) + 'k'
  return n.toLocaleString('en-GB')
}
