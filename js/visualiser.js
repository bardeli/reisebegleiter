
var xmlparser = new DOMParser();
var current_chapter = '';

////////////////////////////////////////////////////////////
function addTOCPointer(pointer_text)
////////////////////////////////////////////////////////////
{
  var toc_pointer = document.createElement("div");
  toc_pointer.id = "toc_pointer";
  toc_pointer.style = "position:absolute;left:25px;top:10px;";
  toc_pointer.innerHTML = "&xlarr; " + pointer_text;

  document.body.appendChild(toc_pointer);
}

////////////////////////////////////////////////////////////
function createHeader(entry)
////////////////////////////////////////////////////////////
{
  var header_data = entry.getElementsByTagName("title");

  var heading = document.createElement("div");
  heading.className = 'par_heading';
  var headertext = document.createTextNode(header_data[0].innerHTML);
  heading.appendChild(headertext);

  return heading;
}

////////////////////////////////////////////////////////////
function deepLink(source_file, chaptername, paragraph)
////////////////////////////////////////////////////////////
{
  if (current_chapter != chaptername)
    fetchContents(source_file, chaptername, true, false, paragraph);
  else
    location.href = "#" + paragraph;
}

////////////////////////////////////////////////////////////
function createTOCEntry(source_file, entry, chaptername, par_id)
////////////////////////////////////////////////////////////
{
  var toc_data = entry.getElementsByTagName("toc");

  if (toc_data.length > 0)
  {
    let toc_entry = "<div class='toc_entry_par'><a onclick='deepLink(\"" + source_file + "\", \"";
    toc_entry += chaptername + "\", \"" + par_id + "\")'>" + toc_data[0].innerHTML + "</a></div>";
    document.getElementById(chaptername).innerHTML += toc_entry;
  }
}

////////////////////////////////////////////////////////////
function createSpecialContent(entry, par_id)
////////////////////////////////////////////////////////////
{
  special_data = entry.getElementsByTagName("specialcontent");
  if (special_data.length > 0)
  {
    switch (special_data[0].getElementsByTagName("contenttype")[0].innerHTML)
    {
      case "datatable":        return createDataTable(special_data[0]);
      case "geomap":           return createGeomap(special_data[0], par_id + "_map");
      case "code_interaction": return createCodeInteraction(special_data[0], par_id + "_code");
      case "drawing":          return createDrawing(special_data[0]);
      case "drawing3d":        return createDrawing3d(special_data[0]);
    }
  }

  return null;
}

////////////////////////////////////////////////////////////
function createBody(entry)
////////////////////////////////////////////////////////////
{
  var bodytext = document.createElement("p")
  var contents = entry.getElementsByTagName("content")[0].innerHTML.replaceAll("\n\n", "<br>");
  contents = contents.replaceAll("---", "&mdash;");
  bodytext.innerHTML = contents;
  var body = document.createElement("div");

  body.appendChild(bodytext);

  return body;
}

////////////////////////////////////////////////////////////
function addContentToWindow(source_file, content_data, chaptername, add_contents, add_toc)
////////////////////////////////////////////////////////////
{
  var next_id = 0;
  paragraphs = content_data.getElementsByTagName("paragraph")

  if (add_contents)
  {
    // clear current contents
    document.getElementById("visualiser_window").innerHTML = "";
  }

  for (let entry of paragraphs)
  {
    // Create node with a new unique id
    next_id += 1;
    var par_id = chaptername.replaceAll(" ", "_") + "_par" + next_id;
    var node = document.createElement("div");
    node.id = par_id;

    // set css style
    par_style = entry.getElementsByTagName("css");
    if (par_style.length > 0)
      node.style = par_style[0].innerHTML;

    par_style_class = entry.getElementsByTagName("cssclass");
    if (par_style_class.length > 0)
      node.className = par_style_class[0].innerHTML;

    // create entry in table of contents
    if (add_toc)
      createTOCEntry(source_file, entry, chaptername, par_id);

    // create special content like data tables, maps, ...
    special_content = createSpecialContent(entry, par_id);

    // create the main content of the paragraph
    body = createBody(entry);

    // create and add paragraph heading
    if (entry.getElementsByTagName("title").length > 0)
    {
      var heading = createHeader(entry);
      node.appendChild(heading);
    }

    // add special content
    if (special_content) node.appendChild(special_content);

    // add body
    node.appendChild(body);

    // add new paragraph to document
    if (add_contents)
    {
      document.getElementById("visualiser_window").appendChild(node);
      if (!add_toc)
        document.getElementById("toc_pointer").style = 'display:none;';
    }
  }
}

////////////////////////////////////////////////////////////
function fetchContents(source_file, chaptername, add_contents, add_toc, anchor)
////////////////////////////////////////////////////////////
{
  fetch(source_file + "?r="+Math.random())
    .then(res => res.text())
    .then((out) => {
      content_data = xmlparser.parseFromString(out, "text/xml");

      addContentToWindow(source_file, content_data, chaptername, add_contents, add_toc);
      if (MathJax) MathJax.typeset();

      if (anchor != '')
        location.href = "#" + anchor;
      else
      {
        var par_id = chaptername.replaceAll(" ", "_") + "_par1";
        location.href = "#" + par_id;
      }

      current_chapter = chaptername;
    })
    .catch(err => { throw err });
}

////////////////////////////////////////////////////////////
function populateFromContents(source_file, chaptername, add_contents, add_toc)
////////////////////////////////////////////////////////////
{
  if (add_toc)
  {
    var new_toc_element = "<div class='toc_entry' ";
    new_toc_element += "id='" + chaptername + "'>";
    new_toc_element += "<a onclick='fetchContents(\"" + source_file + "\", \"" + chaptername + "\", true, false, \"\")'";
    new_toc_element += ">" + chaptername + "</a></div>";

    document.getElementById("toc").innerHTML += new_toc_element;
  }

  fetchContents(source_file, chaptername, add_contents, add_toc, '');
}
