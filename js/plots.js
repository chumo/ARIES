let clicked = [undefined, undefined];

let graphDiv = document.getElementById('plotId');

///////////////////////////////////////////////////////////////////////////////
function initPlot() {
  // Create the plot for the first time (needed because the plot needs to be
  // created after the div element becomes visible)
  let layout = {
    title: 'Analog Read vs Time',
    xaxis: {
      title: 'time [s]',
      showgrid: false,
      zeroline: false,
      uirevision: true,
    },
    yaxis: {
      title: selectedUnits,
      showline: false,
      uirevision: true,
    },
    hovermode: 'x',
    showlegend: false,
  };

  Plotly.newPlot(
    graphDiv,
    [],
    layout,
    config={displaylogo: false, responsive: true},
  );
}

///////////////////////////////////////////////////////////////////////////////
function plotPoints(points) {
    let limitMin = 0.6894745;
    let limitMax = 3 * limitMin;
    let displayText = '';

    if (points.length > 0) {

      let lastMeasure = points.slice(-1)[0][selectedUnits];
      if (lastMeasure == undefined) {
        // The last point can be undefined if the acquisition is stopped
        lastMeasure = points.slice(-2)[0][selectedUnits];
      }

      switch(selectedUnits) {
        case 'pressure [MPa]':
          displayText = `${lastMeasure.toFixed(5)} MPa`;
          break;
        case 'pressure [kPa]':
          limitMin *= 1000;
          limitMax *= 1000;
          displayText = `${lastMeasure.toFixed(2)} kPa`;
          break;
        case 'pressure [psi]':
          limitMin *= 145.038;
          limitMax *= 145.038;
          displayText = `${lastMeasure.toFixed(3)} psi`;
          break;
        case 'serial read':
          limitMin = getPressureMPa.invert(limitMin);
          limitMax = getPressureMPa.invert(limitMax);
          displayText = `${lastMeasure.toFixed(0)}`;
        default:
          break;
      }

    }

    // Update digit display
    d3.select("#digitDisplay").text(displayText);

    // Update plot
    var data = [];
    data.push({
      x: points.map(d => d['time [s]']),
      y: points.map(d => d[selectedUnits]),
      type: 'scatter',
      mode: 'lines+markers',
      fill: 'tozeroy',
      showlegend: false,
      name: '',
    });
    let checked = document.getElementById("switchLimits").checked;
    if (checked && points.length > 0) {
      data.push({
        x: [points[0]['time [s]'], points.slice(-1)[0]['time [s]']],
        y: [limitMin, limitMin],
        type: 'scatter',
        marker: {color: '#ff7f0e'},
        line: {width: 2},
        mode: 'lines',
        name: 'MIN',
      });
      data.push({
        x: [points[0]['time [s]'], points.slice(-1)[0]['time [s]']],
        y: [limitMax, limitMax],
        type: 'scatter',
        marker: {color: '#ff7f0e'},
        line: {width: 2},
        mode: 'lines',
        name: 'MAX',
      });
    }

    let layout = {
      title: 'Analog Read vs Time',
      xaxis: {
        title: 'time [s]',
        showgrid: false,
        zeroline: false,
        uirevision: true,
      },
      yaxis: {
        title: selectedUnits,
        showline: false,
        uirevision: true,
      },
      hovermode: 'x',
      showlegend: false,
      shapes: [getVLine(clicked[0]), getVLine(clicked[1])],
    };

    Plotly.react(
        graphDiv,
        data,
        layout,
        config={displaylogo: false, responsive: true},
    );

}
