# SCOPE

> **S**erial **C**ommunication **O**nline **P**lotting **E**ngine

Data acquisition software that reads and visualizes the serial output data, such as the one from the Arduino board, with a web interface.

The data acquisition is done using the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API).


## How to use it

#### Prepare your Arduino
1. Download and install the Arduino IDE so that you can upload libraries to your Arduino (in  https://www.arduino.cc/en/main/software go to "Download the Arduino IDE").

2. Connect the Arduino via usb to the computer, open the Arduino IDE and create a `.ino` file that you need to upload to the Arduino board using the button `upload` (or go to the menu `Sketch > Upload`). The `loop` function should always print data to the serial port using a comma separated key:value format such as "A0:1023,A1:1023". That is achieved by using the command `Serial.println("A0:1023,A1:1023");`. See `arduino/firmware/firmware.ino` for an example.

3. Close the IDE program. Your hardware is ready.

#### Web interface
1. Go to [https://chumo.github.io/SCOPE/index.html](https://chumo.github.io/SCOPE/index.html).

2. Press `CONNECT TO SERIAL` and select the serial port where your Arduino is connected.

3. Start the data acquisition by turning the corresponding switch on.


> Jesús Martínez-Blanco
>
> jmb.jesus@gmail.com
