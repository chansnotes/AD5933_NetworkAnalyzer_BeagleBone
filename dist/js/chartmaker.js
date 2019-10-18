var chart;

var chartData = [
    {
        "ax": 1,
        "ay": 0.5,
        "bx": 1,
        "by": 2.2
    },
    {
        "ax": 2,
        "ay": 1.3,
        "bx": 2,
        "by": 4.9
    },
    {
        "ax": 3,
        "ay": 2.3,
        "bx": 3,
        "by": 5.1
    },
    {
        "ax": 4,
        "ay": 2.8,
        "bx": 4,
        "by": 5.3
    },
    {
        "ax": 5,
        "ay": 3.5,
        "bx": 5,
        "by": 6.1
    },
    {
        "ax": 6,
        "ay": 5.1,
        "bx": 6,
        "by": 8.3
    },
    {
        "ax": 7,
        "ay": 6.7,
        "bx": 7,
        "by": 10.5
    },
    {
        "ax": 8,
        "ay": 8,
        "bx": 8,
        "by": 12.3
    },
    {
        "ax": 9,
        "ay": 8.9,
        "bx": 9,
        "by": 14.5
    },
    {
        "ax": 10,
        "ay": 9.7,
        "bx": 10,
        "by": 15
    },
    {
        "ax": 11,
        "ay": 10.4,
        "bx": 11,
        "by": 18.8
    },
    {
        "ax": 12,
        "ay": 11.7,
        "bx": 12,
        "by": 19
    }
];

AmCharts.ready(function () {
    // XY CHART
    chart = new AmCharts.AmXYChart();
    chart.pathToImages = "http://www.amcharts.com/lib/3/images/";
    chart.dataProvider = chartData;
    chart.startDuration = 1;
    
    // AXES
    // X
    var xAxis = new AmCharts.ValueAxis();
    xAxis.title = "Frequency (Hz)";
    xAxis.position = "bottom";
    xAxis.dashLength = 1;
    xAxis.axisAlpha = 0;
    xAxis.autoGridCount = true;
    xAxis.logarithmic = true;
    chart.addValueAxis(xAxis);
    
    // Y
    var yAxis = new AmCharts.ValueAxis();
    yAxis.position = "left";
    yAxis.title = "Gain (dB)";
    yAxis.dashLength = 1;
    yAxis.axisAlpha = 0;
    yAxis.autoGridCount = true;
    yAxis.logarithmic = true;
    chart.addValueAxis(yAxis);
    
    // GRAPHS
    // triangles up			
    var graph1 = new AmCharts.AmGraph();
    graph1.lineColor = "#FF6600";
    graph1.balloonText = "f:[[x]] G:[[y]]";
    graph1.xField = "ax";
    graph1.yField = "ay";
    graph1.lineAlpha = 0.5;
    graph1.lineThickness = 2;
    graph1.bullet = "round";
    chart.addGraph(graph1);
    
    
    // CURSOR
    var chartCursor = new AmCharts.ChartCursor();
    chart.addChartCursor(chartCursor);
    
    // SCROLLBAR
    
    //var chartScrollbar = new AmCharts.ChartScrollbar();
    //chart.addChartScrollbar(chartScrollbar);
    
    // WRITE                                                
    chart.write("gaindiv");
    
    var date = new Date();
    var field = document.getElementById("date");
    field.innerHTML = date.toString();
    
});