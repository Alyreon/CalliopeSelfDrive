let distance = 0
let pulseDuration = 0
let distanceIsOkay = false
let degrees = 0
let start = 0
let minDistance = 10
const colorWarn = Colors.Red
const colorOkay = Colors.Green
const colorMessure = Colors.Violet
const colorTurn = Colors.Yellow
let currentDuration: number = 0;
let currentAction;
let intervalDuration = 250;
distanceIsOkay = true
let interval: number;
basic.showString("hi")
basic.setLedColor(colorOkay)

function messureDistance () {
    basic.setLedColor(colorMessure)
    pins.digitalWritePin(DigitalPin.C16, 0)
    control.waitMicros(2)
    pins.digitalWritePin(DigitalPin.C16, 1)
    control.waitMicros(10)
    pins.digitalWritePin(DigitalPin.C16, 0)
    pulseDuration = pins.pulseIn(DigitalPin.C16, PulseValue.High)
    distance = pulseDuration * 153 / 29 / 2 / 100
    pins.setPull(DigitalPin.C16, PinPullMode.PullNone)
    basic.showNumber(Math.round(distance))
    return distance
}
function stop () {
    motors.dualMotorPower(Motor.A, 0)
    motors.dualMotorPower(Motor.B, 0)
}

function isDistanceOkay (distance: number) {
    return distance > minDistance ? true : false
}
function drive () {
    motors.dualMotorPower(Motor.A, 75)
    motors.dualMotorPower(Motor.B, 75)
}
function calculateDistance () {
    distance = messureDistance()
    distanceIsOkay = isDistanceOkay(distance)
}

function degreesToMS (degrees: number) {
    return degrees / 5 * 100
}

function turn(direction :Direction) {
    let motorOn: Motor;
    let motorOff: Motor;
    if (direction === Direction.Left) {
        motorOn = Motor.A;
        motorOff = Motor.B;
    } else {
        motorOn = Motor.B;
        motorOff = Motor.A;
    }
    motors.dualMotorPower(motorOn, __internal.__speedPicker(50));
    motors.dualMotorPower(motorOff, __internal.__speedPicker(0));
}


basic.forever(function () {
    if (input.buttonIsPressed(Button.A)) {
        basic.showLeds(`
            . . . . .
            . . # . .
            . # . # .
            # # # # #
            # . . . #
            `)
        interval = control.setInterval(function () {
            calculateDistance();
            if(currentDuration <= 0 && distanceIsOkay) {
                basic.setLedColor(colorOkay);
                if (randint(0, 1) == 0) {
                    degrees = randint(0, 90)
                    let direction: Direction;
                    direction = randint(0,1) === 0 ? Direction.Left : Direction.Right;
                    turn(direction);
                    currentDuration = degreesToMS(degrees);
                } else {
                    // drive
                    drive();
                    currentDuration = randint(2000, 4750);
                }
            } else if(!distanceIsOkay) {
                basic.setLedColor(colorWarn)
                turn(Direction.Right);
                currentDuration = degreesToMS(90);              
            }
            currentDuration -= intervalDuration;
        }, intervalDuration, control.IntervalMode.Interval)
    } else if (input.buttonIsPressed(Button.B)) {
        basic.showLeds(`
            . # # # #
            . . # . #
            . . # # #
            . . # . #
            . # # # #
            `)
        control.clearInterval(interval, control.IntervalMode.Interval);
        stop()
        basic.setLedColor(colorOkay)
    }
})
