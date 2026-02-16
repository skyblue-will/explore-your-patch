import { NextRequest, NextResponse } from 'next/server'
import { lookupPostcode, getCrime, getFloodStations, getFloodWarnings, getHousePrices, getBathingWater, getSpecies, getListedBuildings, getAirQuality, getAncientTrees } from '../../../../lib/apis'

export async function GET(
  _req: NextRequest,
  { params }: { params: { postcode: string } }
) {
  const postcode = decodeURIComponent(params.postcode).replace(/\s+/g, ' ').trim()

  const location = await lookupPostcode(postcode)
  if (!location) {
    return NextResponse.json({ error: 'Postcode not found' }, { status: 404 })
  }

  // Fetch all data sources in parallel
  const [crime, floodStations, floodWarnings, housePrices, bathingWater, species, listedBuildings, airQuality, ancientTrees] = await Promise.all([
    getCrime(location.lat, location.lng),
    getFloodStations(location.lat, location.lng),
    getFloodWarnings(location.lat, location.lng),
    getHousePrices(location.postcode),
    getBathingWater(location.lat, location.lng),
    getSpecies(location.lat, location.lng),
    getListedBuildings(location.lat, location.lng),
    getAirQuality(location.lat, location.lng),
    getAncientTrees(location.lat, location.lng),
  ])

  return NextResponse.json({
    location,
    crime,
    floodStations,
    floodWarnings,
    housePrices,
    bathingWater,
    species,
    listedBuildings,
    airQuality,
    ancientTrees,
  })
}
