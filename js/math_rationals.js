var Rationals = {
  ////////////////////////////////////////////////////////////
  gcd: function(a, b)
  ////////////////////////////////////////////////////////////
  {
    var A = a;
    var B = b;

    if (A < B)
    {
      A = b;
      B = a;
    }

    while (B>0)
    {
      var A_old = A;
      A = B;
      B = A_old % B;
    }

    return A;
  },

  ////////////////////////////////////////////////////////////
  bigabs: function(a)
  ////////////////////////////////////////////////////////////
  {
    return a < 0n ? -a : a;
  },

  ////////////////////////////////////////////////////////////
  sum: function(a, b)
  ////////////////////////////////////////////////////////////
  {
    var numerator = a[0]*b[1] + b[0]*a[1];
    var denominator = a[1]*b[1];
    var measure = Rationals.gcd(Rationals.bigabs(numerator), Rationals.bigabs(denominator));

    if (denominator / measure < 0)
      measure *= -1n;

    return [numerator / measure, denominator / measure];
  },

  ////////////////////////////////////////////////////////////
  product: function(a, b)
  ////////////////////////////////////////////////////////////
  {
    var numerator = a[0]*b[0];
    var denominator = a[1]*b[1];
    var measure = Rationals.gcd(Rationals.bigabs(numerator), Rationals.bigabs(denominator));

    if (denominator / measure < 0)
      measure *= -1n;

    return [numerator / measure, denominator / measure];
  },

  ////////////////////////////////////////////////////////////
  toLatex : function(a)
  ////////////////////////////////////////////////////////////
  {
    if (a[0] == 0) return "0";
    if (a[1] == 1) return a[0];

    var sign = "";

    if (a[0] < 0)
      sign = "-";

    return sign + "\\frac{" + Rationals.bigabs(a[0]) + "}{" + a[1] + "}";
  },
}
