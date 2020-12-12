var { roverCfg, environment } = require('./data/store')

const getRoverStatus = () => {
    return {
        "rover": {
            "location": {
                "row": roverCfg["deploy-point"].row,
                "column": roverCfg["deploy-point"].column
            },
            "battery": roverCfg['initial-battery'],
            "inventory": roverCfg.inventory
        },
        "environment": {
            "temperature": environment.temperature,
            "humidity": environment.humidity,
            "solar-flare": environment['solar-flare'],
            "storm": environment.storm,
            "terrain": environment["area-map"][roverCfg["deploy-point"].row][roverCfg["deploy-point"].column]
        },
        "state": roverCfg.state || "normal", /** assuming state is normal */
        "alive": roverCfg.alive || true
    }
}

function checkIfRoverCanMove(direction) {
    roverLocation = getRoverStatus().rover.location;
    if ((direction == 'up' && roverLocation.row <= 0) ||
        (direction == 'down' && roverLocation.row >= environment['area-map'].length - 1) ||
        (direction == 'left' && roverLocation.column <= 0) ||
        (direction == 'right' && roverLocation.column >= environment['area-map'][0].length - 1)
    ) return false;

    return true;
}

function checkIfItIsStorm() {
    return environment['storm'];
}

function updateRoverCfg(newConfig) {
    roverCfg = Object.assign({}, newConfig)
    roverCfg.alive = true
    roverCfg.state = "normal"
    console.log('roverCfg updated')
}

function updateEnvironment(newEnv) {
    environment = Object.assign({}, newEnv)
    console.log('env updated')
}

function moveRover(direction) {
    //check if direction is valid or not
    if ( direction != 'up' && direction != 'down' &&
         direction != 'left' && direction != 'right') {
        return;
    }

    if (direction == 'up') {
        roverCfg['deploy-point']['row'] -= 1
    } else if (direction == 'down') {
        roverCfg['deploy-point']['row'] += 1
    } else if (direction == 'left') {
        roverCfg['deploy-point']['column'] -= 1
    } else if (direction == 'right') {
        roverCfg['deploy-point']['column'] += 1
    }

    roverCfg['initial-battery'] -= 1
}

function actionPermitted(action) {
    var permitted = false;
    var currentRoverState = roverCfg.state;
    var state = roverCfg.states.filter(state => state.name == currentRoverState)

    if(!state || state.length == 0) { 
        return false;
    }

    actionsAllowed = state[0].allowedActions;
    for (var ind = 0; ind < actionsAllowed.length; ind++) {
        if (action == actionsAllowed[ind]) {
            permitted = true;
            break;
        }
    }
    return permitted;
}

function chargeBatteryBy(percent) {
    roverCfg['initial-battery'] = percent; // 
    if(roverCfg.state && roverCfg.state == 'immobile') {
        roverCfg.state = 'normal'
    }
}

module.exports = {
    getRoverStatus,
    updateRoverCfg,
    updateEnvironment,
    checkIfRoverCanMove,
    checkIfItIsStorm,
    moveRover,
    actionPermitted,
    chargeBatteryBy
}