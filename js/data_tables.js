////////////////////////////////////////////////////////////
function createDataTable(table_data)
////////////////////////////////////////////////////////////
{
  new_table = document.createElement('table');

  tablestyle = table_data.getElementsByTagName("cssclass");
  if (tablestyle.length > 0)
    new_table.className = tablestyle[0].innerHTML;

  tablebody = table_data.getElementsByTagName("databody")

  if (tablebody.length > 0)
  {
    lines = tablebody[0].innerHTML.split("\n");
    for (let line in lines)
    {
      var new_row = new_table.insertRow();

      if (lines[line].search(";") > -1)
      {
        columns = lines[line].split(";");

        for (let column in columns)
        {
          var new_column = new_row.insertCell();
          new_column.appendChild(document.createTextNode(columns[column]));
        }
      }
    }
  }

  return new_table;
}
