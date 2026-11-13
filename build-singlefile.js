/* 节奏小奶蛙 - 单文件构建：把 CSS/JS 全部内联、图片转 base64，输出 dist/index.html */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
fs.mkdirSync(OUT, { recursive: true });

const b64 = p => 'data:' + (path.extname(p) === '.png' ? 'image/png' : 'image/jpeg') + ';base64,' +
  fs.readFileSync(p).toString('base64');
const cutURI = b64(path.join(ROOT, 'assets', 'character', 'frog-cut.png'));
const origURI = b64(path.join(ROOT, 'assets', 'character', 'frog-original.jpg'));

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* 1) CSS 内联 */
html = html.replace(/<link rel="stylesheet" href="css\/main.css">/, () => {
  const css = fs.readFileSync(path.join(ROOT, 'css', 'main.css'), 'utf8');
  return '<style>\n' + css + '\n</style>';
});

/* 2) 29 个 JS 按原顺序内联 */
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  const code = fs.readFileSync(path.join(ROOT, src), 'utf8');
  if (/<\/script/i.test(code)) throw new Error('script content contains </script>: ' + src);
  return '<script>\n' + code + '\n</script>';
});

/* 3) HTML 里的图片引用 → data URI（img 标签 + og:image） */
html = html.split('assets/character/frog-original.jpg').join(origURI);

/* 4) frog.js 内的图片路径字符串 → data URI（在整份 HTML 上做，覆盖已内联代码） */
html = html.split("'assets/character/frog-cut.png'").join("'" + cutURI + "'");
html = html.split("'assets/character/frog-original.jpg'").join("'" + origURI + "'");

/* 残留相对资源引用检查 */
const leftover = html.match(/(?:src|href)="(?!data:)[^"]+"/g) || [];
const out = path.join(OUT, 'index.html');
fs.writeFileSync(out, html);
console.log('OK', out, (fs.statSync(out).size / 1024).toFixed(1) + ' KB', 'leftoverRefs=' + leftover.length);
if (leftover.length) console.log(leftover.join('\n'));
