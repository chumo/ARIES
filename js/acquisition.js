// Inspired by https://web.dev/serial/

let SAMPLING_MILISECONDS = 1000;

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
        // console.log(lineBuffer);
        if (lines.length > 1) {
          lineBuffer = lines.pop();
        //   latestValue = parseInt(lines.pop().trim());
        // console.log(latestValue);
          latestValue=lines.pop();
          // if (!latestValue.includes('-- READY --')) {
            // console.log(latestValue);
          // }
        }
      }
    });

    port.readable
      .pipeThrough(new TextDecoderStream())
      .pipeTo(appendStream);

}

// FUNCTION TO FETCH PERIODICALLY AND PLOT THE latestValue
function acquire(elapsed) {
    let checked = document.getElementById("switch").checked;
    if (checked) {
        // we cannot read data if it is not connected
        if (!isConnected()){
            alert('You must CONNECT TO SERIAL first.')
            $('#switch').prop('checked', false);
        } else {
          let pressureMPa = latestValue;
          points.push(
              {
                  'time [s]': elapsed / 1000,
                  'serial read': latestValue,
                  'pressure [MPa]': pressureMPa,
                  'pressure [kPa]': pressureMPa * 1000,
                  'pressure [psi]': pressureMPa * 145.038,
              }
          );
          plotPoints(points);
        }
    } else if (!checked && points.length > 1) {
        if (points.slice(-1)[0]['serial read'] != undefined) {
            points.push(
                {
                    'time [s]': elapsed / 1000,
                    'serial read': undefined,
                    'pressure [MPa]': undefined,
                    'pressure [kPa]': undefined,
                    'pressure [psi]': undefined,
                }
            );
        }
    }
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

// start with default interval
setIntervalValue();
