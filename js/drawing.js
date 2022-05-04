Colormap = {
  basic_lines : ["#FF2020", "#2020FF", "#208020", "#800080", "#648080", "#F2BF45", "#F0A3FF", "#993F00", "#FFA405", "#00998F"],

  ////////////////////////////////////////////////////////////
  getColor : function(colormap, position, fallback)
  ////////////////////////////////////////////////////////////
  {
      if (position < colormap.length)
        return colormap[position];
      else
        return fallback;
  },
}


////////////////////////////////////////////////////////////
function createDrawing(drawing_data)
////////////////////////////////////////////////////////////
{
  var new_drawing = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var drawing_code = drawing_data.getElementsByTagName("code");

  var height_info = getElementValue(drawing_data, "height", null);
  if (height_info)
    new_drawing.setAttributeNS(null, 'height', height_info);

  var width_info = getElementValue(drawing_data, "width", null);
  if (width_info)
    new_drawing.setAttributeNS(null, 'width', width_info);

  var viewbox_info = getElementValue(drawing_data, "viewbox", null);
  if (viewbox_info)
    new_drawing.setAttributeNS(null, 'viewBox', viewbox_info);

  if (drawing_code.length > 0)
  {
      var commands = drawing_code[0].innerHTML.split(";");

      for (let command of commands)
      {
        var parsed_command = command.match(/(.*?)\((.*?)\)/);

        if (parsed_command)
        {
          var params = parsed_command[2].split(",");

          switch (parsed_command[1])
          {
            case 'box':
              var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
              rect.setAttributeNS(null, 'x', params[0]);
              rect.setAttributeNS(null, 'y', params[1]);
              rect.setAttributeNS(null, 'height', params[3]);
              rect.setAttributeNS(null, 'width', params[2]);
              rect.setAttributeNS(null, 'fill', params[4]);
              rect.setAttributeNS(null, 'stroke', params[5]);

              new_drawing.appendChild(rect);
              break;

              case 'circle':
                var rect = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                rect.setAttributeNS(null, 'cx', params[0]);
                rect.setAttributeNS(null, 'cy', params[1]);
                rect.setAttributeNS(null, 'r', params[2]);
                rect.setAttributeNS(null, 'fill', params[3]);
                rect.setAttributeNS(null, 'stroke', params[4]);

                new_drawing.appendChild(rect);
                break;

            case 'text':
              var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
              text.innerHTML = params[2];
              text.setAttributeNS(null, 'x', params[0]);
              text.setAttributeNS(null, 'y', params[1]);
              text.setAttributeNS(null, 'fill', params[3]);
              if (params[4].length > 2)
                text.setAttributeNS(null, 'transform', params[4].replaceAll(":", ",").replaceAll("[", "(").replaceAll("]", ")"));
              if (params.length > 5)
                text.setAttributeNS(null, 'class', params[5]);
              else
                text.setAttributeNS(null, 'class', "drawing_text");

              new_drawing.appendChild(text);
              break;

            case 'line':
              var line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
              line.setAttributeNS(null, 'x1', params[0]);
              line.setAttributeNS(null, 'y1', params[1]);
              line.setAttributeNS(null, 'x2', params[2]);
              line.setAttributeNS(null, 'y2', params[3]);
              line.setAttributeNS(null, 'stroke', params[4]);
              line.setAttributeNS(null, 'stroke-width', params[5]);

              new_drawing.appendChild(line);
              break;
          }
        }
      }
  }

  return new_drawing;
}

////////////////////////////////////////////////////////////
function vectorDifference(a, b)
////////////////////////////////////////////////////////////
{
    var result = [];

    for (var i=0; i<a.length; ++i)
      result.push(a[i] - b[i]);

    return result;
}

////////////////////////////////////////////////////////////
function vectorDot(a, b)
////////////////////////////////////////////////////////////
{
    var result = 0.0;

    for (var i=0; i<a.length; ++i)
      result += a[i] * b[i];

    return result;
}

////////////////////////////////////////////////////////////
function vectorNormalise(a)
////////////////////////////////////////////////////////////
{
  var result = [];
  var norm = 0.0;

  for (var i=0; i<a.length; ++i)
    norm += a[i]**2;

  norm = Math.sqrt(norm);

  for (var i=0; i<a.length; ++i)
    result.push(a[i] / norm);

  return result;
}

