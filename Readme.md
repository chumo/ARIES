# SCOPE

> **S**erial **C**ommunication **O**nline **P**lotting **E**ngine

Data acquisition software that reads and visualizes the serial output data, such as the one from the Arduino board, with a web interface.

The data acquisition is done using the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API).


## How to use it

#### Prepare your Arduino
1. Download and install the Arduino IDE so that you can upload libraries to your Arduino (in  https://www.arduino.cc/en/main/software go to "Download the Arduino IDE").

2. Connect the Arduino via usb to the computer, open the Arduino IDE and create a `.ino` file (for example [arduino.ino](arduino/arduino.ino)) that you need to upload to the Arduino board using the button `upload` (or go to the menu `Sketch > Upload`).

3. Close the IDE program. Your hardware is ready.

NOTE: The `loop` function of your `.ino` file should always print data to the serial port (with the function `Serial.println(<STRING>);`) using a comma or space separated `key:value` or `key=value` format, or simply a comma or space separated values, such as:

  - "A:1.5,B:2.3"
  - "A:1.5 B:2.3"
  - "A=1.5,B=2.3"
  - "A=1.5 B=2.3"
  - "1.1,2.2"
  - "1.1 2.2"

#### Web interface
1. Go to [https://chumo.github.io/SCOPE/index.html](https://chumo.github.io/SCOPE/index.html).

2. Press `CONNECT TO SERIAL` and select the serial port where your Arduino is connected.

3. Start the data acquisition by turning the corresponding switch on.


> Jesús Martínez-Blanco
>
> jmb.jesus@gmail.com
