// made availabe by webpack plugins
// Unused VARS in .env are NOT included in the bundle
const ISPRODUCTION = process.env.NODE_ENV === 'production'

export const API_HOST = ISPRODUCTION
    ? process.env.PRODUCTION_HOST
    : process.env.DEVELOPMENT_HOST
