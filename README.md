# Homer native backend
Backend for the homer mobile application

## Database setup for development

### Cloud-hosted dev instance
* Sign up for a free plan (Tiny Turtle) account at https://www.elephantsql.com/
* create a DB and copy the full DB url
* set this as the value for `export DATABASE_URL=<url>` in the `.env` file
* run `source .env` at the root of the directory

### Schema and dummy data
Run the following commands at the root of the directory:
`./node_modules/.bin/sequelize db:migrate`
`./node_modules/.bin/sequelize db:seed:all

If Sequelize is installed globally on the machine, simply run:
`sequelize db:migrate`
`sequelize db:seed:all`

## Documentation
The backend uses [apidoc](https://apidocjs.com/) to document the endpoints.

### Installation
To install the documentation package, run the following command: `npm install apidoc -g`

### Running
Run this at the root of the directory `apidoc -i app/ -o apidoc/`

### Viewing
You can then go to `/apidoc/index.html` to view the endpoints' documentation