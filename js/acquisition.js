// Inspired by https://web.dev/serial/

let points = [];
let lineBuffer = '';
let latestValue = '';

let appendStream = null;

let interval = null;
let savingInterval = null;

let dtFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S.%L");

///////////////////////////////////////////////////////////////////////////////
function isConnected(){
  return appendStream instanceof WritableStream;
}

// FUNCTION TO START THE SERIAL PORT AND THE CONTINUOUS UPDATE OF latestValue /
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

    // Listen for disconnect event
    port.addEventListener('disconnect', () => {
        console.log('USB device has been disconnected.');
        // Enable the connect button
        $('#dropdownBaudRate').removeClass('disabled');
        $('#connectButton').removeClass('disabled');
        $('#connectButton').html('CONNECT TO SERIAL');
        // stop acquiring data
        switchOff();
        showAlert('Device Lost', 'The serial device has been disconnected.');
        // no more WritableStream
        appendStream = null;
    });

    // Remove the button so that user cannot open the port twice.
    $('#dropdownBaudRate').addClass('disabled');
    $('#connectButton').addClass('disabled');
    let Vid = port.getInfo().usbVendorId || '?';
    let Pid = port.getInfo().usbProductId || '?';
    $('#connectButton').html(`connected to<br><strong>Vid:</strong> ${Vid}, <strong>Pid:</strong> ${Pid}`);

    appendStream = new WritableStream({

      write(chunk) {
        lineBuffer += chunk;

        // Find the last complete line in the buffer
        const lastLineMatch = lineBuffer.match(/.*?\r\n/);

        if (lastLineMatch) {
          latestValue = lastLineMatch[0].trim();
          lineBuffer = lineBuffer.slice(lastLineMatch[0].length);
        }
      }
    });

    port.readable
      .pipeThrough(new TextDecoderStream())
      .pipeTo(appendStream);

}

// FUNCTION TO FETCH PERIODICALLY AND PLOT THE latestValue ////////////////////
function acquire() {
    let checked = $('#switch').prop('checked');
    if (checked) {
        // we cannot read data if it is not connected
        if (!isConnected()){
            switchOff();
            showAlert('Not Connected', 'You must CONNECT TO SERIAL first.');
        } else if (getSelectedProject() === null) {
            switchOff();
            showAlert('No Project Selected', 'You must select a project.<br>Add a Project if there is none.');
        } else {
            addPoint(parseValue(latestValue));
        }
    } else if (!checked && points.length > 1) {
        // previous point without the `ts` key
        let {ts, raw, ...previous} = points.slice(-1)[0];
        let anyDefined = Object.values(previous).some(d => d !== undefined);
        if (anyDefined) {
            // only if any value is not undefined
            addPoint({'ts': Date.now()});
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
function addPoint(point){
  points.push(point);
  updatePlot();
  printPoints();
}

///////////////////////////////////////////////////////////////////////////////
function printPoints(){
  // display data in the terminal
  d3.select('#scrollablePanel')
    .selectAll('p')
    .data(points)
    .join('p')
    .html(d => `<span>${dtFormat(new Date(d.ts))} ></span> ${d.raw}`.replace('undefined', ''));

  // always scroll down so that latest value is visible at the bottom
  $('#scrollablePanel').prop(
    'scrollTop',
    $('#scrollablePanel').prop('scrollHeight')
  );

}

// Function to restart the interval with a new period /////////////////////////
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

// Function to restart the saving interval with a new period //////////////////
function setSavingIntervalValue() {
  let sampling = parseFloat($('#savingIntervalInput').val())*1000

  if (isNaN(sampling) || sampling < 60000) {
      console.error('The saving interval time is too small. Back to default.');
      $('#savingIntervalInput').val(60);
      sampling = 60000;
  }

  // clear interval if it already exists
  if (savingInterval){
    clearInterval(savingInterval);
  }

  savingInterval = setInterval(setData, sampling);

}


// Parse reading values
function parseValue(input) {
  // Example usage (a key named "ts" for timestamp will be added):
  // console.log(parseValue("A:1.5,B:2.3")); // { A: 1.5, B: 2.3 }
  // console.log(parseValue("A:1.5 B:2.3")); // { A: 1.5, B: 2.3 }
  // console.log(parseValue("A=1.5,B=2.3")); // { A: 1.5, B: 2.3 }
  // console.log(parseValue("A=1.5 B=2.3")); // { A: 1.5, B: 2.3 }
  // console.log(parseValue("1.1,2.2"));     // { key1: 1.1, key2: 2.2 }
  // console.log(parseValue("1.1 2.2"));     // { key1: 1.1, key2: 2.2 }
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

  // add the raw data for reference
  result['raw'] = input

  return result;
}

// start with default intervals
setIntervalValue();
setSavingIntervalValue();
