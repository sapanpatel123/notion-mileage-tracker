require("dotenv").config();

const { Client: NotionClient } = require("@notionhq/client");
const { Client: MapsClient } = require("@googlemaps/google-maps-services-js");

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });
const maps = new MapsClient({});

const databaseId = process.env.NOTION_API_DATABASE;
const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
const startingAddress = process.env.STARTING_ADDRESS;

/**
 *
 * Retrieves an array of page id, name, and location from the Notion database
 */
async function getLocations() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "Date",
        direction: "ascending",
      },
    ],
  });

  const responseResults = response.results.map((page) => {
    return {
      id: page.id,
      name: page.properties.Name.title[0]?.plain_text,
      location: page.properties.Location.rich_text[0]?.plain_text,
    };
  });

  return responseResults;
}

/**
 *
 * Returns the distance in mileage between a start location and destination
 */
async function getMileage(startingAddress, destinationAddress) {
  const distance = await maps.distancematrix({
    params: {
      key: mapsKey,
      origins: [startingAddress],
      destinations: [destinationAddress],
      units: "imperial",
    },
  });

  let miles = distance.data.rows[0].elements[0].distance.text;
  return parseFloat(miles);
}

/**
 *
 * Gets the mileage for each location and returns an array
 */
async function calculateTrips(locations) {
  let trips = [];

  for (var key in locations) {
    let value = locations[key];
    let id = value.id;
    let name = value.name;
    let location = value.location;
    let mileage;

    if (typeof location != "undefined" && location != null) {
      mileage = await getMileage(startingAddress, `${location}`);
    }

    let t = {
      id: id,
      name: name,
      location: location,
      mileage: mileage,
    };

    trips.push(t);
  }
  return trips;
}

/**
 *
 * Inserts the mileage into the Mileage property given a page ID
 */
async function insertMileage(pageId, mileage) {
  await notion.pages
    .update({
      page_id: pageId,
      properties: {
        Mileage: {
          number: mileage,
        },
      },
    })
    .catch((e) => {
      console.log(e);
    });
}

/**
 *
 * Updates the Notion database
 */
async function updateNotion(trips) {
  for (var key in trips) {
    let value = trips[key];
    let pageId = value.id;
    let mileage = value.mileage;

    if (typeof mileage != "undefined" && mileage != null) {
      await insertMileage(pageId, mileage).catch((e) => {
        console.log(e);
      });
    }
  }

  return true;
}

async function main() {
  let locations = await getLocations();
  let trips = await calculateTrips(locations);
  await updateNotion(trips).then(() => {
    console.log("Done updating mileage...");
  });
}

main();
