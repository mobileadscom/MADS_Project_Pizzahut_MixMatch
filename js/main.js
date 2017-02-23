/*
 *
 * mads - version 2.00.01
 * Copyright (c) 2015, Ninjoe
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * https://en.wikipedia.org/wiki/MIT_License
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 *
 */
var mads = function(options) {

  var _this = this;

  document.body.style.margin = 0
  document.body.style.padding = 0

  this.html5ad = options.html5ad;

  /* Body Tag */
  this.bodyTag = document.getElementsByTagName('body')[0];

  /* Head Tag */
  this.headTag = document.getElementsByTagName('head')[0];

  /* json */
  if (typeof json == 'undefined' && typeof rma != 'undefined') {
    this.json = rma.customize.json;
  } else if (typeof json != 'undefined') {
    this.json = json;
  } else {
    this.json = '';
  }

  /* fet */
  if (typeof fet == 'undefined' && typeof rma != 'undefined') {
    this.fet = typeof rma.fet == 'string' ? [rma.fet] :
      rma.fet;
  } else if (typeof fet != 'undefined') {
    this.fet = fet;
  } else {
    this.fet = [];
  }

  this.fetTracked = false;

  this.html5adInit = function() {
    var oldObj = _this.data

    _this.data = (function() {
      var newObj = {};
      for (var prop in oldObj) {
        if (oldObj.hasOwnProperty(prop)) {
          if (prop.toLowerCase().indexOf('url') > -1) newObj[prop] = _this.path + oldObj[prop]
        }
      }
      return newObj
    })()
    _this.html5ad.render && _this.html5ad.render();
    _this.html5ad.style && _this.html5ad.style();
    _this.html5ad.events && _this.html5ad.events();
  }

  /* load json for assets */
  if (typeof this.json === 'string') {
    this.loadJs(this.json, function() {
      _this.data = json_data;
      _this.html5adInit()
    });
  } else {
    setTimeout(function() {
      _this.data = this.json
      _this.html5adInit()
    }, 1)
  }

  /* Get Tracker */
  if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
    this.custTracker = rma.customize.custTracker;
  } else if (typeof custTracker != 'undefined') {
    this.custTracker = custTracker;
  } else {
    this.custTracker = [];
  }

  /* CT */
  if (typeof ct == 'undefined' && typeof rma != 'undefined') {
    this.ct = rma.ct;
  } else if (typeof ct != 'undefined') {
    this.ct = ct;
  } else {
    this.ct = [];
  }

  /* CTE */
  if (typeof cte == 'undefined' && typeof rma != 'undefined') {
    this.cte = rma.cte;
  } else if (typeof cte != 'undefined') {
    this.cte = cte;
  } else {
    this.cte = [];
  }

  /* tags */
  if (typeof tags == 'undefined' && typeof tags != 'undefined') {
    this.tags = this.tagsProcess(rma.tags);
  } else if (typeof tags != 'undefined') {
    this.tags = this.tagsProcess(tags);
  } else {
    this.tags = '';
  }

  /* Unique ID on each initialise */
  this.id = this.uniqId();

  /* Tracked tracker */
  this.tracked = [];
  /* each engagement type should be track for only once and also the first tracker only */
  this.trackedEngagementType = [];
  /* trackers which should not have engagement type */
  this.engagementTypeExlude = [];
  /* first engagement */
  this.firstEngagementTracked = false;

  /* RMA Widget - Content Area */
  this.contentTag = document.getElementById('rma-widget');

  /* URL Path */
  this.path = typeof rma != 'undefined' ?
    rma.customize.src :
    '';

  /* Solve {2} issues */
  for (var i = 0; i < this.custTracker.length; i++) {
    if (this.custTracker[i].indexOf('{2}') != -1) {
      this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
    }
  }
};

/* Generate unique ID */
mads.prototype.uniqId = function() {

  return new Date().getTime();
}

