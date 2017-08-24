// made availabe by webpack plugins
// Unused VARS in .env are NOT included in the bundle
const node_env = (process.env.NODE_ENV !== undefined
    ? process.env.NODE_ENV
    : '') as string
export const ISPRODUCTION = node_env.toUpperCase() === 'PRODUCTION'

if (!(process.env.PRODUCTION_HOST && process.env.DEVELOPMENT_HOST)) {
    throw 'PRODUCTION_HOST and DEVELOPMENT_HOST must be defined in env'
}

export const API_HOST = process.env.API_HOST
    ? process.env.API_HOST as string
    : ISPRODUCTION ? process.env.PRODUCTION_HOST : process.env.DEVELOPMENT_HOST
