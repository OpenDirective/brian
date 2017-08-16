export const AUTH0_APPKEY = 'CoDxjf3YK5wB9y14G0Ee9oXlk03zFuUF'
export const AUTH0_DOMAIN = 'odbrian.eu.auth0.com'
export const AUTH0_LOCKOPTIONS = {
    allowedConnections: ['google-oauth2'],
    allowForgotPassword: false,
    allowSignUp: false,
    closable: false,
    auth: {
        connectionScopes: {
            'google-oauth2': ['https://picasaweb.google.com/data/']
        },
        params: {
            scope: 'openid profile photos',
            audience: 'https://brianAPI'
        },
        responseType: 'id_token token'
    },
    languageDictionary: {
        title: 'Sign into Google'
    }
}
export const API_ID = `https://brianAPI`