mads.prototype.tagsProcess = function(tags) {

  var tagsStr = '';

  for (var obj in tags) {
    if (tags.hasOwnProperty(obj)) {
      tagsStr += '&' + obj + '=' + tags[obj];
    }
  }

  return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function(url) {

  if (typeof url != "undefined" && url != "") {

    if (typeof this.ct != 'undefined' && this.ct != '') {
      url = this.ct + encodeURIComponent(url);
    }

    if (typeof mraid !== 'undefined') {
      mraid.open(url);
    } else {
      window.open(url);
    }

    if (typeof this.cte != 'undefined' && this.cte != '') {
      this.imageTracker(this.cte);
    }
  }
}

/* tracker */
mads.prototype.tracker = function(tt, type, name, value) {

  /*
   * name is used to make sure that particular tracker is tracked for only once
   * there might have the same type in different location, so it will need the name to differentiate them
   */
  name = name || type;

  if (tt == 'E' && !this.fetTracked && this.fet) {
    for (var i = 0; i < this.fet.length; i++) {
      var t = document.createElement('img');
      t.src = this.fet[i];

      t.style.display = 'none';
      this.bodyTag.appendChild(t);
    }
    this.fetTracked = true;
  }

  if (typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1) {
    for (var i = 0; i < this.custTracker.length; i++) {
      var img = document.createElement('img');

      if (typeof value == 'undefined') {
        value = '';
      }

      /* Insert Macro */
      var src = this.custTracker[i].replace('{{rmatype}}', type);
      src = src.replace('{{rmavalue}}', value);

      /* Insert TT's macro */
      if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
        src = src.replace('tt={{rmatt}}', '');
      } else {
        src = src.replace('{{rmatt}}', tt);
        this.trackedEngagementType.push(tt);
      }

      /* Append ty for first tracker only */
      if (!this.firstEngagementTracked && tt == 'E') {
        src = src + '&ty=E';
        this.firstEngagementTracked = true;
      }

      /* */
      img.src = src + this.tags + '&' + this.id;

      img.style.display = 'none';
      this.bodyTag.appendChild(img);

      this.tracked.push(name);
    }
  }
};

mads.prototype.imageTracker = function(url) {
  for (var i = 0; i < url.length; i++) {
    var t = document.createElement('img');
    t.src = url[i];

    t.style.display = 'none';
    this.bodyTag.appendChild(t);
  }
}

