const chalk = require('chalk');
const Gpio = require('onoff').Gpio;
const mcpadc = require('mcp-spi-adc'); // imported node modules

const wet = 395;
const dry = 780; // soil moisture calibration
// keep them at default until the moisture is properly calibrated

const pumpRelay = new Gpio(17, 'high'); // communicates with the water pump relay
// IMPORTANT - use 'high' if relay uses low level trigger

function sensorReadings(sensor) {
    return new Promise((resolve, reject) => {
        sensor.read((readError, reading) => {
            if (readError) {
                return reject(new Error(`${chalk.red('error')} ${readError}`));
                // prints sensor reading error
                // GOAL - push error to front end
            }
            return resolve(reading);
            // GOAL - push reading to front end
        });
    });
}; // gathers a reading from moisture sensor
    
function getMoistureLevel() {
    const readingPromises = [];
    let readings = {};
    readings.rawValues = [];
    readings.values = [];

    return new Promise((resolve, reject) => {
        const sensor = mcpadc.open(5, { speedHz: 20000 }, (error) => {
            
            if (error) {
                return reject(new Error(`${chalk.red('error')} ${error}`));
                // prints sensor access error
                // GOAL - push error to front end
            }

            let iterator = 50; // large number of readings needed for better accuracy 

            while (iterator >= 0) {
                readingPromises.push(getSensorReadings(sensor)
                    .then(reading => {
                        readings.rawValues.push(reading.rawValue);
                        readings.values.push(reading.value);
                    }).catch(error => {
                        return reject(error);
                    })
                );
                iterator--;
            }

            return Promise.all(readingPromises).then(() => {
                const averageRawValue = readings.rawValues.reduce((a, b) => a + b, 0) / 50;
                const averageValue = readings.values.reduce((a, b) => a + b, 0) / 50;

                return resolve({
                    rawValue: averageRawValue,
                    value: averageValue,
                    soilDrynessPercentage: averageRawValue > 0
                        ? ((averageRawValue / wet) * 100).toFixed(0) : 0,
                });
            });
        });
    });
}; // reads moisture value from the sensor and returns it (or an error)
    
function shouldWater(moistureLevel) {
    // shifts value based on sensor and plant needs
    if (moistureLevel <= 45) {
        return true;
    }
    return false;
}; // determines whether the plant should be watered or not based on the soil dryness

function waterPlant() {
    return new Promise((resolve, reject) => {
        pumpRelay.read(async (error, status) => {
            if (error) {
                return reject(new Error(`${chalk.red('error')} ${error}`));
                // prints pump relay status error
                // GOAL - push error to front end
            }

            const moistureLevel = await getMoistureLevel();

            const needsWater = shouldWater(moistureLevel.soilDrynessPercentage);

            if (status !== 0 && needsWater) {
                pumpRelay.writeSync(0);
                // closes the circuit and starts the pump
            }

            return resolve({
                status: `the plant is being watered.`,
                // GOAL - push into front end
            });
        });
    });
}; // connects to the relay and pulls the relay status
// obtains moisture level from the moisture sensor
// checks to see if the moisture level from the moisture sensor
// turns on the relay if water is needed and relay is off

function stopWateringPlant() {
    return new Promise((resolve, reject) => {
        pumpRelay.read((error, status) => {
            if (error) {
                return reject(new Error(`${chalk.red('error')} ${error}`));
                // prints pump relay status error
                // GOAL - push error to front end
            }

            return resolve({
                status: `the plant is being watered.`,
            });
        });
    });
}; // connects to the relay
// if the relay is on, it gets turned off
// the water pump will stop watering the pump

/* 
    Write a block of code that triggers the following functions whenever
        the water command is clicked.

        waterPlant();
        stopWateringPlant();

        */

document.getElementById('water').onclick = waterPlant();
// water the plant when the water button is tapped/clicked.


// credits

// https://medium.com/going-fullstack/watering-plants-with-a-raspberry-pi-36eac51b8d23
// https://gist.github.com/rdeprey/6395b808c9b72213d8a3f298a63efaca