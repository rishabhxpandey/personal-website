// File-tree navigation, theme toggle, runtime-assembled email,
// keyboard nav, and the footer terminal.

(function () {
  'use strict';

  var FILES = [
    'README.md',
    'skills.yaml',
    'experience/meta.md',
    'experience/geico.md',
    'experience/texas-instruments.md',
    'projects/paste-service.md',
    'projects/interview-agent.md',
    'history.log',
    'contact.json'
  ];
  var DIRS = { 'experience': true, 'projects': true };
  var DEFAULT_FILE = FILES[0];

  var pages = document.querySelectorAll('.page');
  var treeItems = document.querySelectorAll('.tree-item');
  var breadcrumb = document.getElementById('breadcrumb-path');
  var pane = document.querySelector('.pane');

  function currentFileFromHash() {
    var f = decodeURIComponent(location.hash.replace(/^#/, ''));
    return FILES.indexOf(f) !== -1 ? f : DEFAULT_FILE;
  }

  function render() {
    var file = currentFileFromHash();
    pages.forEach(function (p) {
      p.hidden = p.dataset.file !== file;
    });
    treeItems.forEach(function (t) {
      t.classList.toggle('active', t.dataset.file === file);
    });
    breadcrumb.textContent = file;
    document.title = file + ' — Rishabh Pandey';
    pane.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function navigate(file) {
    if (file === currentFileFromHash()) render();
    else location.hash = file;
  }

  treeItems.forEach(function (t) {
    t.addEventListener('click', function () {
      navigate(t.dataset.file);
    });
  });

  window.addEventListener('hashchange', render);
  render();

  // ===== Theme toggle — persists across visits =====
  var toggle = document.getElementById('theme-toggle');

  function isDark() {
    return document.documentElement.dataset.theme === 'dark';
  }

  function setTheme(next) {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('rp-theme', next); } catch (e) {}
    toggle.textContent = next === 'dark' ? '☼ light' : '☾ dark';
  }

  toggle.addEventListener('click', function () {
    setTheme(isDark() ? 'light' : 'dark');
  });

  toggle.textContent = isDark() ? '☼ light' : '☾ dark';

  // ===== Email assembled at runtime so scrapers (and Cloudflare-style
  // rewriters) can't mangle it into "[email protected]". =====
  var email = ['email', '.', 'rishabhp', '@', 'gmail', '.', 'com'].join('');
  var emailLink = document.getElementById('email-link');
  emailLink.textContent = '"' + email + '"';
  emailLink.href = 'mailto:' + email;

  // ===== Keyboard nav — j/k or arrows step through the file tree =====
  window.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

    var step = 0;
    if (e.key === 'j' || e.key === 'ArrowDown') step = 1;
    else if (e.key === 'k' || e.key === 'ArrowUp') step = -1;
    else return;

    e.preventDefault();
    var idx = FILES.indexOf(currentFileFromHash());
    var next = Math.min(FILES.length - 1, Math.max(0, idx + step));
    navigate(FILES[next]);
  });

  // ===== Footer terminal =====
  var terminal = document.getElementById('terminal');
  var output = document.getElementById('term-output');
  var typed = document.getElementById('term-typed');
  var input = document.getElementById('term-input');
  var hint = document.getElementById('term-hint');
  var MAX_LINES = 80;

  function promptHTML() {
    return '<span class="cmd-user">rishabh@web</span>:<span class="cmd-dir">~</span>$ ';
  }

  function addLine(text, cls, html) {
    var div = document.createElement('div');
    div.className = cls || 'term-out';
    if (html) div.innerHTML = html + escapeHTML(text);
    else div.textContent = text;
    output.appendChild(div);
    while (output.children.length > MAX_LINES) output.removeChild(output.firstChild);
  }

  function escapeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function echoCommand(raw) {
    addLine(raw, 'term-out', promptHTML());
  }

  function say(lines) {
    (Array.isArray(lines) ? lines : [lines]).forEach(function (l) {
      addLine(l, 'term-out');
    });
  }

  function fail(line) {
    addLine(line, 'term-err');
  }

  // Resolve "meta.md" or "experience/meta.md" to a known file
  function resolveFile(name) {
    name = name.replace(/^\.\//, '').replace(/\/$/, '');
    if (FILES.indexOf(name) !== -1) return name;
    var matches = FILES.filter(function (f) {
      return f.split('/').pop() === name;
    });
    return matches.length === 1 ? matches[0] : null;
  }

  function lsOutput(arg) {
    if (!arg) {
      return ['README.md  skills.yaml  experience/  projects/  history.log  contact.json'];
    }
    var dir = arg.replace(/\/$/, '');
    if (!DIRS[dir]) return null;
    return [FILES.filter(function (f) { return f.indexOf(dir + '/') === 0; })
      .map(function (f) { return f.split('/').pop(); }).join('  ')];
  }

  function run(raw) {
    var line = raw.trim();
    echoCommand(line);
    if (!line) return;

    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var arg = parts.slice(1).join(' ');

    switch (cmd) {
      case 'help':
        say([
          'help            this list',
          'ls [dir]        list files',
          'cat <file>      open a file',
          'git log         career history',
          'whoami          who am i',
          'theme           toggle light/dark',
          'clear           clear terminal',
          'j / k           also work outside the prompt'
        ]);
        break;

      case 'ls': {
        var out = lsOutput(arg);
        if (out) say(out);
        else fail('ls: ' + arg + ': no such directory');
        break;
      }

      case 'cat': {
        if (!arg) { fail('cat: missing operand — try `cat README.md`'); break; }
        if (DIRS[arg.replace(/\/$/, '')]) { fail('cat: ' + arg + ': is a directory'); break; }
        var f = resolveFile(arg);
        if (f) { say('opening ' + f + ' …'); navigate(f); }
        else fail('cat: ' + arg + ': no such file');
        break;
      }

      case 'git':
        if (arg.indexOf('log') === 0) { say('opening history.log …'); navigate('history.log'); }
        else fail("git: '" + (arg || '') + "' is not a git command here. try `git log`.");
        break;

      case 'whoami':
        say('rishabh pandey — production engineer @ meta. purdue cs, dec 2024.');
        break;

      case 'pwd':
        say('/home/rishabh');
        break;

      case 'theme':
        setTheme(isDark() ? 'light' : 'dark');
        say('theme set to ' + document.documentElement.dataset.theme);
        break;

      case 'clear':
        output.innerHTML = '';
        break;

      case 'echo':
        say(arg);
        break;

      case 'sudo':
        if (/hire([ -]?me)?/.test(arg)) {
          say('permission granted. opening contact.json …');
          navigate('contact.json');
        } else {
          fail('sudo: ' + (arg || '') + ': permission denied (try `sudo hire-me`)');
        }
        break;

      case 'rm':
        fail('rm: permission denied — this portfolio is write-protected');
        break;

      case 'vim':
      case 'nano':
      case 'emacs':
        say(cmd + ': no editors here. the files are read-only — try `cat`.');
        break;

      case 'exit':
      case 'logout':
        say('there is no escape. try `cat contact.json` instead.');
        break;

      default:
        fail('command not found: ' + cmd + ' — try `help`');
    }
  }

  function tabComplete() {
    var val = input.value;
    var m = val.match(/^(cat|ls)\s+(\S*)$/i);
    var candidates, prefix, base;
    if (m) {
      base = m[1] + ' ';
      prefix = m[2];
      candidates = FILES.concat(['experience/', 'projects/']);
    } else if (/^\S*$/.test(val)) {
      base = '';
      prefix = val;
      candidates = ['help', 'ls', 'cat', 'git log', 'whoami', 'theme', 'clear'];
    } else {
      return;
    }
    var hits = candidates.filter(function (c) {
      return prefix && c.indexOf(prefix) === 0;
    });
    if (hits.length === 1) {
      input.value = base + hits[0];
      syncTyped();
    } else if (hits.length > 1) {
      say(hits.join('  '));
    }
  }

  function syncTyped() {
    typed.textContent = input.value;
    hint.style.display = input.value || output.children.length ? 'none' : '';
  }

  terminal.addEventListener('click', function () {
    input.focus({ preventScroll: true });
  });

  input.addEventListener('input', syncTyped);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      run(input.value);
      input.value = '';
      syncTyped();
      pane.scrollTop = pane.scrollHeight;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      tabComplete();
    } else if (e.key === 'Escape') {
      input.blur();
    }
  });
})();