/* Load JS File */
mads.prototype.loadJs = function(js, callback) {
  var script = document.createElement('script');
  script.src = js;

  if (typeof callback != 'undefined') {
    script.onload = callback;
  }

  this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function(href) {
  var link = document.createElement('link');
  link.href = href;
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');

  this.headTag.appendChild(link);
}

mads.prototype.extractEl = function(selectors) {
  var designFn = function(cssText) {
    var pattern = /([\w-]*)\s*:\s*([^;]*)/g
    var match, props = {}
    while (match = pattern.exec(cssText)) {
      props[match[1]] = match[2]
      this.style[match[1]] = match[2]
    }
  }

  var e = {}
  var els = this.contentTag.querySelectorAll(selectors)

  for (var _e in els) {
    if (els[_e].id) {
      e[els[_e].id] = els[_e]
      e[els[_e].id].design = designFn
    }
  }

  return e
}

var ad = function() {
  window.json = {
    'bgUrl': 'img/bg.png',
    'step1Url': 'img/step1.png',
    'step2Url': 'img/step2.png',
    'closeUrl': 'img/close.png'
  }
  this.app = new mads({ 'html5ad': this })
}

ad.prototype.render = function() {
  var data = this.app.data
  var _app = this.app
  _app.contentTag.innerHTML = '<div id="container">' +
    '<div id="leaf1"><img id="step1" src="' + data.step1Url + '" /><div id="mixmatch"></div></div>' +
    '<div id="leaf2"><img id="step2" src="' + data.step2Url + '" /><form id="form">' +
    '<input placeholder="Nama Lengkap" type="text" id="name" name="name" required>' +
    '<input placeholder="Email" type="email" id="email" name="email" required>' +
    '<input placeholder="No. Handphone" type="number" id="no" name="no" required>' +
    '<button type="submit" id="submit"><img id="submitimg" src="' + _app.path + 'img/submit.png"></button>' +
    '</form></div>' +
    '<div id="leaf3"><span style="font-family: Verdana, Geneva, sans-serif;position: absolute;bottom: 37px;left: 30px;font-weight: bold;letter-spacing: 2px;">NOCODE</span></div>' +
    '</div>'

  var shows = ['chikuwa', 'udang', 'paprika', 'saus', 'spaghetti', 'yuzu']
  var mat = []

  var initMixMatch = function(options) {
    var row = options.row || 3
    var col = options.col || 4
    var container = _app.contentTag.querySelector('#mixmatch')

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var getMatrix = function(matrix) {
      if (!matrix) var matrix = []
      var total = matrix.length
      var i = getRandomInt(0, 5)

      if (total < 12) {
        matrix.push(shows[i])
        var d = matrix.getDuplicates()[shows[i]]
        if (d && d.length >= 3) {
          matrix.pop()
        }
        return getMatrix(matrix)
      } else {
        return matrix
      }
    }

    var matrix = getMatrix()
    var indexM = 0
    for (var i = 0; i < row; i++) {
      for (var j = 0; j < col; j++) {
        var card = document.createElement('div')
        var cardId = 'card_r' + i + 'c' + j
        card.style.left = (80 * j) + 3 + 'px'
        card.style.top = (80 * i) + 3 + 'px'
        card.className = 'card ' + matrix[indexM]
        card.innerHTML = '<img id="' + cardId + '_front" class="front" style="transform:rotateY(0deg)" src="' + data.closeUrl + '" />'
        card.innerHTML += '<img id="' + cardId + '_back" style="transform:rotateY(180deg)" class="back" src="' + _app.path + 'img/' + matrix[indexM] + '.png" />'
        container.appendChild(card)
        indexM++
      }
    }
    mat = matrix
  }

  var game = initMixMatch({})

  this.matrix = mat
}

ad.prototype.style = function() {
  var el = this.app.extractEl('div, img, button, form, input'),
    data = this.app.data

  var designFn = function(cssText) {
    var pattern = /([\w-]*)\s*:\s*([^;]*)/g
    var match, props = {}
    while (match = pattern.exec(cssText)) {
      props[match[1]] = match[2]
      this.style[match[1]] = match[2]
    }
  }

  var WH = 'width:320px;height:480px;',
    A = 'position:absolute;left:0;top:0;'

  el.container.design(WH + 'background:url(' + data.bgUrl + ')')
  el.leaf1.design(WH + 'display:block;opacity:1;transition:opacity 1s;')
  el.leaf2.design(WH + A + 'display:none;opacity:0;transition:opacity 1s;')
  el.leaf3.design(WH + A + 'display:none;opacity:0;transition:opacity 1s;background:url(' + this.app.path + 'img/final_screen.png)')
  el.step1.design(A + 'top:190px;left:' + (320 / 2 - 272 / 2) + 'px;')
  el.step2.design(A + 'top:180px;left:' + (320 / 2 - 272 / 2) + 'px;')
  el.mixmatch.design(A + 'width:320px;text-align:center;top:235px;height:245px;')
  el.submit.design(A + 'background-color:transparent;border-color: transparent;left:190px;top:180px;')

  el.form.design(A + 'width:320px;text-align:center;top:245px;')
  el.name.design('padding:10px;border-radius:5px;border:2px solid #940709;width:260px;color:#940709;')
  el.email.design('padding:10px;border-radius:5px;border:2px solid #940709;width:260px;margin-top: 10px;color:#940709;')
  el.no.design('padding:10px;border-radius:5px;border:2px solid #940709;width:260px;margin-top: 10px;color:#940709;')


  var cards = this.app.contentTag.querySelectorAll('.card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].design = designFn
    cards[i].design('position: absolute; margin:0; display: block; transform-style: preserve-3d;transition: transform 0.6s;')
    var imgs = cards[i].querySelectorAll('img')
    for (var j = 0; j < imgs.length; j++) {
      imgs[j].design = designFn
      imgs[j].design('-webkit-backface-visibility:hidden;backface-visibility:hidden;position:absolute;')
    }
  }

  this.cards = cards
  this.el = el
}

ad.prototype.events = function() {
  var _app = this.app;
  var el = this.el
  var cards = this.cards;
  var opened = []
  var disableAll = false
  var match = 0
  var d = false
  var designFn = function(cssText) {
    var pattern = /([\w-]*)\s*:\s*([^;]*)/g
    var match, props = {}
    while (match = pattern.exec(cssText)) {
      props[match[1]] = match[2]
      this.style[match[1]] = match[2]
    }
  }

  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', function(e) {
      if (d) {
        e.stopPropagation();
        e.preventDefault();


        el.leaf1.design('opacity:0')
        el.leaf2.design('display:block')
        setTimeout(function() {
          el.leaf2.design('opacity:1')
          el.leaf1.design('display:none')
        }, 600)


        return false;
      }
      if (disableAll) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      this.design = designFn
      this.style.transform = 'translateX(75.5px) rotateY(180deg)'
      this.design('-webkit-transform: ' + this.style.transform)

      opened.push(this)
      if (opened.length === 2 && opened[0].className !== opened[1].className) {
        disableAll = true;
        setTimeout(function() {
          opened[0].style.transform = 'rotateY(0deg)'
          opened[1].style.transform = 'rotateY(0deg)'
        }, 1000)
        setTimeout(function() {
          disableAll = false
          opened = []

        }, 1200)
      } else if (opened.length === 2 && opened[0].className === opened[1].className) {
        opened = []

        match += 1

        if (match >= 6) {
          setTimeout(function() {
            el.leaf1.design('opacity:0')
            el.leaf2.design('display:block')
            setTimeout(function() {
              el.leaf2.design('opacity:1')
              el.leaf1.design('display:none')
            }, 1000)
          }, 2000)

        }
      }
    })
  }

  el.form.addEventListener('submit', function(e) {
    e.stopPropagation()
    e.preventDefault()

    setTimeout(function() {
      el.leaf2.design('opacity:0')
      el.leaf3.design('display:block')
      setTimeout(function() {
        el.leaf3.design('opacity:1')
        el.leaf2.design('display:none')
      }, 1000)
    }, 1500)
  })
}

var pizzahut = new ad()

Array.prototype.getDuplicates = function() {
  var duplicates = {};
  for (var i = 0; i < this.length; i++) {
    if (duplicates.hasOwnProperty(this[i])) {
      duplicates[this[i]].push(i);
    } else if (this.lastIndexOf(this[i]) !== i) {
      duplicates[this[i]] = [i];
    }
  }

  return duplicates;
};
