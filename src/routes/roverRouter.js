const router = require('express').Router()
const bodyParser = require('body-parser')
const {  
    getRoverStatus, 
    updateRoverCfg,
    updateEnvironment, 
    checkIfItIsStorm, 
    checkIfRoverCanMove, 
    moveRover, 
    actionPermitted,
    chargeBatteryBy } = require('../utils')
const verifyScenarios = require('../verification')
var { roverCfg, environment } = require('../data/store')
const { CANNOT_MOVE_DURING_STORM, CANNOT_MOVE_OUT_OF_BOUND, OPERATION_NOT_PERMITTED } = require('../errors/errors')

router.use(bodyParser.json())

router.get('/environment', (req, res) => {
    res.json(environment)
})
router.patch('/environment', (req, res) => {
    console.log(req.body)
    body = req.body

    for(var key in body) {
        if(key == "temperature") {
            environment.temperature = body[key]
        } else if(key == "humidity") {
            environment.humidity = body[key]
        } else if(key == "solar-flare") {
            environment["solar-flare"] = body[key]
            chargeBatteryBy(30); // Assuming we can charge battery by 30 points with solar energy
        } else if(key == "storm") {
            environment.storm = body[key]
        } else if(key == "area-map") {
            environment["area-map"] = body[key]
        }
    }
    //let us verify scenarios after changing the env variable -- 
    verifyScenarios();

    res.json(environment)
})


router.post('/environment/configure', (req, res) => {
    updateEnvironment(req.body);
    res.json(environment)
})


router.post('/rover/configure', (req, res) => {
    updateRoverCfg(req.body)
    res.json(roverCfg)
})
router.get('/rover/configure', (req, res) => {
    res.json(roverCfg)
})

router.post('/rover/move', (req, res) => {
    let roverBattery = roverCfg['initial-battery']

    // check if battery is down
    if(roverBattery <= 0) {
        return res.sendStatus(503)
    }
    
    // check if weather condition is storm
    if(checkIfItIsStorm() ) {
        return res.status(428).json({"message": CANNOT_MOVE_DURING_STORM})
    }

    direction = req.body.direction  

    // check if rover can move in given direction
    if(!checkIfRoverCanMove(direction)) {
        return res.status(428).json({"message": CANNOT_MOVE_OUT_OF_BOUND})
    }

    // check if action permitted at current state of rover 
    if(!actionPermitted('move')) {
        return res.status(403).json({"message": OPERATION_NOT_PERMITTED, "roverState": roverCfg.state})
    }

    // move rover */
    moveRover(direction); 

    // check rover conditions based on scenarios
    verifyScenarios();

    return res.status(200).json(getRoverStatus())
})


router.get('/rover/status', (req, res) => {
    res.json(getRoverStatus())
})

module.exports = router