////////////////////////////////////////////////////////////
function vectorCross(a, b)
////////////////////////////////////////////////////////////
{
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}

////////////////////////////////////////////////////////////
function matrixProduct(A, B)
////////////////////////////////////////////////////////////
{
    var dim = A.length;
    var result = [];

    for (var row=0; row<dim; ++row)
    {
      var rowdata = new Array();

      for (var col=0; col<dim; ++col)
      {
        var dot = 0;
        for (var i=0; i<dim; ++i)
          dot += A[row][i] * B[i][col];

        rowdata.push(dot);
      }

      result.push(rowdata);
    }

    return result;
}

////////////////////////////////////////////////////////////
function matrixApply(A, x)
////////////////////////////////////////////////////////////
{
    var dim = x.length;
    var result = [];

    for (var row=0; row<dim; ++row)
    {
      var dot = 0;
      for (var col=0; col<dim; ++col)
        dot += A[row][col] * x[col];
      result.push(dot);
    }

    return result;
}

////////////////////////////////////////////////////////////
function projection3d(x, y, z)
////////////////////////////////////////////////////////////
{
  var aspect = 1.0;
  var near = 10.0;
  var far = 200.0;
  var fovy = 5.0;

  var ymax = near * Math.tan(fovy * Math.PI / 360.0);
  var xmax = ymax * aspect;
  var left = -xmax;
  var right = xmax;
  var top = ymax;
  var bottom = -ymax;

  var A = (right + left) / (right - left);
  var B = (top + bottom) / (top - bottom);
  var C = -(far + near) / (far - near);
  var D = -2. * far * near / (far - near);
  var E = 2. * near / (right - left);
  var F = 2. * near / (top - bottom);

  /*var projection = [
      [  E, 0., 0., 0.],
      [ 0.,  F, 0., 0.],
      [  A,  B,  C,-1.],
      [ 0., 0.,  D, 0.]
  ];*/

  var projection = [
      [ E , 0.,  A, 0.],
      [ 0., F ,  B, 0.],
      [ 0., 0.,  C, D],
      [ 0., 0., -1.0, 0.]
  ];

  //console.log(E*x / (D*z), F*y / (D*z));

  //return [E*x, F*y, A*x + B*y + C*z - 1, D*z];
//  return [100 + E*(x / (D*z)), 100 + (F*y / (D*z))];
  //return [100 + E*(x-20) / (D*(z-2)), 100 + F*(y-50) / (D*(z-2)), (A*(x-20)+B*(y-50)+C*(z-2)-1)/(D*(z-2))];
  //return [100+(E*x+A*z)/(-z), 100+(F*y+B*z)/(-z)];
  //return [x/(z/2+0.001), y/(z/2+0.001)];

  var eye = [30, 40, 60];
  var target = [40, 30, 30];
  var up = [0,1,0];

  var forward = vectorDifference(target, eye);
  forward = vectorNormalise(forward);

  var side = vectorCross(forward, up);
  side = vectorNormalise(side);

  up = vectorCross(side, forward);
  up = vectorNormalise(up);

/*  var view =[
          [side[0], up[0], -forward[0], 0.],
          [side[1], up[1], -forward[1], 0.],
          [side[2], up[2], -forward[2], 0.],
          [-vectorDot(side, eye), -vectorDot(up, eye), vectorDot(forward, eye), 1.0]
      ];*/
  var view =[
          [side[0], side[1], side[2], -vectorDot(side, eye)],
          [up[0], up[1], up[2], -vectorDot(up, eye)],
          [-forward[0], -forward[1], -forward[2], vectorDot(forward, eye)],
          [0.0, 0.0, 0.0, 1.0]
      ];

  //var final = matrixProduct(projection, view);
  //var result = matrixApply(final, [x, y, z, 1]);
  var v = matrixApply(view, [x, y, z, 1]);
  var result = v;//matrixApply(projection, v);

  return [100+result[0]/result[3], 100+result[1]/result[3], result[2]/result[3]];
}

