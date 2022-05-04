function getElementValue(data, tagname, default_value)
{
  var result = default_value;
  var values = data.getElementsByTagName(tagname);

  if (values.length > 0)
    result = values[0].innerHTML;

  return result;
}
