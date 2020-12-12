var environment = {
    "temperature": 60,
    "humidity": 65,
    "solar-flare": false,
    "storm": false,
    "area-map": [
        ["dirt", "dirt", "dirt", "water", "dirt"],
        ["dirt", "dirt", "water", "water", "water"],
        ["dirt", "dirt", "dirt", "water", "dirt"],
        ["dirt", "dirt", "dirt", "dirt", "dirt"],
        ["dirt", "dirt", "dirt", "dirt", "dirt"]
    ]
}



var roverCfg = {
    "scenarios": [
        {
            "name": "battery-low",
            "conditions": [
                {
                    "type": "rover",
                    "property": "battery",
                    "operator": "lte",
                    "value": 2
                }
            ],
            "rover": [
                { "is": "immobile" }
            ]
        },
        {
            "name": "encountering-water",
            "conditions": [
                {
                    "type": "environment",
                    "property": "terrain",
                    "operator": "eq",
                    "value": "water"
                }
            ],
            "rover": [
                {
                    "performs": {
                        "collect-sample": {
                            "type": "water-sample",
                            "qty": 2
                        }
                    }
                }
            ]
        },
        {
            "name": "encountering-storm",
            "conditions": [
                {
                    "type": "environment",
                    "property": "storm",
                    "operator": "eq",
                    "value": true
                }
            ],
            "rover": [
                {
                    "performs": {
                        "item-usage": {
                            "type": "storm-shield",
                            "qty": 1
                        }
                    }
                }
            ]
        }
    ],
    "states": [
        {
            "name": "normal",
            "allowedActions": ["move", "collect-sample"]
        },
        {
            "name": "immobile",
            "allowedActions": ["collect-sample"]
        }
    ],
    "deploy-point": {
        "row": 3,
        "column": 1
    },
    "initial-battery": 11,
    "inventory": [
        {
            "type": "storm-shield",
            "qty": 1,
            "priority": 1
        }
    ]
}

var roverAlive = true

roverCfg.alive = true
roverCfg.state = 'normal'

module.exports = { roverCfg , environment, roverAlive }