<html>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FileShare</title>
    <head>
        <link rel="stylesheet" href="style/style.css">
        <script src="scripts/server.js"></script>
    </head>
    <h1>Server Not connected</h1>
    <body id="body" onload="loadContent()">
        Waiting for server to respond!
        <button onclick="loadContent()">Check</button>
        <?php
        echo "<p>New Server using php<p>";
        ?>
    </body>
</html>