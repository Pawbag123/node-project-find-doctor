# Find Doctor

## Overview
Find Doctor is a project that lets users create accounts as patients or doctors and schedule appointments, based od doctors' specialty, treated causes, and distance

## Quickstart

### Prerequisites:
You need to have docker installed on your computer, as well as you need to have your own google api key enabled for geocoding

### Start App:
To start, firstly clone this repo:
`git clone <https://github.com/...>`

secondly, in `docker-compose.yaml` change `GOOGLE_API_KEY` placeholder for your own key

then, you can build and run app by:
`docker-compose up`

and stop by:
`docker-compose down`

## Additional info
On initial build, indexes for database are created, and database is populated with example patients:
`carljones@email.com`
`jenniferstacy@email.com`
and doctors:
`johndoe@email.com`
`janethomas@email.com`
`markjohnson@email.com`
with passwords equal to emails


## Endpoints

detailed documentation for API endpoints can be found here:
 [API DOCUMENTATION](https://documenter.getpostman.com/view/31561084/2sAXqmBRRP).
