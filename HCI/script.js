$(".form").submit(function (e) {
  e.preventDefault();
});

$("#submitButton").click(function () {
  if (setupVariables(["#size1", "#size2", "#distance1", "#distance2", "#distance3", "#clickNumber"])) {
    document.getElementById("formDiv").style.display = "none";
    document.getElementById("svgblock").style.display = "block";
    clickNum = Number($("#clickNumber")["0"].value);
    updateUI(rows[0].size, rows[0].distance);
    rows.shift()
    $("#1").addClass("present");
  }
});

function setupVariables(items) {
  var res = [];
  items.forEach(function (item) {
    item = $(item)["0"];
    var v = item.value;
    if ((v % (Number(item.step)) == 0) && (Number(v) <= item.max) && (Number(v) >= item.min)) {
      res.push(true);
    }
  });
  if (res.length == items.length) {
    rows = [];
    for (var i = 1; i <= 2; i++) {
      for (var j = 1; j <= 3; j++) {
        rows.push({ "size": Number($("#size" + i)["0"].value), "distance": Number($("#distance" + j)["0"].value) });
      }
    }
    return true;
  }
  else return false;
}

var width = 800,
  height = 800,
  mouseData = [],
  pointNumber = 120,
  rows = [],
  clickNum,
  previousTime,
  userData = [],
  previousPoint = {},
  previousCenter = {}

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "svgblock")
  .style("display", "none")
  .style("outline", "thin solid #EEE")

function updateUI(size, distance) {
  d3.selectAll(".target").remove();
  circles = [];
  var theta = (2 * Math.PI) / (clickNum + 1);
  for (var k = 2; k <= (clickNum + 1); k += 2) {
    circles.push(k);
  }
  for (var k = 1; k <= (clickNum + 1); k += 2) {
    circles.push(k);
  }
  svg.selectAll("target")
    .data(circles)
    .enter().append("circle")
    .attr("class", "target")
    .attr("id", function (d) { return d; })
    .attr("r", size / 2)
    .attr("cx", function (d, i) { return width / 2 + ((distance / 2) * Math.cos(theta * i - 0.75)); })
    .attr("cy", function (d, i) { return height / 2 - ((distance / 2) * Math.sin(theta * i - 0.75)); })
    .attr("angle", function (d, i) { return (theta * i - 0.75); });

  $(".target").click(function () {
    if (this.classList.contains("present")) {
      var timestamp = new Date;
      timestamp = timestamp.getTime();
      var xc = Number($("#" + this.id)[0].cx.baseVal.value);
      var yc = Number($("#" + this.id)[0].cy.baseVal.value);
      if (clickNum > 0) {
        if (clickNum != Number($("#clickNumber")[0].value)) {
          userData.push({ "target_width": size, "target_distance": distance, "MT": (timestamp - previousTime) });
        }
        previousTime = timestamp; //Make current timestamp as previous timestamp, after click event
        previousPoint = { "x": event.clientX, "y": event.clientY };
        previousCenter = { "x": xc, "y": yc };
        clickNum--;
        $("#" + (Number(this.id) + 1)).addClass("present");
        $("#" + this.id).removeClass("present");
      }
      else if (clickNum == 0) {
        userData.push({ "target_width": size, "target_distance": distance, "MT": (timestamp - previousTime) });

        if (rows.length != 0) {
          clickNum = Number($("#clickNumber")["0"].value);
          updateUI(rows[0].size, rows[0].distance);
          rows.shift();
          $("#1").addClass("present");
        }
        else {
          $("#" + this.id).removeClass("present");
          document.getElementById("formDiv").style.display = "block";
          console.log(JSON.stringify(userData));
        }
      }

    }
  });
}

var line = d3.line()
  .curve(d3.curveBasis)
  .x(function (d) { return d[0]; })
  .y(function (d) { return d[1]; });

var path = svg.append("path")
  .data([mouseData])
  .attr("d", line)
  .attr("class", "mouseline")
  .attr("fill", "transparent");

function tick(point) {
  mouseData.push(point);
  path.attr("d", function (d) { return line(d); })
  if (mouseData.length > pointNumber) {
    mouseData.shift();
  }
}
