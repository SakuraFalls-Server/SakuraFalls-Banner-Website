//
// SakuraFalls-Banner-Website is free software: you can redistribute it and/or modify it under the terms of the GNU General 
// Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any 
// later version.
//
// SakuraFalls-Banner-Website is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the 
// implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with this program. 
// If not, see <https://www.gnu.org/licenses/>.
//

var sizeSelect = document.getElementById('size');
var backgroundSelect = document.getElementById('background');
var uploadInput = document.getElementById('upload');
var titleInput = document.getElementById('title');
var subtitleInput = document.getElementById('subtitle');
var blurInput = document.getElementById('blur');
var overlayInput = document.getElementById('overlay');
var canvas = document.getElementById('preview');
var ctx = canvas.getContext('2d');
var downloadButton = document.getElementById('download');
var downloadLink = document.getElementById('downloadLink');

var serverImage = null;
var serverImageSrc = '';
var uploadImage = null;
var uploadObjectUrl = '';

function parseSize(value) {
    var parts = String(value).split('x');
    return { width: parseInt(parts[0], 10), height: parseInt(parts[1], 10) };
}

function drawCover(img, cw, ch) {
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
        return;
    }
    var imageRatio = iw / ih;
    var canvasRatio = cw / ch;
    var sw, sh, sx, sy;
    if (imageRatio > canvasRatio) {
        sh = ih;
        sw = sh * canvasRatio;
        sx = (iw - sw) / 2;
        sy = 0;
    } else {
        sw = iw;
        sh = sw / canvasRatio;
        sx = 0;
        sy = (ih - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

function drawCoverOverscan(img, cw, ch, bleed) {
    var ew = cw + bleed * 2;
    var eh = ch + bleed * 2;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
        return;
    }
    var imageRatio = iw / ih;
    var canvasRatio = ew / eh;
    var sw, sh, sx, sy;
    if (imageRatio > canvasRatio) {
        sh = ih;
        sw = sh * canvasRatio;
        sx = (iw - sw) / 2;
        sy = 0;
    } else {
        sw = iw;
        sh = sw / canvasRatio;
        sx = 0;
        sy = (ih - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, -bleed, -bleed, ew, eh);
}

function fitLines(text, maxWidth, baseSize, weight) {
    var size = baseSize;
    var minSize = 4;
    while (size > minSize) {
        ctx.font = weight + ' ' + size + 'px Montserrat, sans-serif';
        if (ctx.measureText(text).width <= maxWidth) {
            return { lines: [text], size: size };
        }
        var words = text.split(/\s+/).filter(function (w) { return w.length > 0; });
        if (words.length > 1) {
            var best = null;
            for (var i = 1; i < words.length; i++) {
                var line1 = words.slice(0, i).join(' ');
                var line2 = words.slice(i).join(' ');
                var w1 = ctx.measureText(line1).width;
                var w2 = ctx.measureText(line2).width;
                var m = Math.max(w1, w2);
                if (m <= maxWidth && (best === null || m < best.max)) {
                    best = { lines: [line1, line2], max: m };
                }
            }
            if (best !== null) {
                return { lines: best.lines, size: size };
            }
        }
        size -= Math.max(0.5, size * 0.02);
    }
    ctx.font = weight + ' ' + minSize + 'px Montserrat, sans-serif';
    return { lines: [text], size: minSize };
}

function activeImage() {
    if (uploadImage && uploadImage.complete && uploadImage.naturalWidth > 0) {
        return uploadImage;
    }
    if (serverImage && serverImage.complete && serverImage.naturalWidth > 0) {
        return serverImage;
    }
    return null;
}

function draw() {
    var size = parseSize(sizeSelect.value);
    var w = size.width;
    var h = size.height;
    if (!w || !h) {
        return;
    }
    if (canvas.width !== w) {
        canvas.width = w;
    }
    if (canvas.height !== h) {
        canvas.height = h;
    }
    var scale = w / 793;

    ctx.filter = 'none';
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    var img = activeImage();
    if (img !== null) {
        if (blurInput.checked) {
            var blurRadius = 4 * scale;
            var bleed = Math.ceil(blurRadius * 3);
            ctx.filter = 'blur(' + blurRadius + 'px)';
            drawCoverOverscan(img, w, h, bleed);
        } else {
            ctx.filter = 'none';
            drawCover(img, w, h);
        }
    }
    ctx.filter = 'none';

    if (overlayInput.checked) {
        var ow = 593 * scale;
        var oh = 164 * scale;
        var ox = (w - ow) / 2;
        var oy = (h - oh) / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(ox, oy, ow, oh);
    }

    var boxWidth = w * 2 / 3;
    var titleSize = 41 * scale;
    var subtitleSize = 26 * scale;
    var gap = 16 * scale;
    var titleText = titleInput.value;
    var showSubtitle = subtitleInput.value.length > 0;
    var subtitleText = subtitleInput.value;

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var titleLayout = fitLines(titleText === '' ? '' : titleText, boxWidth, titleSize, '800');
    var subtitleLayout = null;
    if (showSubtitle) {
        subtitleLayout = fitLines(subtitleText, boxWidth, subtitleSize, '600');
    }

    var titleLineHeight = titleLayout.size * 1.2;
    var titleBlock = titleLayout.lines.length * titleLineHeight;
    var subtitleBlock = 0;
    var subtitleLineHeight = 0;
    if (subtitleLayout !== null) {
        subtitleLineHeight = subtitleLayout.size * 1.2;
        subtitleBlock = subtitleLayout.lines.length * subtitleLineHeight;
    }
    var totalBlock = titleBlock + (subtitleLayout !== null ? gap + subtitleBlock : 0);
    var cx = w / 2;
    var cy = h / 2;
    var cursorY = cy - totalBlock / 2;

    ctx.font = '800 ' + titleLayout.size + 'px Montserrat, sans-serif';
    for (var t = 0; t < titleLayout.lines.length; t++) {
        if (titleText !== '') {
            ctx.fillText(titleLayout.lines[t], cx, cursorY + titleLineHeight / 2 + t * titleLineHeight);
        }
    }
    cursorY += titleBlock;
    if (subtitleLayout !== null) {
        cursorY += gap;
        ctx.font = '600 ' + subtitleLayout.size + 'px Montserrat, sans-serif';
        for (var s = 0; s < subtitleLayout.lines.length; s++) {
            ctx.fillText(subtitleLayout.lines[s], cx, cursorY + subtitleLineHeight / 2 + s * subtitleLineHeight);
        }
    }
}

function loadServerImage() {
    var src = backgroundSelect.value;
    if (!src) {
        serverImage = null;
        serverImageSrc = '';
        draw();
        return;
    }
    if (src === serverImageSrc && serverImage !== null) {
        draw();
        return;
    }
    serverImageSrc = src;
    var img = new Image();
    img.onload = function () {
        serverImage = img;
        draw();
    };
    img.src = src;
}

function handleUpload() {
    var file = uploadInput.files && uploadInput.files[0];
    if (!file) {
        if (uploadObjectUrl) {
            URL.revokeObjectURL(uploadObjectUrl);
            uploadObjectUrl = '';
        }
        uploadImage = null;
        draw();
        return;
    }
    if (uploadObjectUrl) {
        URL.revokeObjectURL(uploadObjectUrl);
    }
    uploadObjectUrl = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
        uploadImage = img;
        draw();
    };
    img.src = uploadObjectUrl;
}

sizeSelect.addEventListener('change', draw);
backgroundSelect.addEventListener('change', loadServerImage);
uploadInput.addEventListener('change', handleUpload);
titleInput.addEventListener('input', draw);
subtitleInput.addEventListener('input', draw);
blurInput.addEventListener('change', draw);
overlayInput.addEventListener('change', draw);

downloadButton.addEventListener('click', function () {
    draw();
    canvas.toBlob(function (blob) {
        if (!blob) {
            return;
        }
        var url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'banner-' + canvas.width + 'x' + canvas.height + '.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 4000);
    }, 'image/png');
});

function init() {
    loadServerImage();
    if (document.fonts && document.fonts.load) {
        Promise.all([
            document.fonts.load('800 41px Montserrat'),
            document.fonts.load('600 26px Montserrat'),
            document.fonts.ready
        ]).then(function () {
            draw();
        }).catch(function () {
            draw();
        });
    } else {
        draw();
    }
    draw();
}

init();
