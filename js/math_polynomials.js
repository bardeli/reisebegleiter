var Polynomials = {

  ////////////////////////////////////////////////////////////
  firstSelection : function(n, k)
  ////////////////////////////////////////////////////////////
  {
    var result = new Array(n);

    for (var i=0; i<n; ++i)
    {
      if (i<k)
        result[i] = 1;
      else
        result[i] = 0;
    }

    return result;
  },

  ////////////////////////////////////////////////////////////
  nextSelection : function(indexes)
  ////////////////////////////////////////////////////////////
  {
    var moved = false;
    var movepos = indexes.length-1;
    var lastmove = indexes.length-1;
    var movestack = 0;

    while (!moved)
    {
      while (indexes[movepos] != 1)
      {
        movepos -= 1;
        if (movepos < 0)
          return [];
      }

      if (movepos < lastmove)
      {
        moved = true;
        indexes[movepos+1] = 1;
        indexes[movepos] = 0;
      }
      else
      {
        movestack += 1;
        lastmove = movepos-1;
        movepos -= 1;
      }
    }

    if (movepos+1+movestack < indexes.length)
    {
      for (var pos=movepos+2; pos<indexes.length; ++pos)
      {
        if (pos < movepos+movestack+2)
          indexes[pos]=1;
        else
          indexes[pos]=0;
      }

      return indexes;
    }

    return [];
  },

  ////////////////////////////////////////////////////////////
  symmetric : function(coefficients)
  ////////////////////////////////////////////////////////////
  {
    var result = new Array(coefficients.length + 1);

    for (var m=0; m<=coefficients.length; ++m)
    {
      result[m] = BigInt(0);
      indexes = Polynomials.firstSelection(coefficients.length, coefficients.length - m);

      while (indexes.length > 0)
      {
        var product = BigInt(1);

        for (var i=0; i < indexes.length; ++i)
          if (indexes[i] == 1)
            product *= coefficients[i];

        result[m] += product;
        indexes = Polynomials.nextSelection(indexes);
      }
    }

    return result;
  },

  toLatex : function(coefficients)
  {
    var result_str = "\\(";
    for (var c=coefficients.length-1; c>=0; --c)
    {
      if (coefficients[c][0] != 0n)
      {
        var factor = 1n;

        if (c < coefficients.length-1)
        {
          if (coefficients[c][0] >= 0n)
            result_str += "+";
          else
          {
            result_str += "-";
            factor = -1n;
          }
        }
        result_str += "\\frac{" + (factor * coefficients[c][0]) + "}{" + coefficients[c][1] + "}x^{"+c+"}";
      }
    }
    result_str += "\\)";

    return result_str;
  },
}