////////////////////////////////////////////////////////////
function createDrawing3d(drawing_data)
////////////////////////////////////////////////////////////
{
  var new_drawing = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var drawing_code = drawing_data.getElementsByTagName("code");

  var height_info = getElementValue(drawing_data, "height", null);
  if (height_info)
    new_drawing.setAttributeNS(null, 'height', height_info);

  var width_info = getElementValue(drawing_data, "width", null);
  if (width_info)
    new_drawing.setAttributeNS(null, 'width', width_info);

  var polygons = [];

  if (drawing_code.length > 0)
  {
      var commands = drawing_code[0].innerHTML.split(";");

      for (let command of commands)
      {
        var parsed_command = command.match(/(.*?)\((.*?)\)/);

        if (parsed_command)
        {
          var params = parsed_command[2].split(",");

          switch (parsed_command[1])
          {
            case 'box':
              var x = parseFloat(params[0]);
              var y = parseFloat(params[1]);
              var z = parseFloat(params[2]);
              var dx = parseFloat(params[3]);
              var dy = parseFloat(params[4]);
              var dz = parseFloat(params[5]);

              var style = [params[6], params[7]];

              var coordinates = [];
              coordinates.push(projection3d(x, y, z));
              coordinates.push(projection3d(x+dx, y, z));
              coordinates.push(projection3d(x+dx, y+dy, z));
              coordinates.push(projection3d(x, y+dy, z));

              var depth = (coordinates[0][2] + coordinates[1][2] + coordinates[2][2] + coordinates[3][2]) / 4;
              polygons.push([coordinates, depth, style]);

              coordinates = new Array();
              coordinates.push(projection3d(x+dx, y, z+dz));
              coordinates.push(projection3d(x, y, z+dz));
              coordinates.push(projection3d(x, y+dy, z+dz));
              coordinates.push(projection3d(x+dx, y+dy, z+dz));

              var depth = (coordinates[0][2] + coordinates[1][2] + coordinates[2][2] + coordinates[3][2]) / 4;
              polygons.push([coordinates, depth, style]);

              coordinates = new Array();
              coordinates.push(projection3d(x+dx, y, z));
              coordinates.push(projection3d(x+dx, y, z+dz));
              coordinates.push(projection3d(x+dx, y+dy, z+dz));
              coordinates.push(projection3d(x+dx, y+dy, z));

              var depth = (coordinates[0][2] + coordinates[1][2] + coordinates[2][2] + coordinates[3][2]) / 4;
              polygons.push([coordinates, depth, style]);

              coordinates = new Array();
              coordinates.push(projection3d(x, y, z+dz));
              coordinates.push(projection3d(x, y, z));
              coordinates.push(projection3d(x, y+dy, z));
              coordinates.push(projection3d(x, y+dy, z+dz));

              var depth = (coordinates[0][2] + coordinates[1][2] + coordinates[2][2] + coordinates[3][2]) / 4;
              polygons.push([coordinates, depth, style]);

              coordinates = new Array();
              coordinates.push(projection3d(x, y+dy, z));
              coordinates.push(projection3d(x+dx, y+dy, z));
              coordinates.push(projection3d(x+dx, y+dy, z+dz));
              coordinates.push(projection3d(x, y+dy, z+dz));

              //console.log(coordinates);
              var depth = (coordinates[0][2] + coordinates[1][2] + coordinates[2][2] + coordinates[3][2]) / 4;
              polygons.push([coordinates, depth, style]);

              coordinates = new Array();
              coordinates.push(projection3d(x, y, z));
              coordinates.push(projection3d(x, y, z+dz));
              coordinates.push(projection3d(x+dx, y, z+dz));
              coordinates.push(projection3d(x+dx, y, z));

              var depth = (coordinates[0][2] + coordinates[1][2] + coordinates[2][2] + coordinates[3][2]) / 4;
              polygons.push([coordinates, depth, style]);

              break;


          }
        }
      }
  }

  // sort polygon array
  polygons.sort(function(a, b) {return b[1] - a[1]});

  // add all polygons
  for (let polygon of polygons)
  {
    var poly = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
    var point_str = "";
    for (let vertex of polygon[0])
    {
      point_str += vertex[0] + "," + vertex[1] + " ";
    }
    poly.setAttributeNS(null, 'points', point_str);
    poly.setAttributeNS(null, 'fill', polygon[2][0]);
    poly.setAttributeNS(null, 'stroke', polygon[2][1]);

    new_drawing.appendChild(poly);
  }

  return new_drawing;
}
