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
    <article className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <header className="mb-10">
        <Link href="/" className="text-patch-muted text-sm hover:text-patch-green transition">
          ← Back
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif text-patch-deep mt-3 tracking-tight">
          {location.postcode}
        </h1>
        <p className="text-lg text-patch-muted mt-1">
          {location.admin_district}{location.region ? `, ${location.region}` : ''}
        </p>
      </header>

      {/* At a glance — horizontal stat line */}
      <div className="grid grid-cols-4 gap-px bg-patch-line mb-10">
        <Stat value={species ? formatNumber(species.totalRecords) : '—'} label="Species records" color="text-nature-main" />
        <Stat value={housePrices?.averagePrice ? `£${formatK(housePrices.averagePrice)}` : '—'} label="Avg. price" color="text-property-main" />
        <Stat value={crime ? formatNumber(crime.total) : '—'} label="Crimes" color="text-safety-main" />
        <Stat value={floodStations ? String(floodStations.count) : '—'} label="Flood stations" color="text-flood-main" />
      </div>

      {/* ── Wildlife ── */}
      {species && species.totalRecords > 0 && (
        <section className="section-divider">
          <SectionHead title="Wildlife" color="text-nature-main" source="NBN Atlas · within 2km" />
          <p className="text-patch-muted mb-4">
            {formatNumber(species.totalRecords)} records across {species.groups.length} groups.
          </p>
          {species.groups.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-6">
              {species.groups.map((g: any) => (
                <span key={g.name} className="text-patch-brown">
                  {g.name} <span className="text-patch-muted">{formatNumber(g.count)}</span>
                </span>
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
              <div>
                <span className="text-gray-700 text-sm">{site.name}</span>
                {site.district && <span className="text-patch-muted text-xs ml-2">{site.district}</span>}
              </div>
              <div className="flex items-center gap-3">
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
          <p className="text-patch-muted mb-4">
            {formatNumber(crime.total)} incidents nearby.
          </p>
          {crime.byCategory.slice(0, 10).map((c: any) => (
            <div key={c.category} className="data-row">
              <span className="text-gray-700 text-sm capitalize">{c.category}</span>
              <span className="text-sm font-semibold tabular-nums">{c.count}</span>
            </div>
          ))}
        </section>
      )}

      {/* ── House Prices ── */}
      <section className="section-divider">
        <SectionHead title="House Prices" color="text-property-main" source="Land Registry" />
        {housePrices && housePrices.sales.length > 0 ? (
          <>
            <p className="text-patch-muted mb-4">
              Average <span className="font-serif font-semibold text-property-main text-xl">£{formatNumber(housePrices.averagePrice)}</span> from {housePrices.count} sales.
            </p>
            {housePrices.sales.slice(0, 8).map((s: any, i: number) => (
              <div key={i} className="data-row">
                <div>
                  <span className="text-gray-700 text-sm">{s.address || 'Property'}</span>
                  <span className="text-patch-muted text-xs ml-2 capitalize">{s.type} · {s.date}</span>
                </div>
                <span className="font-semibold text-sm tabular-nums">£{formatNumber(s.amount)}</span>
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
          <div className="border-l-2 border-amber-400 pl-4 mb-6">
            <p className="text-sm font-semibold text-amber-800 mb-1">Active warnings</p>
            {floodWarnings.warnings.map((w: any, i: number) => (
              <p key={i} className="text-sm text-gray-700 mb-1">{w.description}</p>
            ))}
          </div>
        )}

        {floodStations && (
          <>
            <p className="text-patch-muted mb-4">
              {floodStations.count} monitoring station{floodStations.count !== 1 ? 's' : ''} nearby.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {floodStations.stations.map((s: any, i: number) => (
                <div key={i} className="data-row">
                  <div>
                    <span className="text-gray-700 text-sm">{s.label}</span>
                    {s.river && <span className="text-patch-muted text-xs ml-2">{s.river}</span>}
                  </div>
                  {s.town && <span className="text-patch-muted text-sm">{s.town}</span>}
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
    <div className="bg-patch-bg py-4 px-3 text-center">
      <div className={`text-stat ${color}`}>{value}</div>
      <div className="text-xs text-patch-muted mt-1">{label}</div>
    </div>
  )
}

function SectionHead({ title, color, source }: { title: string; color: string; source: string }) {
  return (
    <div className="mb-4">
      <h2 className={`text-xl font-serif ${color}`}>{title}</h2>
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
      <span className={`w-2 h-2 rounded-full ${colors[classification] || 'bg-gray-300'}`} />
      {classification}
    </span>
  )
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-GB')
}

function formatK(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'm'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k'
  return n.toLocaleString('en-GB')
}
