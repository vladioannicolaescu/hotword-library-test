import express from 'express'

import { main } from './main.js'

const app = express()

// Modified function name ... Update it if you want to use this
app.get('/', (req, res) => main(req, res) )

app.listen(7007)
