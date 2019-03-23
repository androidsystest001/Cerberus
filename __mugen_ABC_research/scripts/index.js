$(() => {

    //
    let fncDraw = () => {
        //
        let categories = [];
        let data = [];
        //
        let maxFake = 10;
        for (let index = 0; index < maxFake; index++) {
            categories.push(`Product ${index + 1}`);

            data.push(10*((maxFake - index)));
        }
        //
        let rankOption = {
            rankA: Number($("#rankA").val()),
            rankB: Number($("#rankB").val()),
            rankC: Number($("#rankC").val())
        };
        drawParetoWithABC(categories, data, rankOption);
    }
    // draw on click Preview
    $("#btnPreview").click(() => {
        fncDraw();
    });

    // draw on load
    fncDraw();
});


function drawParetoWithABC(categories, data, rankOption) {
    //
    console.log("TODO: processing rankOption", rankOption);

    Highcharts.chart('chartContainer', {
        chart: {
          renderTo: 'chartContainer',
          type: 'column'
        },
        title: {
          text: 'Pareto analysis ABC classification'
        },
        tooltip: {
          shared: true
        },
        xAxis: {
          categories: categories,
          crosshair: true,
          plotBands: [{
            label: {
                text: 'Rank A ',
                style: {
                    color: '#606060'
                },
                align: 'center', // Positioning of the label. 
            },
            color: '#FCFFC5', // Color value
            from: -1, // Start of the plot band, không biết sao set = 0 thì draw không đúng... ???
            to: 4.5 // End of the plot band
          },
          {
            label: {
                text: 'Rank B ',
                style: {
                    color: '#606060'
                },
                align: 'center', // Positioning of the label. 
            },
            color: '#ECFFD5', // Color value
            from: 4.5, // Start of the plot band
            to: 5.5 // End of the plot band
          },
          {
            label: {
                text: 'Rank C ',
                style: {
                    color: '#606060'
                },
                align: 'center', // Positioning of the label. 
            },
            color: '#DCFFD5', // Color value
            from: 5.5, // Start of the plot band
            to: 9.5 // End of the plot band
          }
        ],
        },
        yAxis: [{
          title: {
            text: 'Quantity'
          }
        }, {
          title: {
            text: 'Cumulative Ratio'
          },
          minPadding: 0,
          maxPadding: 0,
          max: 100,
          min: 0,
          opposite: true,
          labels: {
            format: "{value}%"
          }
        }],
        series: [{
          type: 'pareto',
          name: 'Cumulative Ratio',
          yAxis: 1,
          zIndex: 10,
          baseSeries: 1
        }, {
          name: 'Quantity',
          type: 'column',
          zIndex: 2,
          data: data
        }]
      });
}
