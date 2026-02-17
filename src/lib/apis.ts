const CACHE_24H = { next: { revalidate: 86400 } } as RequestInit

// ─── Postcodes.io ───
export async function lookupPostcode(postcode: string) {
  const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, CACHE_24H)
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 200) return null
  const r = data.result
  return {
    postcode: r.postcode,
    lat: r.latitude,
    lng: r.longitude,
    admin_district: r.admin_district,
    parish: r.parish,
    lsoa: r.lsoa,
    region: r.region,
    country: r.country,
    admin_ward: r.admin_ward,
  }
}

// ─── Police UK Crime ───
export async function getCrime(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}`,
      { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const crimes: Array<{ category: string; month: string }> = await res.json()

    // Summarize by category
    const byCategory: Record<string, number> = {}
    crimes.forEach(c => {
      const cat = c.category.replace(/-/g, ' ')
      byCategory[cat] = (byCategory[cat] || 0) + 1
    })

    const sorted = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }))

    return { total: crimes.length, byCategory: sorted, month: crimes[0]?.month || 'unknown' }
  } catch { return null }
}

// ─── Flood Monitoring ───
export async function getFloodStations(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://environment.data.gov.uk/flood-monitoring/id/stations?lat=${lat}&long=${lng}&dist=10`,
      { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const allStations = data.items || []
    const stations = allStations.slice(0, 10).map((s: any) => ({
      label: s.label,
      river: s.riverName,
      town: s.town,
      catchment: s.catchmentName,
      status: s.status?.includes('Active') ? 'active' : s.status?.includes('Closed') ? 'closed' : 'unknown',
      lat: s.lat,
      lng: s.long,
      distance: haversine(lat, lng, s.lat, s.long),
    }))

    // Get unique rivers and catchments
    const rivers = Array.from(new Set(allStations.map((s: any) => s.riverName).filter(Boolean))) as string[]
    const catchments = Array.from(new Set(allStations.map((s: any) => s.catchmentName).filter(Boolean))) as string[]

    return { count: allStations.length, stations, rivers, catchments }
  } catch { return null }
}

export async function getFloodWarnings(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://environment.data.gov.uk/flood-monitoring/id/floods?lat=${lat}&long=${lng}&dist=20`,
      { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const warnings = (data.items || []).slice(0, 5).map((w: any) => ({
      description: w.description,
      severity: w.severityLevel,
      message: w.message,
      area: w.eaAreaName,
    }))
    return { count: data.items?.length || 0, warnings }
  } catch { return null }
}

// ─── Land Registry ───
export async function getHousePrices(postcode: string) {
  const formattedPostcode = postcode.toUpperCase().replace(/\s*/g, '').replace(/^(.+?)(\d\w\w)$/, '$1 $2')
  const sparql = `
    PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
    PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
    SELECT ?amount ?date ?propertyType ?paon ?street
    WHERE {
      ?tx lrppi:pricePaid ?amount ;
          lrppi:transactionDate ?date ;
          lrppi:propertyAddress ?addr .
      ?addr lrcommon:postcode "${formattedPostcode}" .
      OPTIONAL { ?addr lrcommon:paon ?paon }
      OPTIONAL { ?addr lrcommon:street ?street }
      OPTIONAL { ?tx lrppi:propertyType ?propertyType }
    }
    ORDER BY DESC(?date)
    LIMIT 20
  `
  try {
    const res = await fetch('https://landregistry.data.gov.uk/landregistry/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/sparql-results+json' },
      body: `query=${encodeURIComponent(sparql)}`,
      ...CACHE_24H,
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const results = (data.results?.bindings || []).map((b: any) => {
      const paon = b.paon?.value || ''
      const street = b.street?.value || ''
      const address = [paon, street].filter(Boolean).join(' ')
      return {
        amount: parseInt(b.amount?.value || '0'),
        date: b.date?.value,
        type: b.propertyType?.value?.split('/').pop() || 'unknown',
        address,
      }
    })

    const amounts = results.map((r: any) => r.amount).filter((a: number) => a > 0)
    const avg = amounts.length ? Math.round(amounts.reduce((s: number, a: number) => s + a, 0) / amounts.length) : 0

    return { sales: results, averagePrice: avg, count: results.length }
  } catch { return null }
}

