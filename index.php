<!-- 
SakuraFalls-Banner-Website is free software: you can redistribute it and/or modify it under the terms of the GNU General 
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any 
later version.

SakuraFalls-Banner-Website is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the 
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. 
If not, see <https://www.gnu.org/licenses/>.
-->

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SakuraFalls ❦ Banner Generator</title>
    <meta name="application-name" content="SF Banners">
    <meta name="apple-mobile-web-app-title" content="SF Banners">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="icon" type="image/png" href="assets/icon.png">
    <link rel="apple-touch-icon" href="assets/icon.png">
    <link rel="manifest" href="site.webmanifest">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>

<body>
        
    <header>
        <img src="https://www.sakurafalls.net/data/assets/logo_default/logo.png" width=300 />
        <h1>Banner Generator</h1>
    </header>
    
    <div class="content">

        <div>
            <label for="size">Banner Size</label>
            <select id="size">
                <option value="793x312" selected>Large (793x312)</option>
                <option value="661x260">Medium (661x260)</option>
                <option value="529x208">Small (529x208)</option>
                <option value="397x156">Thumbnail (397x156)</option>
            </select>
        </div>

        <div>
            <label for="background">Banner Background</label>
            <select id="background">
                <?php
                $dir = __DIR__ . '/backgrounds';
                $files = [];
                if (is_dir($dir)) {
                    $entries = scandir($dir);
                    if (is_array($entries)) {
                        foreach ($entries as $entry) {
                            if ($entry === '.' || $entry === '..') {
                                continue;
                            }
                            $ext = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
                            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                                $files[] = $entry;
                            }
                        }
                    }
                }
                sort($files);
                if (count($files) === 0) {
                    echo '<option value="">No backgrounds available!</option>';
                } else {
                    foreach ($files as $file) {
                        $value = 'backgrounds/' . $file;
                        echo '<option value="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '">' . 
                            htmlspecialchars($file, ENT_QUOTES, 'UTF-8') . '</option>';
                    }
                }
                ?>
            </select>
            <p>or</p>
            <input id="upload" type="file" accept="image/*">
        </div>
        <div>
            <label for="title">Title</label>
            <input id="title" type="text" maxlength="64">
        </div>
        <div>
            <label for="subtitle">Subtitle</label>
            <input id="subtitle" type="text" maxlength="128">
        </div>
        <div>
            <label for="blur">Blur background</label>
            <input id="blur" type="checkbox">
        </div>
        <div>
            <label for="overlay">Show overlay box</label>
            <input id="overlay" type="checkbox">
        </div>
        <div>
            <canvas id="preview" width="793" height="312"></canvas>
        </div>
        <div>
            <button id="download" type="button">Download PNG</button>
            <a id="downloadLink"></a>
        </div>
    </div>

    <footer>
        <p>
            Source code under <a href="https://www.gnu.org/licenses/">GNU GPL v3</a>.
            Provided backgrounds under <a href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a>
        </p>
        <div>
            <img src="assets/gpl_v3.webp" height="31" />
            &nbsp;
            <img src="assets/cc_by_nc.webp" height="31" />
        </div>
    </footer>

    <script src="app.js"></script>
</body>

</html>