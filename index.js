var fs = require('fs');


module.exports = function(filename, outfile) {

    fs.readFile(filename, function(err, content) {
        content = content.toString();
        content = content.split(/\n|\r\n/);

        content = content.map(function(v) {
            v = v.replace(/^%\s*(.*)\s*$/, function(input, c) {
                //替换主题
                return '# ' + c;
            }).replace(/(#{1,})([^\s#]+)/, function(input, t, c) {
                return t + ' ' + c;
            });
            return v;
        })

        //处理代码缩进格式
        var tagStart = false;
        var blankLength = 4;
        for (var i = 0, len = content.length; i < len; i++) {
            var c = content[i];

            if (tagStart) {
                //进入代码了
                var reg = new RegExp('^\\s{' + blankLength + '}(.*)$');
                var nextLine = content[i + 1];
                c = c.replace(reg, function(input, c) {
                    // console.log(2222, c, !reg.test(nextLine));
                    return c;
                });
                if (nextLine && !reg.test(nextLine) && nextLine.trim() !== '') {
                    tagStart = false;
                    c += '\n```';
                }
                content[i] = c;
            } else if (c.trim() && /^\s{4,}/.test(c) && !/^\s{4,}\*/.test(c)) {
                if (/^\s*[:]{3,}([\w]+)\s*$/.test(c)) {
                    c = c.replace(/^(\s{4,})[:]{3,}(\w+)\s*$/, function(input, b, c) {
                        //替换代码
                        tagStart = true;
                        blankLength = b.length;
                        return '```' + (c === 'javascript' ? 'js' : c);
                    });
                    content[i] = c;
                } else {
                    content[i] = c.replace(/^(\s{4,})(.*)/, function(input, b, c) {
                        //替换代码
                        tagStart = true;
                        blankLength = b.length;
                        return '```\n' + c;
                    });
                }
            }
        }
        if (tagStart) {
            //还没闭合
            content.push('```\n');
        }



        //处理表格
        tagStart = false;
        for (var i = 0, len = content.length; i < len; i++) {
            var c = content[i];
            if (tagStart) {
                var nextLine = content[i + 1];
                if (!/\s*\|/.test(nextLine)) {
                    tagStart = false;
                }
            } else if (/^\s*\|.*\|\s*$/.test(c)) {
                tagStart = true;
                var thead = [];
                c = c.split('|').map(function(v) {
                    thead.push(new Array(v.length * 2 - 1).join('-'));
                    return v.replace(/^\s*\*|\*\s*$/g, function() {
                        return ''
                    });
                });
                thead = thead.join('|');
                content[i] = c.join('|') + '\n|' + thead + '|';
            }
        }

        if (typeof outfile === 'string') {
            fs.writeFile(outfile, content.join('\n'));
            console.log('生成文件：' + outfile);
        } else {
            console.log(content.join('\n'));
        }
    })

}