// ─── Bathing Water Quality ───
export async function getBathingWater(lat: number, lng: number) {
  try {
    // The BWQ API doesn't support lat/lng search directly, so we get all and filter
    const res = await fetch(
      'https://environment.data.gov.uk/doc/bathing-water.json?_pageSize=50',
      { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const items = data.result?.items || []

    // Filter to nearest ones (rough distance calc)
    const withDist = items
      .filter((i: any) => i.lat && i.long)
      .map((i: any) => ({
        name: i.name,
        lat: i.lat,
        lng: i.long,
        classification: i.latestComplianceAssessment?.complianceClassification?.name || 'Unknown',
        district: i.district?.name || '',
        distance: haversine(lat, lng, i.lat, i.long),
      }))
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 5)

    return { sites: withDist }
  } catch { return null }
}

// ─── NBN Atlas Species ───
export async function getSpecies(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://records-ws.nbnatlas.org/occurrences/search?lat=${lat}&lon=${lng}&radius=2&pageSize=0&facets=species_group&facet=true`,
      { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()

    const groups: Array<{ name: string; count: number }> = (data.facetResults?.[0]?.fieldResult || [])
      .map((f: any) => ({ name: f.label, count: f.count }))
      .sort((a: any, b: any) => b.count - a.count)

    // Also get some actual species names
    const speciesRes = await fetch(
      `https://records-ws.nbnatlas.org/occurrences/search?lat=${lat}&lon=${lng}&radius=2&pageSize=0&facets=taxon_name&facet=true&flimit=20`,
      { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
    )
    let topSpecies: Array<{ name: string; count: number }> = []
    if (speciesRes.ok) {
      const sd = await speciesRes.json()
      topSpecies = (sd.facetResults?.[0]?.fieldResult || [])
        .map((f: any) => ({ name: f.label, count: f.count }))
        .slice(0, 15)
    }

    return {
      totalRecords: data.totalRecords || 0,
      groups,
      topSpecies,
    }
  } catch { return null }
}

// ─── Historic England Listed Buildings ───
export async function getListedBuildings(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://services-eu1.arcgis.com/ZOdPfBS3aqqDYPUQ/arcgis/rest/services/National_Heritage_List_for_England_NHLE_v02_VIEW/FeatureServer/0/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=1000&units=esriSRUnit_Meter&outFields=Name,Grade,ListDate,ListEntry&returnGeometry=false&f=json&resultRecordCount=200`,
      { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.error) return null

    // Grade sort order: I first, then II*, then II
    const gradeOrder: Record<string, number> = { 'I': 0, 'II*': 1, 'II': 2 }
    const buildings = (data.features || []).map((f: any) => ({
      name: f.attributes.Name,
      grade: f.attributes.Grade,
      listDate: f.attributes.ListDate ? new Date(f.attributes.ListDate).getFullYear() : null,
      listEntry: f.attributes.ListEntry,
    })).sort((a: any, b: any) => (gradeOrder[a.grade] ?? 3) - (gradeOrder[b.grade] ?? 3))

    const byGrade: Record<string, number> = {}
    buildings.forEach((b: any) => { byGrade[b.grade] = (byGrade[b.grade] || 0) + 1 })

    const exceeded = data.exceededTransferLimit || false
    return { buildings, count: buildings.length, byGrade, exceededLimit: exceeded }
  } catch (e) { console.error('Listed buildings error:', e); return null }
}

// ─── Air Quality (DEFRA UK-AIR) ───
// Disabled: API returns all 2,449 stations (~7-10s) with no geo filter.
// This exceeds Vercel's 10s function timeout and blocks the whole page.
// TODO: Pre-process station list or find a faster endpoint.
export async function getAirQuality(_lat: number, _lng: number) {
  return null
}

// ─── Ancient Trees (Woodland Trust ATI via ArcGIS) ───
export async function getAncientTrees(lat: number, lng: number) {
  try {
    // Query with bounding box (envelope) since point+distance doesn't work well with this service
    const delta = 0.05 // ~5km
    const res = await fetch(
      `https://services1.arcgis.com/k6HWkz7DMAcnnYfV/arcgis/rest/services/Ancient_Tree_Inventory/FeatureServer/0/query?geometry=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=Species,VETERAN&returnGeometry=true&outSR=4326&f=json&resultRecordCount=50`,
      { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.error) return null

    const trees = (data.features || []).map((f: any) => ({
      species: f.attributes.Species,
      category: f.attributes.VETERAN,
      distance: f.geometry ? haversine(lat, lng, f.geometry.y, f.geometry.x) : null,
    }))
      .sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999))

    const byCategory: Record<string, number> = {}
    const bySpecies: Record<string, number> = {}
    trees.forEach((t: any) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1
      bySpecies[t.species] = (bySpecies[t.species] || 0) + 1
    })

    return {
      trees: trees.slice(0, 20),
      count: trees.length,
      byCategory,
      bySpecies: Object.entries(bySpecies).sort((a, b) => b[1] - a[1]).slice(0, 10),
    }
  } catch { return null }
}

