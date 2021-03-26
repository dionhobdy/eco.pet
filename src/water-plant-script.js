const mcpadc = require('mcp-spi-adc');
const Gpio = require('onoff').Gpio;
const schedule = require('node-schedule'); // npm packages needed for the script

const completelyWet = 395;
const completelyDry = 780; // constants needed to determine how wet or dry the plant soil is.
// calibrate the soil moisture to sensor

const pumpRelay = new Gpio(17, 'high'); // interacts with the relay that's connected to the water pump.
// IMPORTANT: Use 'high' if relay uses low level trigger

function getSensorReadings(sensor) {
    return new Promise ((resolve, reject) => {
        sensor.read((readError, reading) => {
            if (readError) {
                return reject (new Error(`There was an error getting the sensor reading: ${readError}`));
            }
            return resolve(reading);
        });
    });};

function getMoistureLevel() {
    const readingPromises = [];
    let readings = {};
    readings.rawValues = [];
    readings.values = [];

    return new Promise((resolve, reject) => {
        const sensor = mcpadc.open(5, {speedHz: 20000}, (error) => {
            if (error) {
                return reject(new Error(`There was an error accessing the sensor: ${error}`));
            }

            let iterator = 50; // Just need a large number of readins to try for better accuracy

            while (iterator >= 0) {
                readingPromises.push(getSensorReadings (sensor)
                    .then (reading => {
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
        ? ((averageRawValue / completelyWet) * 100).toFixed(0) : 0,
                });
            });
        });
    });}; // reads a value from the sensor and returns the value or an error.

    function shouldWater(moistureLevel) {
        // adjust value based on your sensor and needs of your plant
        if (moistureLevel <= 45) {
            return true;
        }
        return false;
    };  // determinds whether the plant should be watered or not based on the soil dryness

    function waterThePlant() {
        return new Promise((resolve, reject) => {
            pumpRelay.read(async (error, status) => {
                if (error) {
                    return reject(new Error(`There was an error getting the pump relay status: ${error}`));
                }

                const moistureLevel = await getMoistureLevel();

                const needsWater = shouldWater(moistureLevel.soilDrynessPercentage);

                if (status !== 0 && needsWater) {
                    pumpRelay.writeSync(0);
                    // closes the circuit and starts the pump
                }

                return resolve({
                    status: `The plant is being watered.`,
                });
            });
        });
    }; // connects to the relay and pulls the relay status
    // obtains moisture level from the moisture sensor
    // checks to see if the moisture level and if the plant needs it
    // turns on the relay if water is needed and relay is off

    function stopWateringPlant() {
        return new Promise((resolve, reject) => {
            pumpRelay.read((error, status) => {
                if (error) {
                    return reject(new Error(`There was an error getting the pump relay status: ${error}`));
                }

                if (status !== 1) {
                    pumpRelay.writeSync(1);
                    // opens the circuit and stops the pump
                }

                return resolve({
                    status: `The plant is not being watered.`,
                });
            });
        });
    }; // connects to the relay
    // if the relay is on, it gets turned off
    // the water pump will stop watering the pump

    const shouldWaterPlant = () => {
        // run every day at 7 a.m.
        return schedule.scheduleJob('0 7 * * *', async () => {
            // water the plant for three seconds
            setTimeout(() => {
                waterThePlant();

                setTimeout(() => {
                    stopWateringPlant();
                }, 3000);
            }, 3000);
        });
    }; // runs on schedule to water the plants
    // calls previous functions above as needed
    // scheduled to run every day at 7 a.m.

// https://medium.com/going-fullstack/watering-plants-with-a-raspberry-pi-36eac51b8d23
// https://gist.github.com/rdeprey/6395b808c9b72213d8a3f298a63efaca