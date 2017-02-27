module.exports = function(options) {
  let str = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${options.title}</title>
<link rel="stylesheet" type="text/css" href="/style.css" />
</head>
<body>
<header>
<nav>

<a href="/" class="home-logo" title="Open Fixture Library">Open Fixture Library</a>

<form action="/search">
<input type="search" name="q" placeholder="Search fixture" />
<button type="submit">Search</button>
</form>

<div class="right-nav">
<a href="/manufacturers">Manufacturers</a>
<a href="/categories">Categories</a>
<a href="/about">About</a>
</div>

</nav>
</header>
<div id="main">`;

  options.messages.forEach(function(message) {
    str += `<div class="message message-${message.type}">${message.text}</div>`;
  });

  return str;
};