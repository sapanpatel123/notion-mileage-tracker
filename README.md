# notion-mileage-tracker

Update a Notion database with mileage between a starting address and location using Google Maps.

## Requirements

Create a Notion database with the following:

1. Text column named `Location` which contains a location in form of address or landmark name
2. Number column named `Mileage` which will be populated by this integration

## Setup

1. Follow the instructions on this [page](https://developers.notion.com/docs/create-a-notion-integration) to create a new Notion integration
2. Create a Google Maps API key with these [instructions](https://developers.google.com/maps/documentation/javascript/get-api-key)
3. Once you get to step 4 of the Notion instructions, create a `.env.` file in the root of this repo with the following:

```
NOTION_API_KEY =
NOTION_API_DATABASE =
GOOGLE_MAPS_API_KEY =
STARTING_ADDRESS = ""
```

4. Run the integration with the following command:

```
npm start
```

5. Check your Notion database and confirm it's been updated!
