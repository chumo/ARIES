/*
  Reads an analog input on pin 0 and 1, and prints the result in the Serial port.
*/

// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
}

// the loop routine runs over and over again forever:
void loop() {
  // read the input on analog pin 1:
  int A0 = analogRead(A0);
  // read the input on analog pin 2:
  int A1 = analogRead(A1);
  // print out the values in the Serial Monitor
  // using a comma separated key:value format such as "A0:1023,A1:1023":
  Serial.println("A0:" + String(A0) + ",A1:" + String(A1));
  delay(1);        // delay in between reads for stability
}
