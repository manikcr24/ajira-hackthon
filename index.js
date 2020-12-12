const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const PORT = process.env.PORT || 4000

const roverRouter = require('./src/routes/roverRouter')
const { roverCfg } = require('./src/data/store')

// middleware to verify if rover is alive
app.use((req, res, next) => { 
    if(!roverCfg.alive) 
        return res.sendStatus(500) 
    next();
})

app.use('/api', roverRouter)
app.use(bodyParser.json())

app.listen(PORT, () => console.log(`listening at ${PORT}`))