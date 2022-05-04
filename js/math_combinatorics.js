var Combinatorics = {
  binomial : function(n, k)
  {
    var numerator = 1n;
    var denominator = 1n;
    var numerator_factor = BigInt(n);
    var denominator_factor = 1n;

    for (let i=0; i<k; ++i)
    {
      numerator *= numerator_factor;
      denominator *= denominator_factor;

      numerator_factor -= 1n;
      denominator_factor += 1n;
    }

    return numerator / denominator;
  }
}
