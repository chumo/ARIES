let clicked = [undefined, undefined];

let graphDiv = $('#plotId')[0];

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
function plotPoints() {

    // Retrieve subset of points without the `ts` and the `raw` keys
    let sensors = _.without(_.uniq(_.flatten(_.map(points, _.keys))), 'ts', 'raw');

    // Update plot
    var data = [];
    sensors.forEach(key => {
      data.push({
        x: points.map(d => new Date(d.ts)),
        y: points.map(d => d[key]),
        type: 'scatter',
        mode: 'lines+markers',
        fill: 'tozeroy',
        name: key,
      });
    });

    let layout = {
      xaxis: {
        title: 'time',
        showgrid: false,
        zeroline: false,
        uirevision: true,
      },
      yaxis: {
        title: 'value',
        showline: false,
        uirevision: true,
      },
      hovermode: 'x',
      showlegend: true,
      legend: {
        y: '0.9',
        yanchor: 'top',
      },
      margin: {
        t: 10,
        l: 50,
      },
    };

    Plotly.react(
        graphDiv,
        data,
        layout,
        config={displaylogo: false, responsive: true},
    );

}
