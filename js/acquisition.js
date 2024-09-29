// Inspired by https://web.dev/serial/

let points = [];
let lineBuffer = '';
let latestValue = '';

let appendStream = null;

let interval = null;

function isConnected(){
  return appendStream instanceof WritableStream;
}

// FUNCTION TO START THE SERIAL PORT AND THE CONTINUOUS UPDATE OF latestValue
async function getReader() {
    // Inspired by https://github.com/svendahlstrand/web-serial-api

    // Filter on devices with the Arduino Uno USB Vendor/Product IDs.
    const filters = [
        { usbVendorId: 0x2341, usbProductId: 0x0043 },
        { usbVendorId: 0x2341, usbProductId: 0x0001 }
    ];

    // Prompt user to select an Arduino Uno device.
    const port = await navigator.serial.requestPort(
       { filters }
    );

    // Wait for the serial port to open.
    await port.open({ baudRate:  getBaudrate()});

    // Remove the button so that user cannot open the port twice.
    $('#dropdownBaudRate').addClass('disabled');
    $('#connectButton').addClass('disabled');
    $('#connectButton').html(`connected to<br><strong>Vid:</strong> ${port.getInfo().usbVendorId}, <strong>Pid:</strong> ${port.getInfo().usbProductId}`);

    // initPlot();

    appendStream = new WritableStream({
      write(chunk) {

        lineBuffer += chunk;
        let lines = lineBuffer.split('\r\n');

        if (lines.length > 1) {
          lineBuffer = lines.pop();
          latestValue=lines.pop();
        }

      }
    });

    port.readable
      .pipeThrough(new TextDecoderStream())
      .pipeTo(appendStream);

}

// FUNCTION TO FETCH PERIODICALLY AND PLOT THE latestValue
function acquire() {
    let checked = $('#switch').prop('checked');
    if (checked) {
        // we cannot read data if it is not connected
        if (!isConnected()){
            alert('You must CONNECT TO SERIAL first.')
            $('#switch').prop('checked', false);
        } else {
          addPoint(parseValue(latestValue));
            // plotPoints(points);
        }
    } else if (!checked && points.length > 1) {
        // previous point without the `ts` key
        let {ts, ...previous} = points.slice(-1)[0];
        let anyDefined = Object.values(previous).some(d => d !== undefined);
        if (anyDefined) {
            // only if any value is not undefined
            addPoint({'ts': Date.now()});
        }
    }
}

function addPoint(point){
  points.push(point);
  setData(points);
}

// Function to restart the interval with a new period
function setIntervalValue() {
  let sampling = parseFloat($('#intervalInput').val())*1000

  if (isNaN(sampling) || sampling === 0) {
      console.error('A zero interval time is not possible. Back to default.');
      $('#intervalInput').val(1);
      sampling = 1000;
  }

  // clear interval if it already exists
  if (interval){
    clearInterval(interval);
  }

  interval = setInterval(acquire, sampling);

}

// Parse reading values
function parseValue(input) {
  // Example usage (a key named "ts" for timestamp will be added):
  // console.log(parseToJSON("A:1.5,B:2.3")); // { A: 1.5, B: 2.3 }
  // console.log(parseToJSON("A:1.5 B:2.3")); // { A: 1.5, B: 2.3 }
  // console.log(parseToJSON("A=1.5,B=2.3")); // { A: 1.5, B: 2.3 }
  // console.log(parseToJSON("A=1.5 B=2.3")); // { A: 1.5, B: 2.3 }
  // console.log(parseToJSON("1.1,2.2"));     // { key1: 1.1, key2: 2.2 }
  // console.log(parseToJSON("1.1 2.2"));     // { key1: 1.1, key2: 2.2 }
  const result = {};
  const pairs = input.split(/[, ]+/); // Split by comma or space

  pairs.forEach(pair => {
      const [key, value] = pair.split(/[:=]/); // Split by : or =

      if (key && value) {
          // If both key and value are present, trim and assign as float
          result[key.trim()] = parseFloat(value.trim());
      } else if (value) {
          // If only value is present, create a default key
          const defaultKey = `key${Object.keys(result).length + 1}`;
          result[defaultKey] = parseFloat(value.trim());
      } else if (key) {
          // If only key is present (in case of default keys)
          const defaultKey = `key${Object.keys(result).length + 1}`;
          result[defaultKey] = parseFloat(key.trim());
      }
  });

  // add the current Unix epoch in milliseconds
  result['ts'] = Date.now();

  return result;
}

// start with default interval
setIntervalValue();
