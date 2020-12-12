var {roverCfg, environment} = require('./data/store');
const { getRoverStatus, actionPermitted } = require("./utils");

function verifyScenarios() {
    // get all scenarios
    scenarios = roverCfg.scenarios

    //if any scenario matches current situation, then get perform the roverActions
    scenarios.forEach(scenario => {
        //get conditions to be satisfied for current scenarios
        conditions = scenario.conditions;

        //get roverActions to be performed if all conditions are satisfied
        roverActions = scenario.rover;

        // validate all conditions 
        let allConditionsSatisfied = true; /** let us assume all conditions are satisfied */
        for (var condition in conditions) {
            //check if the current condition is satisfied
            if (!isConditionSatisfied(conditions[condition])) {
                allConditionsSatisfied = false;
                break;
            }
        }

        console.log(`allConditionsSatisfied for ${scenario.name} ` + allConditionsSatisfied.toString().toUpperCase())
        
        if (allConditionsSatisfied) {
            //get roverActions to be performed if all conditions are satisfied
            roverActions = scenario.rover;

            console.log('Performing actions')
            console.log(JSON.stringify(roverActions))

            //perform roverActions
            roverActions.forEach( roverAction => performRoverAction(roverAction))
        }
        console.log()

    });

}


function performRoverAction(roverActions) {
    let roverIs = roverActions.is

    if(roverIs) {
        roverCfg.state = roverIs;
    }

    let performs = roverActions.performs
    console.log(JSON.stringify(performs))
    if (performs) {  // check if rover wants to perform any task
        console.log('performing action')
        let performCollectSample = performs['collect-sample']
        let performItemUsage = performs['item-usage']

        if (performCollectSample) {
            if(!actionPermitted('collect-sample')) {
                return res.json({"message": "Cannot make this operation at current state"});
            }
            console.log('performing action of type COLLECT-SAMPLE')
            let sampleType = performCollectSample['type']
            let sampleQty = performCollectSample['qty']

            //if no space in inventory --  remove low priority items from inventory
            /*****************************************************************/
            /**   This case is not mentioned in the problem description.     */
            /**   So, considering infinite roon in rover's inventory module  */
            /**   If there is such requirement, it would fit here.           */
            /*****************************************************************/


            //add item into inventory
            addToInventory({"type": sampleType,"quantity": sampleQty,"priority": 1});
           
        }

        if (performItemUsage) {
            console.log('performing action of type ITEM-USAGE')
            let usageItemType = performItemUsage['type']
            let usageQty = performItemUsage['qty']

            //remove item from inventory
            let inventory = roverCfg.inventory
            let spliceIndex = -1
            let itemFound = false
            for (var ind in inventory) {
                if (inventory[ind].type == usageItemType) {
                    itemFound = true
                    spliceIndex = ind
                    if (usageQty > inventory[ind].qty || inventory[ind].qty <= 0)  { 
                        console.log("Cannot use item...")
                        roverCfg.alive = false
                    } else {
                        inventory[ind].qty -= usageQty
                    }
                    break
                }
            }

        }

    }


}


function addToInventory(item) {
    var itemExists = false;

    // If item already exists in the inventory, we would just increase the quantity.
    // Assuming we can increase the quantity if same sample is collected multiple times. 
    // Problem statement does not mention on what we should do when same sample is collected multiple times.
    roverCfg.inventory.forEach(inventoryItem => {
        if(inventoryItem.type == item.type) {
            inventoryItem.qty += item.quantity;
            itemExists = true;
        }
    })

    
    if(!itemExists) {
        roverCfg.inventory.push({
            "type": item.type,
            "qty": item.quantity,
            "priority": item.priority || 1
        })
    }
}


const isConditionSatisfied = condition => {
    let satisfied = true;
    /** lets validate the state against the condition here */

    let type = condition.type
    let property = condition.property
    let operator = condition.operator
    let value = condition.value

    if (type == 'rover') {
        roverPropertyValue = getRoverAttribute(property)
        if (!isTrue(roverPropertyValue, operator, value)) {
            satisfied = false;
            return satisfied;
        }
    }

    else if (type == 'environment') {
        environmentPropertyValue = getEnvironmentAttribute(property)
        if (!isTrue(environmentPropertyValue, operator, value)) {
            satisfied = false;
            return satisfied;
        }
    }

    return satisfied;
}

function getRoverAttribute(property) {
    if (property == 'battery') return roverCfg['initial-battery']
    
    //assuming there are no other rover properties. 
    //If there are any, we can scale this method
    return undefined; 
}

function getEnvironmentAttribute(property) {
    if (property == 'terrain') {
        let location = getRoverStatus(roverCfg, environment).rover.location
        return environment['area-map'][location.row][location.column]
    }

    if (property == 'temperature') return environment.temperature;
    if (property == 'humidity') return environment.humidity;
    if (property == 'solar-flare') return environment['solar-flare'];
    if (property == 'storm') return environment.storm;
    if (property == 'area-map') return environment['area-map'];
}

function isTrue(lhs, opr, rhs) {
    if (opr == 'eq') return lhs == rhs;
    if (opr == 'ne') return lhs != rhs;
    if (opr == 'lt') return lhs < rhs;
    if (opr == 'gt') return lhs > rhs;
    if (opr == 'lte') return lhs <= rhs;
    if (opr == 'gte') return lhs >= rhs;
}


module.exports = verifyScenarios