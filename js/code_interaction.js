
function toggleCodeDisplay(id)
{
  if (document.getElementById(id + "_").style.display == 'none')
  {
    document.getElementById(id + "_").style.display = 'block';
    hljs.highlightAll();
  }
  else
    document.getElementById(id + "_").style.display = 'none';
}

function createCodeInteraction(coding_data, par_id)
{
  var new_element = document.createElement('div');
  var display_data = coding_data.getElementsByTagName("display");
  var code_data = coding_data.getElementsByTagName("code");

  var code_text = code_data[0].innerHTML.replaceAll("&lt;", "<");
  code_text = code_text.replaceAll("&gt;", ">");
  code_text = code_text.replaceAll("&amp;", "&");

  // rename function head
  var fct_head = code_text.match(/function (.*?)\(/);
  var new_name = par_id + "_" + fct_head[1];

  // parse display area
  var display_text  = display_data[0].innerHTML;
  var input_fields  = display_text.match(/@input:(.*?)!/g);
  var output_fields = display_text.match(/@output:(.*?)!/g);

  // parse output fields
  for (const output of output_fields)
  {
    var code_text_output = code_data[0].innerHTML;
    display_text = display_text.replace(output, "<span id='" + par_id + "_output'></span><div id='"
      + par_id + "_codedisplay' onclick='toggleCodeDisplay(this.id)' style='font-size:40px;'>&#9000;</div><div id='"
      + par_id + "_codedisplay_' style='display:none' ><pre><code class='language-js'>" + code_text_output + "</code></pre></div>");
  }

  // parse input fields
  input_map = {};

  for (const input of input_fields)
  {
    var parameter_pos = input.substring(input.search(":")+1, input.search("!"));
    input_map[parameter_pos] = par_id + "_input!" + parameter_pos;
    display_text = display_text.replace(input, "<input size='5' onchange='call_" + new_name + "()' id ='" + par_id + "_input!" + parameter_pos + "' type='text'/>");
  }

  var input_keys = Object.keys(input_map).sort();

  new_element.innerHTML = display_text;

  // parse code
  if (code_data.length > 0)
  {
    var new_head = "function " + new_name + "(";
    code_text = code_text.replace(fct_head[0], new_head);

    // call function
    code_text += "\n\n function call_" + new_name + "() {";

    // set all inputs
    var separator = "";

    code_text += "var result = "
    code_text += new_name;
    code_text += "(";

    for (let input of input_keys)
    {
      code_text +=  separator + "parseInt(document.getElementById('" + input_map[input] + "').value)";
      separator = ', ';
    }
    code_text += ");";

    // show output
    code_text += "var new_element = document.getElementById('" + par_id + "_output');";
    code_text += "new_element.innerHTML = result;";
    code_text += "if (MathJax) {MathJax.typeset([new_element]);}";
    code_text += "}";

    var script = document.createElement('script');
    script.innerHTML = code_text;
    document.head.appendChild(script);
  }

  return new_element;
}