// ─── Natural England (SSSIs, NNRs, Country Parks, CRoW Open Access) ───
export async function getNaturalEngland(lat: number, lng: number) {
  const BASE = 'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services'
  const geoParams = `geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=3000&units=esriSRUnit_Meter&returnGeometry=true&outSR=4326&f=json`

  const fetchArcGIS = async (service: string, outFields: string, maxResults = 20) => {
    try {
      const res = await fetch(
        `${BASE}/${service}/FeatureServer/0/query?${geoParams}&outFields=${outFields}&resultRecordCount=${maxResults}`,
        { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) return null
      const data = await res.json()
      if (data.error) return null
      return data.features || []
    } catch { return null }
  }

  const [sssiFeatures, nnrFeatures, parkFeatures, crowCount] = await Promise.all([
    fetchArcGIS('SSSI_England', 'NAME,MEASURE'),
    fetchArcGIS('National_Nature_Reserves_England', 'NAME,MEASURE'),
    fetchArcGIS('Country_Parks_England', 'NAME,STATUS,MEASURE'),
    // CRoW: just count nearby
    (async () => {
      try {
        const res = await fetch(
          `${BASE}/CRoW_Act_2000_Access_Layer/FeatureServer/0/query?${geoParams}&returnCountOnly=true`,
          { ...CACHE_24H, signal: AbortSignal.timeout(5000) }
        )
        if (!res.ok) return 0
        const data = await res.json()
        return data.count || 0
      } catch { return 0 }
    })(),
  ])

  const calcDist = (f: any) => {
    if (!f.geometry) return 999
    // Polygons: use centroid approximation from rings
    if (f.geometry.rings) {
      const ring = f.geometry.rings[0]
      if (!ring || ring.length === 0) return 999
      let cx = 0, cy = 0
      for (const p of ring) { cx += p[0]; cy += p[1] }
      cx /= ring.length; cy /= ring.length
      return haversine(lat, lng, cy, cx)
    }
    return haversine(lat, lng, f.geometry.y, f.geometry.x)
  }

  const sssis = (sssiFeatures || []).map((f: any) => ({
    name: f.attributes.NAME,
    areaHa: f.attributes.MEASURE,
    distance: calcDist(f),
  })).sort((a: any, b: any) => a.distance - b.distance)

  const nnrs = (nnrFeatures || []).map((f: any) => ({
    name: f.attributes.NAME,
    areaHa: f.attributes.MEASURE,
    distance: calcDist(f),
  })).sort((a: any, b: any) => a.distance - b.distance)

  const greenSpaces = (parkFeatures || []).map((f: any) => ({
    name: f.attributes.NAME,
    status: f.attributes.STATUS,
    areaHa: f.attributes.MEASURE,
    distance: calcDist(f),
  })).sort((a: any, b: any) => a.distance - b.distance)

  return { sssis, nnrs, greenSpaces, openAccess: crowCount > 0 }
}

// ─── Helpers ───
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
