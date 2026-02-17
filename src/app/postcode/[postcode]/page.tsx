import { lookupPostcode, getCrime, getFloodStations, getFloodWarnings, getHousePrices, getBathingWater, getSpecies, getListedBuildings, getAirQuality, getAncientTrees, getNaturalEngland } from '../../../lib/apis'
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

  const [crime, floodStations, floodWarnings, housePrices, bathingWater, species, listedBuildings, airQuality, ancientTrees, naturalEngland] = await Promise.all([
    getCrime(location.lat, location.lng),
    getFloodStations(location.lat, location.lng),
    getFloodWarnings(location.lat, location.lng),
    getHousePrices(location.postcode),
    getBathingWater(location.lat, location.lng),
    getSpecies(location.lat, location.lng),
    getListedBuildings(location.lat, location.lng),
    getAirQuality(location.lat, location.lng),
    getAncientTrees(location.lat, location.lng),
    getNaturalEngland(location.lat, location.lng),
  ])

  return (
    <article className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-8">
        <Link href="/" className="text-patch-muted text-sm hover:text-patch-green transition inline-block mb-3">← Back</Link>
        <h1 className="text-3xl md:text-4xl font-serif text-patch-deep tracking-tight leading-tight">
          {location.postcode}
        </h1>
        <p className="text-patch-muted mt-1">
          {location.admin_district}{location.region ? `, ${location.region}` : ''}
        </p>
      </header>

      {/* Stats — colour-coded borders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatBox value={shortNum(species?.totalRecords)} label="Species records" borderColor="border-t-nature-main" textColor="text-nature-main" />
        <StatBox value={listedBuildings ? String(listedBuildings.count) : '—'} label="Listed buildings" borderColor="border-t-heritage-main" textColor="text-heritage-main" />
        <StatBox value={housePrices?.averagePrice ? `£${shortNum(housePrices.averagePrice)}` : '—'} label="Avg. price" borderColor="border-t-property-main" textColor="text-property-main" />
        <StatBox value={shortNum(crime?.total)} label="Crimes" borderColor="border-t-safety-main" textColor="text-safety-main" />
      </div>

      {/* ── Wildlife ── green */}
      {species && species.totalRecords > 0 && (
        <section className="mb-10 border-l-[3px] border-nature-main pl-5 md:pl-6">
          <SectionHead title="Wildlife" color="text-nature-main" source="NBN Atlas · within 2km" />
          <p className="text-gray-600 mb-5">
            {formatNumber(species.totalRecords)} records across {species.groups.length} groups
          </p>
          {species.groups.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm mb-8">
              {species.groups.map((g: any) => (
                <div key={g.name} className="flex justify-between">
                  <span className="text-gray-700">{g.name}</span>
                  <span className="text-patch-muted tabular-nums ml-2">{formatNumber(g.count)}</span>
                </div>
              ))}
            </div>
          )}
          {species.topSpecies.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-patch-muted uppercase tracking-wider mb-3">Top species</h3>
              {species.topSpecies.map((s: any) => (
                <div key={s.name} className="data-row">
                  <span className="text-gray-700 italic">{s.name}</span>
                  <span className="text-patch-muted tabular-nums">{formatNumber(s.count)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Ancient Trees ── oak green */}
      {ancientTrees && ancientTrees.count > 0 && (
        <section className="mb-10 border-l-[3px] border-trees-main pl-5 md:pl-6">
          <SectionHead title="Ancient & Veteran Trees" color="text-trees-main" source="Woodland Trust ATI · within ~5km" />
          <p className="text-gray-600 mb-5">
            {ancientTrees.count} tree{ancientTrees.count !== 1 ? 's' : ''} recorded nearby
          </p>
          {Object.keys(ancientTrees.byCategory).length > 0 && (
            <div className="flex gap-4 mb-5 text-sm">
              {Object.entries(ancientTrees.byCategory).map(([cat, count]: [string, any]) => (
                <span key={cat} className="text-gray-700">
                  <span className="font-semibold">{count}</span> {cat.toLowerCase()}
                </span>
              ))}
            </div>
          )}
          {ancientTrees.bySpecies.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
              {ancientTrees.bySpecies.map(([species, count]: [string, number]) => (
                <div key={species} className="flex justify-between">
                  <span className="text-gray-700">{species}</span>
                  <span className="text-patch-muted tabular-nums ml-2">{count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Nature & Conservation ── emerald */}
      {naturalEngland && (naturalEngland.sssis.length > 0 || naturalEngland.nnrs.length > 0 || naturalEngland.greenSpaces.length > 0 || naturalEngland.openAccess) && (
        <section className="mb-10 border-l-[3px] border-conservation-main pl-5 md:pl-6">
          <SectionHead title="Nature &amp; Conservation" color="text-conservation-main" source="Natural England · within 3km" />

          {naturalEngland.openAccess && (
            <div className="bg-conservation-light border border-emerald-200 px-4 py-3 mb-5 text-sm text-emerald-800">
              <span className="font-semibold">🥾 Open access land nearby</span> — right to roam under the CRoW Act 2000
            </div>
          )}

          {naturalEngland.sssis.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-patch-muted uppercase tracking-wider mb-3">Sites of Special Scientific Interest</h3>
              {naturalEngland.sssis.map((s: any) => (
                <div key={s.name} className="data-row">
                  <div className="min-w-0 mr-3">
                    <span className="text-gray-700">{s.name}</span>
                    {s.areaHa && <span className="text-patch-muted text-xs ml-2">{s.areaHa.toFixed(1)} ha</span>}
                  </div>
                  <span className="text-patch-muted tabular-nums shrink-0">{s.distance.toFixed(1)}km</span>
                </div>
              ))}
            </div>
          )}

          {naturalEngland.nnrs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-patch-muted uppercase tracking-wider mb-3">National Nature Reserves</h3>
              {naturalEngland.nnrs.map((n: any) => (
                <div key={n.name} className="data-row">
                  <div className="min-w-0 mr-3">
                    <span className="text-gray-700">{n.name}</span>
                    {n.areaHa && <span className="text-patch-muted text-xs ml-2">{n.areaHa.toFixed(1)} ha</span>}
                  </div>
                  <span className="text-patch-muted tabular-nums shrink-0">{n.distance.toFixed(1)}km</span>
                </div>
              ))}
            </div>
          )}

          {naturalEngland.greenSpaces.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-patch-muted uppercase tracking-wider mb-3">Country Parks</h3>
              {naturalEngland.greenSpaces.map((g: any) => (
                <div key={g.name} className="data-row">
                  <div className="min-w-0 mr-3">
                    <span className="text-gray-700">{g.name}</span>
                    {g.areaHa && <span className="text-patch-muted text-xs ml-2">{g.areaHa.toFixed(1)} ha</span>}
                  </div>
                  <span className="text-patch-muted tabular-nums shrink-0">{g.distance.toFixed(1)}km</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Bathing Water ── ocean */}
      {bathingWater && bathingWater.sites.length > 0 && (
        <section className="mb-10 border-l-[3px] border-ocean-main pl-5 md:pl-6">
          <SectionHead title="Bathing Water" color="text-ocean-main" source="Environment Agency" />
          {bathingWater.sites.map((site: any) => (
            <div key={site.name} className="data-row">
              <div className="min-w-0 mr-3">
                <span className="text-gray-700">{site.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <QualityDot classification={site.classification} />
                <span className="text-patch-muted tabular-nums">{site.distance.toFixed(1)}km</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Air Quality ── teal */}
      {airQuality && airQuality.stations.length > 0 && (
        <section className="mb-10 border-l-[3px] border-air-main pl-5 md:pl-6">
          <SectionHead title="Air Quality" color="text-air-main" source="DEFRA UK-AIR network" />
          <p className="text-gray-600 mb-5">
            Nearest monitoring stations from {formatNumber(airQuality.totalStations)} across the UK
          </p>
          {airQuality.stations.map((s: any, i: number) => (
            <div key={i} className="data-row">
              <div className="min-w-0 mr-3">
                <span className="text-gray-700">{s.name}</span>
                <div className="text-xs text-patch-muted mt-0.5">
                  {s.pollutants.join(' · ')}
                </div>
              </div>
              <span className="text-patch-muted tabular-nums shrink-0">{s.distance.toFixed(1)}km</span>
            </div>
          ))}
        </section>
      )}

      {/* ── Crime ── slate */}
      {crime && (
        <section className="mb-10 border-l-[3px] border-safety-main pl-5 md:pl-6">
          <SectionHead title="Crime" color="text-safety-main" source={`Police UK · ${crime.month}`} />
          <p className="text-gray-600 mb-5">
            {formatNumber(crime.total)} incidents nearby
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {crime.byCategory.slice(0, 10).map((c: any) => (
              <div key={c.category} className="data-row">
                <span className="text-gray-700 capitalize">{c.category}</span>
                <span className="font-semibold tabular-nums">{c.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── House Prices ── amber */}
      <section className="mb-10 border-l-[3px] border-property-main pl-5 md:pl-6">
        <SectionHead title="House Prices" color="text-property-main" source="Land Registry" />
        {housePrices && housePrices.sales.length > 0 ? (
          <>
            <p className="text-gray-600 mb-5">
              Average <span className="font-serif font-semibold text-property-main text-xl">£{formatNumber(housePrices.averagePrice)}</span> from {housePrices.count} sales
            </p>
            {housePrices.sales.slice(0, 8).map((s: any, i: number) => (
              <div key={i} className="data-row">
                <div className="min-w-0 mr-4">
                  <div className="text-gray-700 truncate">{s.address || 'Property'}</div>
                  <div className="text-patch-muted text-xs capitalize">{s.type} · {s.date}</div>
                </div>
                <span className="font-semibold tabular-nums shrink-0">£{formatNumber(s.amount)}</span>
              </div>
            ))}
          </>
        ) : (
          <p className="text-gray-600">No sales data for this postcode.</p>
        )}
      </section>

      {/* ── Heritage ── warm brown */}
      {listedBuildings && listedBuildings.count > 0 && (
        <section className="mb-10 border-l-[3px] border-heritage-main pl-5 md:pl-6">
          <SectionHead title="Listed Buildings" color="text-heritage-main" source="Historic England · within 1km" />
          <p className="text-gray-600 mb-5">
            {listedBuildings.count} listed building{listedBuildings.count !== 1 ? 's' : ''} within 1km
          </p>
          {Object.keys(listedBuildings.byGrade).length > 0 && (
            <div className="flex gap-4 mb-5 text-sm">
              {['I', 'II*', 'II'].filter(g => listedBuildings.byGrade[g]).map(grade => (
                <span key={grade} className="text-gray-700">
                  <span className="font-semibold">{listedBuildings.byGrade[grade]}</span> Grade {grade}
                </span>
              ))}
            </div>
          )}
          {listedBuildings.buildings.slice(0, 20).map((b: any, i: number) => (
            <div key={i} className="data-row">
              <div className="min-w-0 mr-3">
                <span className="text-gray-700 text-sm">{b.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <GradeBadge grade={b.grade} />
                {b.listDate && <span className="text-patch-muted text-xs tabular-nums">{b.listDate}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Flooding ── blue */}
      <section className="mb-10 border-l-[3px] border-flood-main pl-5 md:pl-6">
        <SectionHead title="Flood Risk" color="text-flood-main" source="Environment Agency · within 10km" />

        {/* Active warnings — prominent */}
        {floodWarnings && floodWarnings.count > 0 ? (
          <div className="bg-amber-50 border border-amber-200 px-4 py-3 mb-5">
            <p className="font-semibold text-amber-800 text-sm mb-2">⚠ {floodWarnings.count} active flood warning{floodWarnings.count !== 1 ? 's' : ''} in this area</p>
            {floodWarnings.warnings.map((w: any, i: number) => (
              <div key={i} className="mb-2 last:mb-0">
                <p className="text-gray-700 text-sm">{w.description}</p>
                {w.area && <p className="text-amber-700 text-xs">{w.area}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 mb-5">
            <p className="text-emerald-800 text-sm">No active flood warnings for this area.</p>
          </div>
        )}

        {floodStations && (
          <>
            {/* Context — rivers and catchment */}
            <p className="text-gray-600 mb-3">
              This area sits within the <span className="font-medium">{floodStations.catchments?.[0] || 'local'}</span> catchment.
              {floodStations.rivers?.length > 0 && (
                <> The Environment Agency monitors {floodStations.rivers.length === 1
                  ? <span className="font-medium">{floodStations.rivers[0]}</span>
                  : <>{floodStations.rivers.slice(0, 3).map((r: string, i: number) => (
                      <span key={r}>{i > 0 && (i === Math.min(floodStations.rivers.length, 3) - 1 ? ' and ' : ', ')}<span className="font-medium">{r}</span></span>
                    ))}{floodStations.rivers.length > 3 && ` and ${floodStations.rivers.length - 3} other waterway${floodStations.rivers.length - 3 !== 1 ? 's' : ''}`}</>
                } nearby.</>
              )}
            </p>
            <p className="text-gray-600 mb-5">
              {floodStations.count} monitoring station{floodStations.count !== 1 ? 's' : ''} within 10km track river levels and rainfall.
            </p>

            {/* Station list — with distance and river */}
            <h3 className="text-xs font-semibold text-patch-muted uppercase tracking-wider mb-3">Nearest stations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {floodStations.stations.map((s: any, i: number) => (
                <div key={i} className="data-row">
                  <div className="min-w-0">
                    <span className="text-gray-700">{s.label}</span>
                    {s.river && <span className="text-patch-muted text-xs ml-2">{s.river}</span>}
                  </div>
                  <span className="text-patch-muted text-xs shrink-0 tabular-nums">{s.distance?.toFixed(1)}km</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </article>
  )
}

function StatBox({ value, label, borderColor, textColor }: { value: string; label: string; borderColor: string; textColor: string }) {
  return (
    <div className={`bg-white border border-patch-line border-t-[3px] ${borderColor} py-4 px-4`}>
      <div className={`text-2xl font-serif font-semibold ${textColor} leading-none`}>{value}</div>
      <div className="text-xs text-patch-muted mt-1.5">{label}</div>
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

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    'I': 'bg-amber-700 text-white',
    'II*': 'bg-amber-600 text-white',
    'II': 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[grade] || 'bg-gray-100 text-gray-600'}`}>
      {grade}
    </span>
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

function shortNum(n: number | undefined | null): string {
  if (n == null) return '—'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'm'
  if (n >= 100000) return (n / 1000).toFixed(0) + 'k'
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString('en-GB')
}
